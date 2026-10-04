import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

describe('Doctor Management API', () => {
  let adminUser, adminToken, patientUser, patientToken;

  beforeEach(async () => {
    adminUser = await User.create({
      name: 'Super Admin',
      email: 'admin@hospital.com',
      password: 'Password123!',
      role: 'admin',
    });
    adminToken = generateToken(adminUser._id, 'admin');

    patientUser = await User.create({
      name: 'Regular Patient',
      email: 'patient@hospital.com',
      password: 'Password123!',
      role: 'patient',
    });
    patientToken = generateToken(patientUser._id, 'patient');
  });

  it('should allow public access to active doctors directory', async () => {
    await User.create({
      name: 'Dr. Active',
      email: 'active@hospital.com',
      password: 'Password123!',
      role: 'doctor',
      department: 'Cardiology',
      specialization: 'Cardiologist',
      isActive: true,
    });

    await User.create({
      name: 'Dr. Inactive',
      email: 'inactive@hospital.com',
      password: 'Password123!',
      role: 'doctor',
      department: 'Cardiology',
      specialization: 'Cardiologist',
      isActive: false,
    });

    const res = await request(app).get('/api/doctors');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Should only contain active doctors
    expect(res.body.doctors.some((d) => d.name === 'Dr. Active')).toBe(true);
    expect(res.body.doctors.some((d) => d.name === 'Dr. Inactive')).toBe(false);
  });

  it('should allow admin to create a new doctor', async () => {
    const res = await request(app)
      .post('/api/doctors')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Dr. Gregory House',
        email: 'house@hospital.com',
        password: 'Password123!',
        department: 'Diagnostic Medicine',
        specialization: 'Diagnostics & Nephrology',
        qualification: 'MD, Johns Hopkins',
        doctorFee: 1000,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.doctor.name).toBe('Dr. Gregory House');
    expect(res.body.doctor.role).toBe('doctor');
  });

  it('should block patient from creating a doctor account (403)', async () => {
    const res = await request(app)
      .post('/api/doctors')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        name: 'Dr. Unauthorized',
        email: 'unauth@hospital.com',
        password: 'Password123!',
        department: 'Cardiology',
        specialization: 'Cardiology',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should allow admin to toggle doctor active/inactive status', async () => {
    const doctor = await User.create({
      name: 'Dr. Status Test',
      email: 'status@hospital.com',
      password: 'Password123!',
      role: 'doctor',
      department: 'Pediatrics',
      specialization: 'Pediatrician',
      isActive: true,
    });

    const toggleRes = await request(app)
      .patch(`/api/doctors/${doctor._id}/toggle-status`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(toggleRes.status).toBe(200);
    expect(toggleRes.body.success).toBe(true);
    expect(toggleRes.body.doctor.isActive).toBe(false);
  });
});
