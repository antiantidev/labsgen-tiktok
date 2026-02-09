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
      this.db = new Database(this.dbPath, { verbose: console.log });
      this.db.pragma('journal_mode = WAL'); // Tối ưu hiệu năng ghi
      this._createTables();
      return true;
    } catch (err) {
      console.error('Failed to initialize SQLite:', err);
      return false;
    }
  }

  _createTables() {
    // Bảng lưu trữ tài khoản
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

    // Bảng lưu cấu hình hệ thống (key-value)
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `).run();

    // Bảng lưu nhật ký hệ thống (thay thế dần cho mảng trong RAM)
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS system_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level TEXT,
        message TEXT,
        timestamp TEXT
      )
    `).run();
  }

  // Helper cho Accounts
  getAllAccounts() {
    return this.db.prepare('SELECT * FROM accounts ORDER BY lastUsed DESC').all();
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

  deleteAccount(id) {
    return this.db.prepare('DELETE FROM accounts WHERE id = ?').run(id);
  }

  // Helper cho Settings
  getSetting(key, defaultValue = null) {
    const row = this.db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
    return row ? JSON.parse(row.value) : defaultValue;
  }

  saveSetting(key, value) {
    return this.db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, JSON.stringify(value));
  }
}

module.exports = { DBService };
