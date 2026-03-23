import path from "node:path"
import type { StreamCategory, SystemLogEntry } from "../../shared/ipc/contracts"

const BetterSqlite3 = require("better-sqlite3") as (
  filePath: string,
  options?: { verbose?: null | ((message?: unknown) => void) }
) => SqliteDatabase

type SqliteStatement = {
  run: (...args: unknown[]) => unknown
  get: (...args: unknown[]) => Record<string, unknown> | undefined
  all: (...args: unknown[]) => Array<Record<string, unknown>>
}

type SqliteDatabase = {
  pragma: (text: string) => unknown
  prepare: (sql: string) => SqliteStatement
  transaction: <T>(fn: (items: T[]) => void) => (items: T[]) => void
}

function createUninitializedDb(): SqliteDatabase {
  const throwUninitialized = () => {
    throw new Error("Database is not initialized.")
  }

  return {
    pragma: throwUninitialized,
    prepare: () => ({
      run: throwUninitialized,
      get: throwUninitialized,
      all: throwUninitialized
    }),
    transaction: () => {
      return () => throwUninitialized()
    }
  }
}

type DbAccount = {
  id: string
  name: string
  type: string
  token: string
  username?: string
  lastUsed?: number
}

type DbCategoryInput = {
  game_mask_id: string
  full_name: string
  short_name?: string
}

type DbCategoryRow = {
  id: string
  name: string
  short_name: string
}

export class DBService {
  public readonly dbPath: string
  public db: SqliteDatabase

  constructor(userDataPath: string) {
    this.dbPath = path.join(userDataPath, "app.db")
    this.db = createUninitializedDb()
  }

  init(): boolean {
    try {
      this.db = BetterSqlite3(this.dbPath, { verbose: null })
      this.db.pragma("journal_mode = WAL")
      this.createTables()
      return true
    } catch (err) {
      console.error("Failed to initialize SQLite:", err)
      return false
    }
  }

  private getDb(): SqliteDatabase {
    return this.db
  }

  private createTables(): void {
    const db = this.getDb()
    db.prepare(`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        name TEXT,
        type TEXT,
        token TEXT,
        username TEXT,
        lastUsed INTEGER
      )
    `).run()

    db.prepare(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `).run()

    db.prepare(`
      CREATE TABLE IF NOT EXISTS system_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level TEXT,
        message TEXT,
        timestamp TEXT
      )
    `).run()

    db.prepare(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT,
        short_name TEXT
      )
    `).run()
  }

  addSystemLog(level: string, message: string, timestamp = new Date().toISOString()): { lastInsertRowid?: number | string } {
    return this.getDb()
      .prepare("INSERT INTO system_logs (level, message, timestamp) VALUES (?, ?, ?)")
      .run(level, message, timestamp) as { lastInsertRowid?: number | string }
  }

  getSystemLogs(limit = 500, offset = 0): SystemLogEntry[] {
    return this.getDb().prepare("SELECT * FROM system_logs ORDER BY id DESC LIMIT ? OFFSET ?").all(limit, offset) as SystemLogEntry[]
  }

  getSystemLogCount(): number {
    const row = this.getDb().prepare("SELECT COUNT(*) as count FROM system_logs").get()
    return Number(row?.count || 0)
  }

  clearSystemLogs(): unknown {
    return this.getDb().prepare("DELETE FROM system_logs").run()
  }

  pruneSystemLogs(limit: number): void {
    if (!limit || limit <= 0) return
    this.getDb()
      .prepare("DELETE FROM system_logs WHERE id IN (SELECT id FROM system_logs ORDER BY id DESC LIMIT -1 OFFSET ?)")
      .run(limit)
  }

  getDbPath(): string {
    return this.dbPath
  }

  saveAccount(acc: DbAccount): unknown {
    const upsert = this.getDb().prepare(`
      INSERT INTO accounts (id, name, type, token, username, lastUsed)
      VALUES (@id, @name, @type, @token, @username, @lastUsed)
      ON CONFLICT(id) DO UPDATE SET
        name=excluded.name,
        token=excluded.token,
        username=excluded.username,
        lastUsed=excluded.lastUsed
    `)
    return upsert.run(acc)
  }

  getAllAccounts(): DbAccount[] {
    return this.getDb().prepare("SELECT * FROM accounts ORDER BY lastUsed DESC").all() as DbAccount[]
  }

  deleteAccount(id: string): unknown {
    return this.getDb().prepare("DELETE FROM accounts WHERE id = ?").run(id)
  }

  getSetting<T = unknown>(key: string, defaultValue?: T): T {
    const row = this.getDb().prepare("SELECT value FROM settings WHERE key = ?").get(key)
    return row?.value ? (JSON.parse(String(row.value)) as T) : (defaultValue as T)
  }

  saveSetting(key: string, value: unknown): unknown {
    return this.getDb().prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run(key, JSON.stringify(value))
  }

  clearCategories(): unknown {
    return this.getDb().prepare("DELETE FROM categories").run()
  }

  saveCategories(list: DbCategoryInput[]): void {
    if (!list || list.length === 0) return

    const insert = this.getDb().prepare(
      "INSERT OR REPLACE INTO categories (id, name, short_name) VALUES (@id, @name, @short_name)"
    )

    const uniqueItems = new Map<string, DbCategoryRow>()
    for (const item of list) {
      if (item.game_mask_id) {
        uniqueItems.set(item.game_mask_id, {
          id: item.game_mask_id,
          name: item.full_name,
          short_name: item.short_name || ""
        })
      }
    }

    const transaction = this.getDb().transaction<DbCategoryRow>((items) => {
      for (const item of items) {
        insert.run(item)
      }
    })
    transaction(Array.from(uniqueItems.values()))
  }

  searchLocalCategories(query: string): StreamCategory[] {
    return this.getDb()
      .prepare("SELECT id as game_mask_id, name as full_name FROM categories WHERE name LIKE ? LIMIT 20")
      .all(`%${query}%`) as StreamCategory[]
  }

  getCategoryByName(name: string): StreamCategory | null {
    return (
      this.getDb()
        .prepare("SELECT id as game_mask_id, name as full_name FROM categories WHERE name = ? COLLATE NOCASE")
        .get(name) as StreamCategory | undefined
    )
      || null
  }

  getCategoryCount(): number {
    const row = this.getDb().prepare("SELECT COUNT(*) as count FROM categories").get()
    return Number(row?.count || 0)
  }
}
