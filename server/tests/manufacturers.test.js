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

describe('GET /api/manufacturers', () => {
  it('returns 200 with an array', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 1, name: 'Hasbro' }] });
    const res = await request(app).get('/api/manufacturers');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].name).toBe('Hasbro');
  });
});

describe('POST /api/manufacturers', () => {
  it('returns 201 with valid name', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 1, name: 'Hasbro' }] });
    const res = await request(app).post('/api/manufacturers').send({ name: 'Hasbro' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Hasbro');
  });

  it('returns 400 with missing name', async () => {
    const res = await request(app).post('/api/manufacturers').send({});
    expect(res.status).toBe(400);
  });

  it('returns 409 with duplicate name', async () => {
    db.query.mockRejectedValueOnce({ code: '23505' });
    const res = await request(app).post('/api/manufacturers').send({ name: 'Hasbro' });
    expect(res.status).toBe(409);
  });
});

describe('PUT /api/manufacturers/:id', () => {
  it('returns 200 with updated name', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 1, name: 'Mattel' }] });
    const res = await request(app).put('/api/manufacturers/1').send({ name: 'Mattel' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Mattel');
  });

  it('returns 404 for unknown id', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    const res = await request(app).put('/api/manufacturers/999').send({ name: 'Nobody' });
    expect(res.status).toBe(404);
  });

  it('returns 409 for duplicate name', async () => {
    db.query.mockRejectedValueOnce({ code: '23505' });
    const res = await request(app).put('/api/manufacturers/1').send({ name: 'Hasbro' });
    expect(res.status).toBe(409);
  });
});

describe('DELETE /api/manufacturers/:id', () => {
  it('returns 204 on success when not linked', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ count: 0 }] })
      .mockResolvedValueOnce({ rows: [{ id: 1 }] });
    const res = await request(app).delete('/api/manufacturers/1');
    expect(res.status).toBe(204);
  });

  it('returns 404 when not found', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [{ count: 0 }] })
      .mockResolvedValueOnce({ rows: [] });
    const res = await request(app).delete('/api/manufacturers/999');
    expect(res.status).toBe(404);
  });

  it('returns 409 when linked to games', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ count: 1 }] });
    const res = await request(app).delete('/api/manufacturers/1');
    expect(res.status).toBe(409);
  });
});
