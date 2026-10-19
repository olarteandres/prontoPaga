import jwt from 'jsonwebtoken';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { env } from '../src/config/env';
import { computeScore } from '../src/services/score.service';

const app = createApp();

const loginAs = async (username: string, password: string) => {
  const res = await request(app).post('/login').send({ username, password });
  return res.body.token as string;
};

describe('POST /login', () => {
  it('devuelve un JWT con sub, role y rut para user', async () => {
    const token = await loginAs('juan', 'juan123');
    const payload = jwt.verify(token, env.jwtSecret) as jwt.JwtPayload;
    expect(payload).toMatchObject({ sub: 'u-002', role: 'user', rut: '12.345.678-5' });
    expect(payload.exp).toBeDefined();
  });

  it('no incluye rut para admin', async () => {
    const token = await loginAs('admin', 'admin123');
    const payload = jwt.verify(token, env.jwtSecret) as jwt.JwtPayload;
    expect(payload).toMatchObject({ sub: 'u-001', role: 'admin' });
    expect(payload.rut).toBeUndefined();
  });

  it('rechaza credenciales invalidas con 401', async () => {
    const res = await request(app).post('/login').send({ username: 'juan', password: 'mala' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('rechaza body incompleto con 400', async () => {
    const res = await request(app).post('/login').send({ username: 'juan' });
    expect(res.status).toBe(400);
  });
});

describe('GET /score/:rut', () => {
  it('exige token (401)', async () => {
    const res = await request(app).get('/score/12.345.678-5');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('rechaza token con firma invalida (401)', async () => {
    const forged = jwt.sign({ sub: 'x', role: 'admin' }, 'otro-secreto');
    const res = await request(app).get('/score/12.345.678-5').set('Authorization', `Bearer ${forged}`);
    expect(res.status).toBe(401);
  });

  it('rechaza token expirado (401 TOKEN_EXPIRED)', async () => {
    const expired = jwt.sign({ sub: 'u-001', role: 'admin', exp: Math.floor(Date.now() / 1000) - 10 }, env.jwtSecret);
    const res = await request(app).get('/score/12.345.678-5').set('Authorization', `Bearer ${expired}`);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('TOKEN_EXPIRED');
  });

  it('user puede consultar su propio RUT en cualquier formato', async () => {
    const token = await loginAs('juan', 'juan123');
    const res = await request(app).get('/score/123456785').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ rut: '12.345.678-5', score: computeScore('12.345.678-5') });
    expect(res.body.fecha).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  });

  it('user no puede consultar otro RUT (403)', async () => {
    const token = await loginAs('juan', 'juan123');
    const res = await request(app).get('/score/11.111.111-1').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('admin puede consultar cualquier RUT', async () => {
    const token = await loginAs('admin', 'admin123');
    const res = await request(app).get('/score/11.111.111-1').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.rut).toBe('11.111.111-1');
  });

  it('rechaza RUT invalido con 400', async () => {
    const token = await loginAs('admin', 'admin123');
    const res = await request(app).get('/score/12.345.678-9').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });
});

describe('computeScore', () => {
  it('es deterministico y esta entre 0 y 100', () => {
    const a = computeScore('12.345.678-5');
    expect(computeScore('123456785')).toBe(a);
    expect(a).toBeGreaterThanOrEqual(0);
    expect(a).toBeLessThanOrEqual(100);
  });

  it('varia entre RUTs distintos', () => {
    const ruts = ['12.345.678-5', '11.111.111-1', '22.222.222-2', '7.654.321-6', '15.000.000-K'];
    const scores = new Set(ruts.map(computeScore));
    expect(scores.size).toBeGreaterThan(1);
  });
});
