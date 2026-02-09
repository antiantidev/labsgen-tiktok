const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

class DBService {
  constructor(userDataPath) {
    this.dbPath = path.join(userDataPath, 'app.db');
    this.db = null;
  }

  init() {
    try {
      this.db = new Database(this.dbPath, { verbose: null });
      this.db.pragma('journal_mode = WAL');
      this._createTables();
      return true;
    } catch (err) {
      console.error('Failed to initialize SQLite:', err);
      return false;
    }
  }

  _createTables() {
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        name TEXT,
        type TEXT,
        token TEXT,
        username TEXT,
        lastUsed INTEGER
      )
    `).run();

    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `).run();

    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS system_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level TEXT,
        message TEXT,
        timestamp TEXT
      )
    `).run();

    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT,
        short_name TEXT
      )
    `).run();
  }

  saveAccount(acc) {
    const upsert = this.db.prepare(`
      INSERT INTO accounts (id, name, type, token, username, lastUsed)
      VALUES (@id, @name, @type, @token, @username, @lastUsed)
      ON CONFLICT(id) DO UPDATE SET
        name=excluded.name,
        token=excluded.token,
        username=excluded.username,
        lastUsed=excluded.lastUsed
    `);
    return upsert.run(acc);
  }

  getAllAccounts() {
    return this.db.prepare('SELECT * FROM accounts ORDER BY lastUsed DESC').all();
  }

  deleteAccount(id) {
    return this.db.prepare('DELETE FROM accounts WHERE id = ?').run(id);
  }

  getSetting(key, defaultValue = null) {
    const row = this.db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
    return row ? JSON.parse(row.value) : defaultValue;
  }

  saveSetting(key, value) {
    return this.db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, JSON.stringify(value));
  }

  // Categories Logic
  clearCategories() {
    return this.db.prepare('DELETE FROM categories').run();
  }

  saveCategories(list) {
    if (!list || list.length === 0) return;
    
    const insert = this.db.prepare('INSERT OR REPLACE INTO categories (id, name, short_name) VALUES (@id, @name, @short_name)');
    
    // Lọc trùng lặp ngay trong bộ nhớ trước khi ghi
    const uniqueItems = new Map();
    for (const item of list) {
      if (item.game_mask_id) {
        uniqueItems.set(item.game_mask_id, {
          id: item.game_mask_id,
          name: item.full_name,
          short_name: item.short_name || ''
        });
      }
    }

    const transaction = this.db.transaction((items) => {
      for (const item of items) {
        insert.run(item);
      }
    });
    
    transaction(Array.from(uniqueItems.values()));
  }

  searchLocalCategories(query) {
    return this.db.prepare("SELECT id as game_mask_id, name as full_name FROM categories WHERE name LIKE ? LIMIT 20")
      .all(`%${query}%`);
  }

  getCategoryByName(name) {
    return this.db.prepare("SELECT id as game_mask_id, name as full_name FROM categories WHERE name = ? COLLATE NOCASE")
      .get(name);
  }

  getCategoryCount() {
    const row = this.db.prepare('SELECT COUNT(*) as count FROM categories').get();
    return row ? row.count : 0;
  }
}

module.exports = { DBService };
