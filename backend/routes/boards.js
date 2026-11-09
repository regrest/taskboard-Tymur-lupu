const express = require('express');
const pool = require('../db');
const router = express.Router();

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

module.exports = router;
