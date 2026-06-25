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

describe('POST /api/players', () => {
  it('returns 201 with valid name', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 1, name: 'Alice', created_at: '2024-01-01T00:00:00Z' }] });
    const res = await request(app).post('/api/players').send({ name: 'Alice' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Alice');
  });

  it('returns 400 with missing name', async () => {
    const res = await request(app).post('/api/players').send({});
    expect(res.status).toBe(400);
  });

  it('returns 409 with duplicate name', async () => {
    db.query.mockRejectedValueOnce({ code: '23505' });
    const res = await request(app).post('/api/players').send({ name: 'Alice' });
    expect(res.status).toBe(409);
  });
});

describe('PUT /api/players/:id', () => {
  it('returns 200 with updated name', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 1, name: 'Bob', created_at: '2024-01-01T00:00:00Z' }] });
    const res = await request(app).put('/api/players/1').send({ name: 'Bob' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Bob');
  });

  it('returns 404 when player not found', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).put('/api/players/999').send({ name: 'Ghost' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/players/:id', () => {
  it('returns 204 when player has no sessions', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ count: 0 }] })
      .mockResolvedValueOnce({ rows: [{ id: 1 }] });
    const res = await request(app).delete('/api/players/1');
    expect(res.status).toBe(204);
  });

  it('returns 409 when player is in a session', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ count: 3 }] });
    const res = await request(app).delete('/api/players/1');
    expect(res.status).toBe(409);
  });
});
