
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: 'https://orderyyt.onrender.com',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.static('public'));

// Supabase 初始化
const supabaseUrl = 'https://hqybkwbokqogfkmqzzgg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxeWJrd2Jva3FvZ2ZrbXF6emdnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODA2NzkxOCwiZXhwIjoyMDkzNjQzOTE4fQ.1tKsMSb1R3iFP3gXrKRALnvugwSjiUb8dB2MgOO3w3I';
const supabase = createClient(supabaseUrl, supabaseKey);

// /order  新增訂單
app.post('/order', async (req, res) => {

  const { name, item, adds, sugar, ice, quantity, tprice, note, time } = req.body;
  
  const { data, error } = await supabase
    .from('nudosys')   
    .insert([{ name, item, adds, sugar, ice, quantity, tprice, note, time }]);

  if (error) {
    console.error('Supabase insert error:', error);
    return res.json({ success: false, error: error.message });
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
    return res.status(500).json({ error: '無法取得訂單' });
  }
  res.json(data);
});

// /done/:id - 標示完成 (付錢)
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

// /order/:id - 刪除訂單
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

// 根目錄測試
app.get('/', (req, res) => {
  res.send('Hello from server! 後端正常運作中！');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
