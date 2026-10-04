import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import User from '../models/User.js';

describe('Auth API Endpoints', () => {
  const patientData = {
    name: 'Alice Wonder',
    email: 'alice@example.com',
    password: 'Password123!',
    phone: '1234567890',
  };

  it('should successfully register a new patient', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(patientData);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(patientData.email);
    expect(res.body.user.role).toBe('patient');
    expect(res.body.user.password).toBeUndefined();
  });

  it('should reject registration when email is missing or password is too short', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Bob', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should prevent duplicate email registration', async () => {
    await request(app).post('/api/auth/register').send(patientData);

    const duplicateRes = await request(app)
      .post('/api/auth/register')
      .send(patientData);

    expect(duplicateRes.status).toBe(400);
    expect(duplicateRes.body.success).toBe(false);
    expect(duplicateRes.body.message).toMatch(/already exists/i);
  });

  it('should login an existing user with correct credentials', async () => {
    await request(app).post('/api/auth/register').send(patientData);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: patientData.email,
        password: patientData.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.name).toBe(patientData.name);
  });

  it('should reject login with invalid password', async () => {
    await request(app).post('/api/auth/register').send(patientData);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: patientData.email,
        password: 'WrongPassword!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Invalid email or password/i);
  });

  it('should reject access to protected endpoint without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should allow access to protected endpoint with valid token', async () => {
    const regRes = await request(app).post('/api/auth/register').send(patientData);
    const token = regRes.body.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(patientData.email);
  });

  it('should restrict admin endpoints from patient access (403 Forbidden)', async () => {
    const regRes = await request(app).post('/api/auth/register').send(patientData);
    const token = regRes.body.token;

    const res = await request(app)
      .get('/api/auth/patients')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Forbidden/i);
  });
});
