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

describe('GET /api/game-types', () => {
  it('returns 200 with an array', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 1, name: 'Strategy' }] });
    const res = await request(app).get('/api/game-types');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].name).toBe('Strategy');
  });
});

describe('POST /api/game-types', () => {
  it('returns 201 with valid name', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 1, name: 'Strategy' }] });
    const res = await request(app).post('/api/game-types').send({ name: 'Strategy' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Strategy');
  });

  it('returns 400 with missing name', async () => {
    const res = await request(app).post('/api/game-types').send({});
    expect(res.status).toBe(400);
  });

  it('returns 409 with duplicate name', async () => {
    db.query.mockRejectedValueOnce({ code: '23505' });
    const res = await request(app).post('/api/game-types').send({ name: 'Strategy' });
    expect(res.status).toBe(409);
  });
});

describe('PUT /api/game-types/:id', () => {
  it('returns 200 with updated name', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 1, name: 'Updated' }] });
    const res = await request(app).put('/api/game-types/1').send({ name: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated');
  });

  it('returns 404 for unknown id', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).put('/api/game-types/999').send({ name: 'Whatever' });
    expect(res.status).toBe(404);
  });

  it('returns 409 for duplicate name', async () => {
    db.query.mockRejectedValueOnce({ code: '23505' });
    const res = await request(app).put('/api/game-types/1').send({ name: 'Strategy' });
    expect(res.status).toBe(409);
  });
});

describe('DELETE /api/game-types/:id', () => {
  it('returns 204 on success when not linked', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ count: 0 }] })
      .mockResolvedValueOnce({ rows: [{ id: 1 }] });
    const res = await request(app).delete('/api/game-types/1');
    expect(res.status).toBe(204);
  });

  it('returns 404 when not found', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ count: 0 }] })
      .mockResolvedValueOnce({ rows: [] });
    const res = await request(app).delete('/api/game-types/999');
    expect(res.status).toBe(404);
  });

  it('returns 409 when linked to games', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ count: 1 }] });
    const res = await request(app).delete('/api/game-types/1');
    expect(res.status).toBe(409);
  });
});
