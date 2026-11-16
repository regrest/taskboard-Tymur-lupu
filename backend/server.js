const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const session = require('express-session');
const { requireAuth } = require('./middleware/auth');
// Если requireAuth находится в отдельном файле (например, middleware/auth.js), не забудьте его импортировать:
// const { requireAuth } = require('./middleware/auth');

const app = express();
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Podłączenie plików z routes/:
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', requireAuth, require('./routes/users'));
app.use('/api/boards', requireAuth, require('./routes/boards'));
app.use('/api/tasks', requireAuth, require('./routes/tasks'));

app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.listen(3000, () => console.log('Serwer: http://localhost:3000'));
