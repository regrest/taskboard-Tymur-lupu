// backend/routes/tasks.js
const express = require('express');
const pool = require('../db');
const router = express.Router();

const STATUSES = ['todo', 'in_progress', 'done'];
const PRIORITIES = ['low', 'medium', 'high'];
const TASK_COLUMNS =
  'id, title, description, status, priority, deadline, boardId, assigneeId, createdAt';

// Pole "puste": brak, null albo pusty tekst
function isEmpty(value) {
  return value === undefined || value === null || value === '';
}

// Data w formacie RRRR-MM-DD, która naprawdę istnieje (odrzuca np. 2026-02-31)
function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(value + 'T00:00:00Z');
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

// Dodatnia liczba całkowita albo null
function toId(value) {
  if (typeof value !== 'number' && typeof value !== 'string') {
    return null;
  }
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Wspólna walidacja dla POST i PUT.
// Zwraca { error } albo { values }.
// withBoard = true tylko dla POST (PUT nie zmienia tablicy zadania).
async function validateTask(body, { withBoard }) {
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  if (title.length < 3 || title.length > 100) {
    return { error: 'Tytuł musi mieć od 3 do 100 znaków' };
  }

  if (!isEmpty(body.description) && typeof body.description !== 'string') {
    return { error: 'Opis musi być tekstem' };
  }

  const status = body.status || 'todo';
  if (!STATUSES.includes(status)) {
    return { error: 'Nieprawidłowy status' };
  }

  const priority = body.priority || 'medium';
  if (!PRIORITIES.includes(priority)) {
    return { error: 'Nieprawidłowy priorytet' };
  }

  let deadline = null;
  if (!isEmpty(body.deadline)) {
    if (!isValidDate(body.deadline)) {
      return { error: 'Termin musi mieć format RRRR-MM-DD' };
    }
    deadline = body.deadline;
  }

  let assigneeId = null;
  if (!isEmpty(body.assigneeId)) {
    assigneeId = toId(body.assigneeId);
    if (assigneeId === null) {
      return { error: 'Nieprawidłowy identyfikator osoby' };
    }
    const [users] = await pool.query('SELECT id FROM users WHERE id = ?', [assigneeId]);
    if (users.length === 0) {
      return { error: 'Wybrana osoba nie istnieje' };
    }
  }

  const values = {
    title,
    description: body.description || null,
    status,
    priority,
    deadline,
    assigneeId
  };

  if (withBoard) {
    const boardId = toId(body.boardId);
    if (boardId === null) {
      return { error: 'Nieprawidłowy identyfikator tablicy' };
    }
    const [boards] = await pool.query(
      'SELECT id FROM boards WHERE id = ? AND isDeleted = 0',
      [boardId]
    );
    if (boards.length === 0) {
      return { error: 'Wybrana tablica nie istnieje' };
    }
    values.boardId = boardId;
  }

  return { values };
}

// 1. Szczegóły zadania (GET)
router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT ${TASK_COLUMNS} FROM tasks WHERE id = ? AND isDeleted = 0`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Nie znaleziono zadania' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// 2. Dodawanie nowego zadania (POST)
router.post('/', async (req, res, next) => {
  try {
    const { error, values } = await validateTask(req.body, { withBoard: true });
    if (error) {
      return res.status(400).json({ error });
    }
    const [result] = await pool.query(
      `INSERT INTO tasks (title, description, status, priority, deadline, boardId, assigneeId)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        values.title,
        values.description,
        values.status,
        values.priority,
        values.deadline,
        values.boardId,
        values.assigneeId
      ]
    );
    res.status(201).json({ id: result.insertId, ...values });
  } catch (err) {
    next(err);
  }
});

// 3. Edycja istniejącego zadania (PUT)
router.put('/:id', async (req, res, next) => {
  try {
    const { error, values } = await validateTask(req.body, { withBoard: false });
    if (error) {
      return res.status(400).json({ error });
    }
    const [result] = await pool.query(
      `UPDATE tasks
       SET title = ?, description = ?, status = ?, priority = ?, deadline = ?, assigneeId = ?
       WHERE id = ? AND isDeleted = 0`,
      [
        values.title,
        values.description,
        values.status,
        values.priority,
        values.deadline,
        values.assigneeId,
        req.params.id
      ]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Nie znaleziono zadania' });
    }
    res.json({ id: Number(req.params.id), ...values });
  } catch (err) {
    next(err);
  }
});

// 4. Miękkie usuwanie zadania (DELETE)
router.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await pool.query(
      'UPDATE tasks SET isDeleted = 1, deletedAt = NOW() WHERE id = ? AND isDeleted = 0',
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Nie znaleziono zadania' });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
