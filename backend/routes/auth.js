const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');

const router = express.Router();

// Rejestracja (kod ze slajdu)
router.post('/register', async (req, res, next) => {
  try {
    const { login, password, firstName, lastName } = req.body;
    if (!login || !firstName || !lastName || !password || password.length < 8) {
      return res.status(400).json({ error: 'Uzupełnij wszystkie pola, hasło min. 8 znaków' });
    }
    const [exists] = await pool.query('SELECT id FROM users WHERE login = ?', [login]);
    if (exists.length > 0) {
      return res.status(409).json({ error: 'Ten login jest już zajęty' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (login, passwordHash, firstName, lastName) VALUES (?, ?, ?, ?)',
      [login, passwordHash, firstName, lastName]
    );
    req.session.userId = result.insertId;
    res.status(201).json({ id: result.insertId, login, firstName, lastName });
  } catch (err) {
    next(err);
  }
});

// Logowanie
router.post('/login', async (req, res, next) => {
  try {
    const { login, password } = req.body;
    if (!login || !password) {
      return res.status(400).json({ error: 'Podaj login i hasło' });
    }
    const [users] = await pool.query('SELECT * FROM users WHERE login = ?', [login]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Nieprawidłowy login lub hasło' });
    }
    const user = users[0];
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Nieprawidłowy login lub hasło' });
    }
    req.session.userId = user.id;
    res.json({ id: user.id, login: user.login, firstName: user.firstName, lastName: user.lastName });
  } catch (err) {
    next(err);
  }
});

// Wylogowanie (zwraca 204 zgodnie z testem 8)
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.sendStatus(204);
  });
});

// Aktualnie zalogowany użytkownik (GET /api/auth/me)
router.get('/me', async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'Nie zalogowano' });
    }
    const [users] = await pool.query(
      'SELECT id, login, firstName, lastName FROM users WHERE id = ?',
      [req.session.userId]
    );
    if (users.length === 0) {
      return res.status(401).json({ error: 'Nie zalogowano' });
    }
    res.json(users[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
