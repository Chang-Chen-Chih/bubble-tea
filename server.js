// server.js
const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

// 新增珍奶價格
app.post('/add-price', (req, res) => {
  const { date, item_name, price } = req.body;
  const sql = `INSERT INTO bubble_tea_prices (date, item_name, price) VALUES (?, ?, ?)`;
  db.run(sql, [date, item_name, price], function (err) {
    if (err) {
      return res.status(500).json({ error: '資料新增失敗' });
    }
    res.json({ message: '新增成功', id: this.lastID });
  });
});

// 查詢所有價格紀錄
app.get('/prices', (req, res) => {
  const sql = `SELECT * FROM bubble_tea_prices ORDER BY date ASC`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: '查詢失敗' });
    }
    res.json(rows);
  });
});

// 啟動伺服器
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
