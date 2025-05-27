const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 將資料庫檔案儲存在 db 資料夾下
const dbPath = path.join(__dirname, 'db', 'bubble_tea.db');
const db = new sqlite3.Database(dbPath);

// 建立資料表（含新欄位 store）
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS bubble_tea_prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      item_name TEXT NOT NULL,
      price REAL NOT NULL,
      store TEXT NOT NULL
    )
  `);
});

module.exports = db;
