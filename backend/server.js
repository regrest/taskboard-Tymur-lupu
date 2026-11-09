const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');

// Импорт роутов
const boardsRouter = require('./routes/boards'); 

const app = express();
app.use(express.json());

// Подключение роутов
app.use('/api/boards', boardsRouter); 

// Проверочный эндпоинт
app.get('/api/health', (req, res) => {
    res.json({ ok: true });
});

app.listen(3000, () => console.log('Serwer: http://localhost:3000'));
