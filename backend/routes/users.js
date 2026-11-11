// backend/routes/users.js
const express = require('express');
const pool = require('../db');
const router = express.Router();

// Lista osób do przypisania zadania (GET) - bez passwordHash
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, login, firstName, lastName FROM users ORDER BY id'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
