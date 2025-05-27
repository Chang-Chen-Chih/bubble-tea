// database.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./bubble_tea.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS bubble_tea_prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      item_name TEXT NOT NULL,
      price REAL NOT NULL
    )
  `);
});

module.exports = db;
