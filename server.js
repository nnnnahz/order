// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Supabase 初始化
const supabaseUrl = 'https://fyazrpzfiybiqyqzzidm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5YXpycHpmaXliaXF5cXp6aWRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDY2ODQwNywiZXhwIjoyMDkwMjQ0NDA3fQ.NQM-Mf-ltSJM_sewhV52Dfw43MjUz3XRzIVqHsPS0QY';
const supabase = createClient(supabaseUrl, supabaseKey);

// /order  新增訂單
app.post('/order', async (req, res) => {
  const { name, flavor, time, brand, quantity, tprice } = req.body;
  const { data, error } = await supabase
    .from('nudosys')   
    .insert([{ name, flavor, time, brand, quantity,tprice }]);

  if (error) {
    console.error('Supabase insert error:', error);
    return res.json({ success: false });
  }
  res.json({ success: true });
});

//  /orders - 取得訂單
app.get('/orders', async (req, res) => {
  const { data, error } = await supabase
    .from('nudosys')  
    .select('*')
    .order('time', { ascending: false });

  if (error) {
    console.error('Supabase select error:', error);
    return res.status(500).json({ error: '無法取得訂單資料' });
  }
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


app.get('/', (req, res) => {
  res.send('Hello from server!');
});


app.patch('/done/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('nudosys')
    .update({ done: true })
    .eq('id', id);

  if (error) {
    console.error('Supabase update error:', error);
    return res.status(500).json({ message: '更新失敗' });
  }

  res.json({ message: '訂單標示為完成' });
});


function loadUserOrders() {
  if (!currentUser) {
    alert("請先登入");
    return;
  }

  fetch('https://nudosys.onrender.com/orders')
    .then(res => res.json())
    .then(orders => {
      const tbody = document.getElementById('historyOrdersBody');
      tbody.innerHTML = '';

      // 篩選訂單
      const userOrders = orders.filter(order => order.name === currentUser);

      if (userOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">你目前沒有訂單</td></tr>';
      } else {
        userOrders.forEach(order => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${order.brand}</td>
            <td>${order.flavor}</td>
            <td>${new Date(order.time).toLocaleString()}</td>
            <td>${order.done ? '已完成' : '未完成'}</td>
          `;
          tbody.appendChild(tr);
        });
      }

      document.getElementById('historyOrders').style.display = 'block';
    })
    .catch(() => alert('無法取得歷史訂單'));
}


app.delete('/order/:id', async (req, res) => {
  const { id } = req.params;
  console.log("收到，ID =", id);

  const { error } = await supabase
    .from('nudosys')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('刪除失敗', error);
    return res.status(500).send({ success: false, error: error.message });
  }

  res.send({ success: true, message: `已刪除 ID 為 ${id} 的訂單` });
});
