const express = require('express');
const router = express.Router();
const db = require('../db');

// GET / — all manufacturers ordered by name
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM manufacturers ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST / — create a new manufacturer
router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'name is required' });
  }
  try {
    const { rows } = await db.query(
      'INSERT INTO manufacturers (name) VALUES ($1) RETURNING *',
      [name.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A manufacturer with that name already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /:id — update a manufacturer
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'name is required' });
  }
  try {
    const { rows } = await db.query(
      'UPDATE manufacturers SET name = $1 WHERE id = $2 RETURNING *',
      [name.trim(), id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Manufacturer not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A manufacturer with that name already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /:id — delete a manufacturer (blocked if referenced by games)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Check if referenced by any game
    const { rows: linked } = await db.query(
      'SELECT COUNT(*)::int AS count FROM games WHERE manufacturer_id = $1',
      [id]
    );
    if (linked[0].count > 0) {
      return res.status(409).json({ error: 'Cannot delete: manufacturer is used by one or more games' });
    }

    const { rows } = await db.query(
      'DELETE FROM manufacturers WHERE id = $1 RETURNING id',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Manufacturer not found' });
    }
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
