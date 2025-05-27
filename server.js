const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

// 新增價格資料（含店家）
app.post('/add-price', (req, res) => {
  const { date, item_name, price, store } = req.body;
  const sql = `
    INSERT INTO bubble_tea_prices (date, item_name, price, store)
    VALUES (?, ?, ?, ?)
  `;
  db.run(sql, [date, item_name, price, store], function (err) {
    if (err) {
      console.error('新增失敗:', err.message);
      return res.status(500).json({ error: '資料新增失敗' });
    }
    res.json({ message: '新增成功', id: this.lastID });
  });
});

// 查詢所有價格資料
app.get('/prices', (req, res) => {
  const sql = `SELECT * FROM bubble_tea_prices ORDER BY date ASC`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: '查詢失敗' });
    }
    res.json(rows);
  });
});

// 啟動伺服器（可改 port）
const PORT = 3001; // 你可以改為其他可用的 port
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
