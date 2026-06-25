const express = require('express');
const router = express.Router();
const db = require('../db');
const { isPositiveInteger } = require('../middleware/validate');

const GAME_SELECT = `
  SELECT
    g.id,
    g.name,
    g.num_players,
    g.game_type_id,
    gt.name AS game_type_name,
    g.manufacturer_id,
    m.name  AS manufacturer_name,
    g.created_at
  FROM games g
  JOIN game_types    gt ON gt.id = g.game_type_id
  JOIN manufacturers m  ON m.id  = g.manufacturer_id
`;

// GET / — all games with joined names
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(GAME_SELECT + ' ORDER BY g.name ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST / — create a game
router.post('/', async (req, res) => {
  const { name, num_players, game_type_id, manufacturer_id } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'name is required' });
  }
  if (num_players === undefined || num_players === null) {
    return res.status(400).json({ error: 'num_players is required' });
  }
  if (!isPositiveInteger(num_players)) {
    return res.status(400).json({ error: 'num_players must be a positive integer' });
  }
  if (!game_type_id) {
    return res.status(400).json({ error: 'game_type_id is required' });
  }
  if (!manufacturer_id) {
    return res.status(400).json({ error: 'manufacturer_id is required' });
  }

  try {
    const insert = await db.query(
      'INSERT INTO games (name, num_players, game_type_id, manufacturer_id) VALUES ($1, $2, $3, $4) RETURNING id',
      [name.trim(), Number(num_players), game_type_id, manufacturer_id]
    );
    const { rows } = await db.query(GAME_SELECT + ' WHERE g.id = $1', [insert.rows[0].id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A game with that name already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /:id — update a game
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, num_players, game_type_id, manufacturer_id } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'name is required' });
  }
  if (num_players === undefined || num_players === null) {
    return res.status(400).json({ error: 'num_players is required' });
  }
  if (!isPositiveInteger(num_players)) {
    return res.status(400).json({ error: 'num_players must be a positive integer' });
  }
  if (!game_type_id) {
    return res.status(400).json({ error: 'game_type_id is required' });
  }
  if (!manufacturer_id) {
    return res.status(400).json({ error: 'manufacturer_id is required' });
  }

  try {
    const update = await db.query(
      'UPDATE games SET name=$1, num_players=$2, game_type_id=$3, manufacturer_id=$4 WHERE id=$5 RETURNING id',
      [name.trim(), Number(num_players), game_type_id, manufacturer_id, id]
    );
    if (update.rows.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }
    const { rows } = await db.query(GAME_SELECT + ' WHERE g.id = $1', [id]);
    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A game with that name already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /:id — delete a game (blocked if referenced by sessions)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows: linked } = await db.query(
      'SELECT COUNT(*)::int AS count FROM sessions WHERE game_id = $1',
      [id]
    );
    if (linked[0].count > 0) {
      return res.status(409).json({ error: 'Cannot delete: game is used by one or more sessions' });
    }

    const { rows } = await db.query(
      'DELETE FROM games WHERE id = $1 RETURNING id',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
