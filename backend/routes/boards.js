// backend/routes/boards.js
const express = require('express');
const pool = require('../db');
const router = express.Router();
 
// 1. Pobieranie wszystkich aktywnych tablic (GET)
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, description, ownerId, createdAt FROM boards WHERE isDeleted = 0'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});
 
// 2. Dodawanie nowej tablicy (POST)
router.post('/', async (req, res, next) => {
  try {
    const name = (req.body.name || '').trim();
    if (name.length < 1 || name.length > 80) {
      return res.status(400).json({ error: 'Nazwa musi mieć od 1 do 80 znaków' });
    }
    const ownerId = 1;
    const [result] = await pool.query(
      'INSERT INTO boards (name, description, ownerId) VALUES (?, ?, ?)',
      [name, req.body.description || null, ownerId]
    );
    res.status(201).json({ id: result.insertId, name });
  } catch (err) {
    next(err);
  }
});
 
// 3. Edycja istniejącej tablicy (PUT)
router.put('/:id', async (req, res, next) => {
  try {
    const name = (req.body.name || '').trim();
    if (name.length < 1 || name.length > 80) {
      return res.status(400).json({ error: 'Nazwa musi mieć od 1 do 80 znaków' });
    }
    const [result] = await pool.query(
      'UPDATE boards SET name = ?, description = ? WHERE id = ? AND isDeleted = 0',
      [name, req.body.description || null, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Nie znaleziono tablicy' });
    }
    res.json({ id: Number(req.params.id), name, description: req.body.description || null });
  } catch (err) {
    next(err);
  }
});
 
// 4. Miękkie usuwanie tablicy (DELETE)
router.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await pool.query(
      'UPDATE boards SET isDeleted = 1, deletedAt = NOW() WHERE id = ? AND isDeleted = 0',
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Nie znaleziono tablicy' });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
 
// 5. Zadania tablicy bez usuniętych (GET /api/boards/:boardId/tasks)
router.get('/:boardId/tasks', async (req, res, next) => {
  try {
    const [boards] = await pool.query(
      'SELECT id FROM boards WHERE id = ? AND isDeleted = 0',
      [req.params.boardId]
    );
    if (boards.length === 0) {
      return res.status(404).json({ error: 'Nie znaleziono tablicy' });
    }
    const [rows] = await pool.query(
      `SELECT id, title, description, status, priority, deadline, boardId, assigneeId, createdAt
       FROM tasks WHERE boardId = ? AND isDeleted = 0`,
      [req.params.boardId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});
 
module.exports = router;