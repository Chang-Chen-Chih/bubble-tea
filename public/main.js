const API_BASE = 'http://localhost:3001';
let chart;
let chartType = 'line';
let lastData = [];

async function loadPrices(query = null) {
    let url = `${API_BASE}/prices`;
    if (query && query.start && query.end) {
        url = `${API_BASE}/search?start=${query.start}&end=${query.end}`;
    }
    const res = await fetch(url);
    const data = await res.json();
    lastData = data;
    renderTable(data);
    updateChart(data);
}

function renderTable(data) {
    const tbody = document.getElementById('priceTableBody');
    tbody.innerHTML = '';
    data.forEach(row => {
        const price = parseFloat(row.price);
        const size = parseFloat(row.size);
        const unitPrice = (!isNaN(price) && !isNaN(size) && size !== 0) ? (price / size).toFixed(2) : 'N/A';

        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td class="border px-4 py-2">${row.date}</td>
      <td class="border px-4 py-2">${row.location}</td>
      <td class="border px-4 py-2">${row.price}</td>
      <td class="border px-4 py-2">${row.size}</td>
      <td class="border px-4 py-2">${unitPrice}</td>
      <td class="border px-4 py-2">
        <button class="bg-red-500 hover:bg-red-600 text-white font-semibold px-3 py-1 rounded shadow" onclick="deletePrice(${row.id})">刪除</button>
      </td>
    `;
        tbody.appendChild(tr);
    });
}

function updateChart(data) {
    try {
        // 檢查 Chart.js 是否有載入
        if (typeof Chart === 'undefined') {
            console.error('Chart.js 尚未載入');
            return;
        }

        // 按日期排序（避免亂序）
        const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

        // 如果資料太多，進行抽樣（最多畫 50 筆）
        let displayData = sortedData;
        if (sortedData.length > 50) {
            const step = Math.ceil(sortedData.length / 50);
            displayData = sortedData.filter((_, index) => index % step === 0);
        }

        // X 軸 → 日期
        const dates = displayData.map(row => row.date);

        // Y 軸 → 單價（萬元/坪）
        const unitPrices = displayData.map(row => {
            const price = parseFloat(row.price);
            const size = parseFloat(row.size);
            return (!isNaN(price) && !isNaN(size) && size !== 0) ? (price / size).toFixed(2) : 0;
        });

        // 如果已存在圖表，先銷毀
        if (chart) {
            chart.destroy();
        }

        // 建立新的 Chart
        const ctx = document.getElementById('priceChart').getContext('2d');
        chart = new Chart(ctx, {
            type: chartType,
            data: {
                labels: dates,
                datasets: [{
                    label: '單價（萬元/坪）',
                    data: unitPrices,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4, // 平滑曲線
                    pointRadius: 3,
                    pointHoverRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                animation: {
                    duration: 1000
                },
                plugins: {
                    title: {
                        display: true,
                        text: '單價趨勢變化（萬元/坪）'
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return `每坪 NT$ ${context.raw} 萬`;
                            }
                        }
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    },
                    y: {
                        min: 0,
                        max: 100, // 你可以依實際狀況調整最大值
                        ticks: {
                            stepSize: 10,
                            callback: function (value) {
                                return `${value} 萬元/坪`;
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('更新圖表時發生錯誤:', error);
        // 如果你有 showToast 可以加上這行，提示錯誤
        // showToast('更新圖表失敗', 'error');
    }
}

function updateLocationAvgPriceChart(data) {
  const locationMap = {};

  data.forEach(row => {
    // ➜ 擷取區名稱
    const match = row.location.match(/^(.*?)區/);
    const area = match ? match[1] + '區' : '其他';

    const price = parseFloat(row.price);
    const size = parseFloat(row.size);
    const unitPrice = (!isNaN(price) && !isNaN(size) && size !== 0) ? (price / size) : 0;

    if (!locationMap[area]) {
      locationMap[area] = { sum: 0, count: 0 };
    }

    // ➜ 累加這個區的單價
    locationMap[area].sum += unitPrice;
    locationMap[area].count += 1;
  });

  // ➜ 整理資料準備畫圖
  const locations = [];
  const avgUnitPrices = [];

  Object.keys(locationMap).forEach(area => {
    const avg = locationMap[area].sum / locationMap[area].count;
    locations.push(area);
    avgUnitPrices.push(avg.toFixed(2));
  });

  // ➜ 畫圖
  if (chart) {
    chart.destroy();
  }

  const ctx = document.getElementById('priceChart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: locations,
      datasets: [{
        label: '平均單價（萬元/坪）',
        data: avgUnitPrices,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        title: {
          display: true,
          text: '各地區平均單價（萬元/坪）'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `每坪 NT$ ${context.raw} 萬`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return `${value} 萬元/坪`;
            }
          }
        }
      }
    }
  });

  // ➜ 順便更新 chartDescription
  document.getElementById('chartDescription').textContent = '目前顯示：地區平均單價分析';
}


function showLocationAvgPriceChart() {
    updateLocationAvgPriceChart(lastData);
}


function showChart(type) {

    chartType = type;
    document.getElementById('chartDescription').textContent =
        `目前顯示：${type === 'line' ? '趨勢圖' : type === 'bar' ? '長條圖' : ''}`;
    updateChart(lastData);
}

async function deletePrice(id) {
    if (!confirm('確定要刪除此筆資料嗎？')) return;
    const res = await fetch(`${API_BASE}/delete-price?id=${id}`, {
        method: 'DELETE'
    });
    if (res.ok) {
        alert('刪除成功');
        loadPrices();
    } else {
        alert('刪除失敗');
    }
}

document.getElementById('priceForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        date: document.getElementById('date').value,
        location: document.getElementById('location').value,
        price: parseFloat(document.getElementById('price').value),
        size: document.getElementById('size').value
    };

    const res = await fetch(`${API_BASE}/add-price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (res.ok) {
        const result = await res.json();
        document.getElementById('serverMessage').textContent = result.message;
        document.getElementById('priceForm').reset();
        loadPrices();
    } else {
        document.getElementById('serverMessage').textContent = '新增失敗';
    }
});

document.getElementById('searchBtn').addEventListener('click', () => {
    const start = document.getElementById('startDate').value;
    const end = document.getElementById('endDate').value;
    if (start && end) {
        loadPrices({ start, end });
    } else {
        alert('請輸入起始與結束日期');
    }
});

document.getElementById('showAllBtn').addEventListener('click', () => {
    loadPrices();
});

document.getElementById('searchLocationBtn').addEventListener('click', async () => {
    const location = document.getElementById('locationInput').value.trim();
    if (!location) {
        alert('請輸入地區關鍵字');
        return;
    }

    const res = await fetch(`${API_BASE}/search-location?location=${encodeURIComponent(location)}`);
    const data = await res.json();
    lastData = data;
    renderTable(data);
    updateChart(data);
});

// 初始化
loadPrices();
