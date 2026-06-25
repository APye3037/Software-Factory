const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * Fetch a fully-joined session row plus its players array.
 * Works on either the shared pool (db) or a transaction client.
 */
async function fetchSession(idOrQuery, client) {
  const executor = client || db;
  const { rows } = await executor.query(
    `SELECT
       s.id,
       s.played_on,
       s.game_id,
       g.name AS game_name,
       s.winner_id,
       p.name AS winner_name,
       s.created_at
     FROM sessions s
     JOIN games   g ON g.id = s.game_id
     JOIN players p ON p.id = s.winner_id
     WHERE s.id = $1`,
    [idOrQuery]
  );
  if (rows.length === 0) return null;

  const session = rows[0];
  const { rows: playerRows } = await executor.query(
    `SELECT sp.player_id, p.name AS player_name
     FROM session_players sp
     JOIN players p ON p.id = sp.player_id
     WHERE sp.session_id = $1
     ORDER BY p.name ASC`,
    [session.id]
  );
  session.players = playerRows;
  return session;
}

/**
 * Validate the request body fields shared by POST and PUT.
 * Returns an error object { status, error } or null if valid.
 */
function validateSessionBody(body) {
  const { played_on, player_ids, winner_id, game_id } = body;

  // 1. played_on required + valid date + not future
  if (!played_on) {
    return { status: 422, error: 'played_on is required' };
  }
  const playedDate = new Date(played_on);
  if (isNaN(playedDate.getTime()) || !/^\d{4}-\d{2}-\d{2}$/.test(played_on)) {
    return { status: 422, error: 'played_on must be a valid date (YYYY-MM-DD)' };
  }
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  if (playedDate > today) {
    return { status: 422, error: 'played_on cannot be a future date' };
  }

  // 2. player_ids non-empty array
  if (!Array.isArray(player_ids) || player_ids.length === 0) {
    return { status: 400, error: 'player_ids must be a non-empty array' };
  }

  // 3. winner_id present and in player_ids
  if (!winner_id) {
    return { status: 422, error: 'winner_id is required' };
  }
  const playerIdSet = player_ids.map(id => Number(id));
  if (!playerIdSet.includes(Number(winner_id))) {
    return { status: 422, error: 'winner_id must be one of the player_ids' };
  }

  // 4. game_id present
  if (!game_id) {
    return { status: 400, error: 'game_id is required' };
  }

  return null;
}

// GET / — all sessions ordered played_on DESC, id DESC
router.get('/', async (req, res) => {
  try {
    const { rows: sessions } = await db.query(
      `SELECT
         s.id,
         s.played_on,
         s.game_id,
         g.name AS game_name,
         s.winner_id,
         p.name AS winner_name,
         s.created_at
       FROM sessions s
       JOIN games   g ON g.id = s.game_id
       JOIN players p ON p.id = s.winner_id
       ORDER BY s.played_on DESC, s.id DESC`
    );

    // Fetch players for all sessions in one query
    if (sessions.length === 0) {
      return res.json([]);
    }

    const sessionIds = sessions.map(s => s.id);
    const { rows: allPlayers } = await db.query(
      `SELECT sp.session_id, sp.player_id, p.name AS player_name
       FROM session_players sp
       JOIN players p ON p.id = sp.player_id
       WHERE sp.session_id = ANY($1::int[])
       ORDER BY p.name ASC`,
      [sessionIds]
    );

    // Group players by session_id
    const playersBySession = {};
    for (const row of allPlayers) {
      if (!playersBySession[row.session_id]) {
        playersBySession[row.session_id] = [];
      }
      playersBySession[row.session_id].push({
        player_id: row.player_id,
        player_name: row.player_name
      });
    }

    const result = sessions.map(s => ({
      ...s,
      players: playersBySession[s.id] || []
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST / — create a session
router.post('/', async (req, res) => {
  const validationError = validateSessionBody(req.body);
  if (validationError) {
    return res.status(validationError.status).json({ error: validationError.error });
  }

  const { played_on, player_ids, winner_id, game_id } = req.body;

  // Fetch game to get num_players
  let game;
  try {
    const { rows } = await db.query('SELECT id, num_players FROM games WHERE id = $1', [game_id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }
    game = rows[0];
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }

  const client = await db.getClient();
  let newSessionId;

  try {
    await client.query('BEGIN');

    const { rows: sessionRows } = await client.query(
      'INSERT INTO sessions (played_on, game_id, winner_id) VALUES ($1, $2, $3) RETURNING id',
      [played_on, game_id, winner_id]
    );
    newSessionId = sessionRows[0].id;

    for (const pid of player_ids) {
      await client.query(
        'INSERT INTO session_players (session_id, player_id) VALUES ($1, $2)',
        [newSessionId, pid]
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    client.release();
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }

  client.release();

  try {
    const session = await fetchSession(newSessionId, null);
    const response = { ...session };
    if (player_ids.length > game.num_players) {
      response.warning = `Player count (${player_ids.length}) exceeds game maximum (${game.num_players})`;
    }
    res.status(201).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /:id — update a session atomically
router.put('/:id', async (req, res) => {
  const { id } = req.params;

  const validationError = validateSessionBody(req.body);
  if (validationError) {
    return res.status(validationError.status).json({ error: validationError.error });
  }

  const { played_on, player_ids, winner_id, game_id } = req.body;

  // Check session exists and fetch game for num_players warning
  let game;
  try {
    const { rows } = await db.query('SELECT id FROM sessions WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    const { rows: gameRows } = await db.query('SELECT id, num_players FROM games WHERE id = $1', [game_id]);
    if (gameRows.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }
    game = gameRows[0];
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }

  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    await client.query(
      'UPDATE sessions SET played_on=$1, game_id=$2, winner_id=$3 WHERE id=$4',
      [played_on, game_id, winner_id, id]
    );

    await client.query('DELETE FROM session_players WHERE session_id = $1', [id]);

    for (const pid of player_ids) {
      await client.query(
        'INSERT INTO session_players (session_id, player_id) VALUES ($1, $2)',
        [id, pid]
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    client.release();
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }

  client.release();

  try {
    const session = await fetchSession(id, null);
    const response = { ...session };
    if (player_ids.length > game.num_players) {
      response.warning = `Player count (${player_ids.length}) exceeds game maximum (${game.num_players})`;
    }
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /:id — delete a session
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query(
      'DELETE FROM sessions WHERE id = $1 RETURNING id',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
