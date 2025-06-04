const express = require('express');
const cors = require('cors');
const db = require('./database');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.json());

// 🔧 民國年轉西元年函數
function toAD(rocDate) {
  // 若格式為 YYYY-MM-DD（已是西元），直接回傳
  if (rocDate.includes('-')) return rocDate;

  const [year, month, day] = rocDate.split('/');
  const adYear = parseInt(year) + 1911;
  return `${adYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

// 新增房價資料（支援民國年）
app.post('/add-price', (req, res) => {
  let { date, location, price, size } = req.body;
  date = toAD(date); // ✨轉為西元

  const sql = `
    INSERT INTO house_prices (date, location, price, size)
    VALUES (?, ?, ?, ?)
  `;
  db.run(sql, [date, location, price, size], function (err) {
    if (err) {
      console.error('新增失敗:', err.message);
      return res.status(500).json({ error: '資料新增失敗' });
    }
    res.json({ message: '新增成功', id: this.lastID });
  });
});

// 顯示所有房價資料
app.get('/prices', (req, res) => {
  const sql = `SELECT * FROM house_prices ORDER BY date ASC`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: '查詢失敗' });
    }
    res.json(rows);
  });
});

// 查詢指定日期範圍（YYYY-MM-DD）
app.get('/search', (req, res) => {
  const { start, end } = req.query;
  const sql = `
    SELECT * FROM house_prices
    WHERE date BETWEEN ? AND ?
    ORDER BY date ASC
  `;
  db.all(sql, [start, end], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: '查詢失敗' });
    }
    res.json(rows);
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
