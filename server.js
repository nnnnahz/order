const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); 
app.use(bodyParser.json());
app.use(express.static('public')); // 讓前端 HTML 可以被讀取

// Supabase 初始化 
const supabaseUrl = 'https://hqybkwbokqogfkmqzzgg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxeWJrd2Jva3FvZ2ZrbXF6emdnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODA2NzkxOCwiZXhwIjoyMDkzNjQzOTE4fQ.1tKsMSb1R3iFP3gXrKRALnvugwSjiUb8dB2MgOO3w3I';
const supabase = createClient(supabaseUrl, supabaseKey);

// /order  新增訂單
app.post('/order', async (req, res) => {
  const { name, item, adds, sugar, ice, quantity, tprice, note, time } = req.body;
  const { data, error } = await supabase
    .from('orderyyt') // 🔴 已經改成 orderyyt
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
    .from('orderyyt') // 🔴 已經改成 orderyyt
    .select('*')
    .order('time', { ascending: false });

  if (error) return res.status(500).json({ error: '無法取得訂單' });
  res.json(data);
});

// /done/:id - 標示完成 (付錢)
app.patch('/done/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('orderyyt') 
    .update({ done: true })
    .eq('id', id);

  if (error) return res.status(500).json({ message: '更新失敗' });
  res.json({ message: '訂單標示為完成' });
});

// /order/:id - 刪除訂單
app.delete('/order/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('orderyyt') 
    .delete()
    .eq('id', id);

  if (error) return res.status(500).send({ success: false, error: error.message });
  res.send({ success: true, message: `已刪除` });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
