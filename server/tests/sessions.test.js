const request = require('supertest');

process.env.DATABASE_URL = 'mock';
process.env.CORS_ORIGIN = 'http://localhost:5173';

const db = require('../src/db');
const app = require('../src/index');

// Reusable transaction client factory — mocks db.getClient() for transactional routes
function makeTransactionClient(dataResults) {
  let idx = 0;
  const client = {
    query: vi.fn((sql) => {
      if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') {
        return Promise.resolve({ rows: [] });
      }
      if (typeof sql === 'string' && sql.startsWith('DELETE FROM session_players')) {
        return Promise.resolve({ rows: [] });
      }
      const result = dataResults[idx++];
      return Promise.resolve(result || { rows: [] });
    }),
    release: vi.fn()
  };
  vi.spyOn(db, 'getClient').mockResolvedValue(client);
  return client;
}

beforeEach(() => {
  vi.spyOn(db, 'query');
});

afterEach(() => {
  vi.restoreAllMocks();
});

const futureDate = (() => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 7);
  return d.toISOString().slice(0, 10);
})();

const validBody = {
  played_on: '2024-01-15',
  game_id: 1,
  player_ids: [1, 2, 3],
  winner_id: 1
};

const fullSessionRow = {
  id: 10,
  played_on: '2024-01-15',
  game_id: 1,
  game_name: 'Catan',
  winner_id: 1,
  winner_name: 'Alice',
  created_at: '2024-01-15T10:00:00Z'
};

describe('GET /api/sessions', () => {
  it('returns 200 with an array of sessions', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [fullSessionRow] })
      .mockResolvedValueOnce({ rows: [{ session_id: 10, player_id: 1, player_name: 'Alice' }] });
    const res = await request(app).get('/api/sessions');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].players).toBeDefined();
  });
});

describe('POST /api/sessions', () => {
  it('returns 201 with valid body, no warning when player count within limit', async () => {
    makeTransactionClient([{ rows: [{ id: 10 }] }]);
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 1, num_players: 6 }] })
      .mockResolvedValueOnce({ rows: [fullSessionRow] })
      .mockResolvedValueOnce({ rows: [{ session_id: 10, player_id: 1, player_name: 'Alice' }] });

    const res = await request(app).post('/api/sessions').send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.warning).toBeUndefined();
  });

  it('returns 201 with warning when player count exceeds game maximum', async () => {
    const bodyWithExtra = { ...validBody, player_ids: [1, 2, 3, 4, 5] };
    makeTransactionClient([{ rows: [{ id: 10 }] }]);
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 1, num_players: 3 }] })
      .mockResolvedValueOnce({ rows: [fullSessionRow] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app).post('/api/sessions').send(bodyWithExtra);
    expect(res.status).toBe(201);
    expect(res.body.warning).toBeDefined();
    expect(typeof res.body.warning).toBe('string');
  });

  it('returns 422 for future played_on', async () => {
    const res = await request(app).post('/api/sessions').send({ ...validBody, played_on: futureDate });
    expect(res.status).toBe(422);
  });

  it('returns 400 for empty player_ids', async () => {
    const res = await request(app).post('/api/sessions').send({ ...validBody, player_ids: [] });
    expect(res.status).toBe(400);
  });

  it('returns 422 when winner_id not in player_ids', async () => {
    const res = await request(app).post('/api/sessions').send({ ...validBody, winner_id: 99 });
    expect(res.status).toBe(422);
  });

  it('returns 400 when game_id missing', async () => {
    const { game_id, ...bodyWithoutGame } = validBody;
    const res = await request(app).post('/api/sessions').send(bodyWithoutGame);
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/sessions/:id', () => {
  it('returns 200 with valid update', async () => {
    makeTransactionClient([]);
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 10 }] })
      .mockResolvedValueOnce({ rows: [fullSessionRow] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app).put('/api/sessions/10').send(validBody);
    expect(res.status).toBe(200);
  });

  it('returns 422 for future played_on', async () => {
    const res = await request(app).put('/api/sessions/10').send({ ...validBody, played_on: futureDate });
    expect(res.status).toBe(422);
  });
});

describe('DELETE /api/sessions/:id', () => {
  it('returns 204 on success', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 10 }] });
    const res = await request(app).delete('/api/sessions/10');
    expect(res.status).toBe(204);
  });

  it('returns 404 when not found', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).delete('/api/sessions/999');
    expect(res.status).toBe(404);
  });
});
