const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 指向 SQLite 資料庫檔案
const dbPath = path.join(__dirname, 'db', 'house_prices.db');
const db = new sqlite3.Database(dbPath);

// 建立資料表
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS house_prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      location TEXT NOT NULL,
      price REAL NOT NULL,
      size TEXT NOT NULL
    )
  `);
});

module.exports = db;
