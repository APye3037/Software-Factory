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

const validGame = {
  name: 'Catan',
  num_players: 4,
  game_type_id: 1,
  manufacturer_id: 1
};

const fullGameRow = {
  id: 1,
  name: 'Catan',
  num_players: 4,
  game_type_id: 1,
  game_type_name: 'Strategy',
  manufacturer_id: 1,
  manufacturer_name: 'Kosmos',
  created_at: '2024-01-01T00:00:00Z'
};

describe('POST /api/games', () => {
  it('returns 201 with all valid fields', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 1 }] })
      .mockResolvedValueOnce({ rows: [fullGameRow] });
    const res = await request(app).post('/api/games').send(validGame);
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Catan');
    expect(res.body.game_type_name).toBe('Strategy');
  });

  it('returns 400 when name missing', async () => {
    const res = await request(app).post('/api/games').send({ num_players: 4, game_type_id: 1, manufacturer_id: 1 });
    expect(res.status).toBe(400);
  });

  it('returns 409 on duplicate name', async () => {
    db.query.mockRejectedValueOnce({ code: '23505' });
    const res = await request(app).post('/api/games').send(validGame);
    expect(res.status).toBe(409);
  });

  it('returns 400 when num_players = 0', async () => {
    const res = await request(app).post('/api/games').send({ ...validGame, num_players: 0 });
    expect(res.status).toBe(400);
  });

  it('returns 400 when num_players is negative', async () => {
    const res = await request(app).post('/api/games').send({ ...validGame, num_players: -1 });
    expect(res.status).toBe(400);
  });

  it('returns 400 when num_players is a non-integer (1.5)', async () => {
    const res = await request(app).post('/api/games').send({ ...validGame, num_players: 1.5 });
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/games/:id', () => {
  it('returns 200 with valid update', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ id: 1 }] })
      .mockResolvedValueOnce({ rows: [{ ...fullGameRow, name: 'Catan Updated' }] });
    const res = await request(app).put('/api/games/1').send({ ...validGame, name: 'Catan Updated' });
    expect(res.status).toBe(200);
  });

  it('returns 404 when game not found', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).put('/api/games/999').send(validGame);
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/games/:id', () => {
  it('returns 204 when no sessions reference the game', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ count: 0 }] })
      .mockResolvedValueOnce({ rows: [{ id: 1 }] });
    const res = await request(app).delete('/api/games/1');
    expect(res.status).toBe(204);
  });

  it('returns 409 when sessions reference the game', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ count: 2 }] });
    const res = await request(app).delete('/api/games/1');
    expect(res.status).toBe(409);
  });
});
