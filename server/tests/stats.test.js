const request = require('supertest');

process.env.DATABASE_URL = 'mock';
process.env.CORS_ORIGIN = 'http://localhost:5173';

const db = require('../src/db');
const app = require('../src/index');

beforeEach(() => {
  vi.spyOn(db, 'query');
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('GET /api/stats/games/:id', () => {
  it('returns correct times_played and winners when game has sessions', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 1, name: 'Catan' }] })
      .mockResolvedValueOnce({ rows: [{ times_played: 3 }] })
      .mockResolvedValueOnce({ rows: [
        { player_id: 1, player_name: 'Alice', wins: 2 },
        { player_id: 2, player_name: 'Bob', wins: 1 }
      ] });

    const res = await request(app).get('/api/stats/games/1');
    expect(res.status).toBe(200);
    expect(res.body.times_played).toBe(3);
    expect(res.body.winners).toHaveLength(2);
    expect(res.body.winners[0].player_name).toBe('Alice');
  });

  it('returns 200 with times_played=0 and empty winners when game has no sessions', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 1, name: 'Catan' }] })
      .mockResolvedValueOnce({ rows: [{ times_played: 0 }] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/stats/games/1');
    expect(res.status).toBe(200);
    expect(res.body.times_played).toBe(0);
    expect(res.body.winners).toEqual([]);
  });

  it('returns 404 when game not found', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get('/api/stats/games/999');
    expect(res.status).toBe(404);
  });

  it('orders winners alphabetically when wins are tied', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 1, name: 'Catan' }] })
      .mockResolvedValueOnce({ rows: [{ times_played: 2 }] })
      .mockResolvedValueOnce({ rows: [
        { player_id: 2, player_name: 'Alice', wins: 1 },
        { player_id: 1, player_name: 'Bob', wins: 1 }
      ] });

    const res = await request(app).get('/api/stats/games/1');
    expect(res.status).toBe(200);
    expect(res.body.winners[0].player_name).toBe('Alice');
    expect(res.body.winners[1].player_name).toBe('Bob');
  });
});

describe('GET /api/stats/players/:id', () => {
  const playerRow = { id: 5, name: 'Carol' };
  const zeroWins = { rows: [{ wins: 0 }] };

  it('returns correct totals when player has sessions', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [playerRow] })
      .mockResolvedValueOnce({ rows: [{ total: 10 }] })
      .mockResolvedValueOnce({ rows: [{ game_id: 1, game_name: 'Catan', count: 4 }] })
      .mockResolvedValueOnce({ rows: [{ wins: 1 }] })
      .mockResolvedValueOnce({ rows: [{ wins: 2 }] })
      .mockResolvedValueOnce({ rows: [{ wins: 5 }] })
      .mockResolvedValueOnce({ rows: [{ wins: 12 }] });

    const res = await request(app).get('/api/stats/players/5');
    expect(res.status).toBe(200);
    expect(res.body.total_sessions).toBe(10);
    expect(res.body.most_played_game.game_name).toBe('Catan');
    expect(res.body.wins.all_time).toBe(12);
    expect(res.body.wins.this_week).toBe(1);
  });

  it('returns 200 with all zeros and null most_played_game when player has no sessions', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [playerRow] })
      .mockResolvedValueOnce({ rows: [{ total: 0 }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce(zeroWins)
      .mockResolvedValueOnce(zeroWins)
      .mockResolvedValueOnce(zeroWins)
      .mockResolvedValueOnce(zeroWins);

    const res = await request(app).get('/api/stats/players/5');
    expect(res.status).toBe(200);
    expect(res.body.total_sessions).toBe(0);
    expect(res.body.most_played_game).toBeNull();
    expect(res.body.wins.this_week).toBe(0);
    expect(res.body.wins.all_time).toBe(0);
  });

  it('returns 404 when player not found', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).get('/api/stats/players/999');
    expect(res.status).toBe(404);
  });
});
