const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * Compute the ISO week (Mon–Sun) bounds for the current UTC date.
 */
function getIsoWeekBounds() {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun
  const diffToMon = day === 0 ? -6 : 1 - day;
  const mon = new Date(now);
  mon.setUTCDate(now.getUTCDate() + diffToMon);
  const sun = new Date(mon);
  sun.setUTCDate(mon.getUTCDate() + 6);
  const fmt = d => d.toISOString().slice(0, 10);
  return { weekStart: fmt(mon), weekEnd: fmt(sun) };
}

// GET /games/:id — stats for a specific game
router.get('/games/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Check game exists
    const { rows: gameRows } = await db.query('SELECT id, name FROM games WHERE id = $1', [id]);
    if (gameRows.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }
    const game = gameRows[0];

    // Count sessions
    const { rows: countRows } = await db.query(
      'SELECT COUNT(*)::int AS times_played FROM sessions WHERE game_id = $1',
      [id]
    );
    const times_played = countRows[0].times_played;

    // Winners leaderboard
    const { rows: winners } = await db.query(
      `SELECT
         p.id  AS player_id,
         p.name AS player_name,
         COUNT(*)::int AS wins
       FROM sessions s
       JOIN players p ON p.id = s.winner_id
       WHERE s.game_id = $1
       GROUP BY p.id, p.name
       ORDER BY wins DESC, p.name ASC`,
      [id]
    );

    res.json({
      game_id: game.id,
      game_name: game.name,
      times_played,
      winners
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /players/:id — stats for a specific player
router.get('/players/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Check player exists
    const { rows: playerRows } = await db.query('SELECT id, name FROM players WHERE id = $1', [id]);
    if (playerRows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }
    const player = playerRows[0];

    // Total sessions (sessions they participated in)
    const { rows: sessionCountRows } = await db.query(
      'SELECT COUNT(*)::int AS total FROM session_players WHERE player_id = $1',
      [id]
    );
    const total_sessions = sessionCountRows[0].total;

    // Most played game
    const { rows: mostPlayedRows } = await db.query(
      `SELECT
         g.id   AS game_id,
         g.name AS game_name,
         COUNT(*)::int AS count
       FROM session_players sp
       JOIN sessions s ON s.id = sp.session_id
       JOIN games    g ON g.id = s.game_id
       WHERE sp.player_id = $1
       GROUP BY g.id, g.name
       ORDER BY count DESC, g.name ASC
       LIMIT 1`,
      [id]
    );
    const most_played_game = mostPlayedRows.length > 0 ? mostPlayedRows[0] : null;

    // Win counts by period
    const { weekStart, weekEnd } = getIsoWeekBounds();

    const { rows: weekRows } = await db.query(
      'SELECT COUNT(*)::int AS wins FROM sessions WHERE winner_id=$1 AND played_on >= $2 AND played_on <= $3',
      [id, weekStart, weekEnd]
    );
    const { rows: monthRows } = await db.query(
      `SELECT COUNT(*)::int AS wins FROM sessions
       WHERE winner_id=$1 AND DATE_TRUNC('month', played_on) = DATE_TRUNC('month', CURRENT_DATE)`,
      [id]
    );
    const { rows: yearRows } = await db.query(
      `SELECT COUNT(*)::int AS wins FROM sessions
       WHERE winner_id=$1 AND DATE_TRUNC('year', played_on) = DATE_TRUNC('year', CURRENT_DATE)`,
      [id]
    );
    const { rows: allTimeRows } = await db.query(
      'SELECT COUNT(*)::int AS wins FROM sessions WHERE winner_id=$1',
      [id]
    );

    res.json({
      player_id: player.id,
      player_name: player.name,
      total_sessions,
      most_played_game,
      wins: {
        this_week: weekRows[0].wins,
        this_month: monthRows[0].wins,
        this_year: yearRows[0].wins,
        all_time: allTimeRows[0].wins
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
