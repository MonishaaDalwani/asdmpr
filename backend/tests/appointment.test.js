import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import generateToken from '../utils/generateToken.js';

describe('Appointment Booking & Workflow API', () => {
  let patientUser, doctorUser, adminUser;
  let patientToken, doctorToken, adminToken;

  beforeEach(async () => {
    // Create test patient
    patientUser = await User.create({
      name: 'Test Patient',
      email: 'patient@test.com',
      password: 'Password123!',
      role: 'patient',
    });
    patientToken = generateToken(patientUser._id, 'patient');

    // Create test doctor
    doctorUser = await User.create({
      name: 'Dr. Jane Cardio',
      email: 'doctor@test.com',
      password: 'Password123!',
      role: 'doctor',
      department: 'Cardiology',
      specialization: 'Cardiologist',
      doctorFee: 600,
      isActive: true,
    });
    doctorToken = generateToken(doctorUser._id, 'doctor');

    // Create test admin
    adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@test.com',
      password: 'Password123!',
      role: 'admin',
    });
    adminToken = generateToken(adminUser._id, 'admin');
  });

  it('should allow a patient to book an appointment with valid details', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId: doctorUser._id,
        appointmentDate: '2026-11-15',
        appointmentTimeSlot: '10:00 - 10:30',
        reason: 'Regular heart checkup',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.appointment.status).toBe('pending');
    expect(res.body.appointment.department).toBe('Cardiology');
    expect(res.body.appointment.patient.name).toBe('Test Patient');
  });

  it('should reject booking if required fields are missing', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId: doctorUser._id,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should prevent conflicting appointment bookings for same doctor, date and slot (409 Conflict)', async () => {
    // First booking
    await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId: doctorUser._id,
        appointmentDate: '2026-11-15',
        appointmentTimeSlot: '10:00 - 10:30',
        reason: 'Regular heart checkup',
      });

    // Create another patient
    const secondPatient = await User.create({
      name: 'Second Patient',
      email: 'second@test.com',
      password: 'Password123!',
      role: 'patient',
    });
    const secondToken = generateToken(secondPatient._id, 'patient');

    // Attempt conflicting booking
    const conflictRes = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${secondToken}`)
      .send({
        doctorId: doctorUser._id,
        appointmentDate: '2026-11-15',
        appointmentTimeSlot: '10:00 - 10:30',
        reason: 'Consultation',
      });

    expect(conflictRes.status).toBe(409);
    expect(conflictRes.body.success).toBe(false);
    expect(conflictRes.body.message).toMatch(/already booked/i);
  });

  it('should prevent duplicate appointments by same patient on the same day with same doctor', async () => {
    await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId: doctorUser._id,
        appointmentDate: '2026-11-15',
        appointmentTimeSlot: '10:00 - 10:30',
        reason: 'Regular heart checkup',
      });

    const duplicateRes = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId: doctorUser._id,
        appointmentDate: '2026-11-15',
        appointmentTimeSlot: '14:00 - 14:30',
        reason: 'Follow-up query',
      });

    expect(duplicateRes.status).toBe(400);
    expect(duplicateRes.body.success).toBe(false);
    expect(duplicateRes.body.message).toMatch(/already have an active appointment/i);
  });

  it('should allow assigned doctor to update status to accepted or completed with doctor notes', async () => {
    const bookingRes = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId: doctorUser._id,
        appointmentDate: '2026-11-16',
        appointmentTimeSlot: '09:00 - 09:30',
        reason: 'High blood pressure concerns',
      });

    const appointmentId = bookingRes.body.appointment._id;

    const acceptRes = await request(app)
      .patch(`/api/appointments/${appointmentId}/status`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        status: 'accepted',
        doctorNotes: 'Appointment confirmed. Please arrive 10 minutes early.',
      });

    expect(acceptRes.status).toBe(200);
    expect(acceptRes.body.success).toBe(true);
    expect(acceptRes.body.appointment.status).toBe('accepted');
    expect(acceptRes.body.appointment.doctorNotes).toBe('Appointment confirmed. Please arrive 10 minutes early.');
  });

  it('should allow patient to cancel their own pending appointment', async () => {
    const bookingRes = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId: doctorUser._id,
        appointmentDate: '2026-11-17',
        appointmentTimeSlot: '11:00 - 11:30',
        reason: 'Chest pain review',
      });

    const appointmentId = bookingRes.body.appointment._id;

    const cancelRes = await request(app)
      .patch(`/api/appointments/${appointmentId}/cancel`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        cancellationReason: 'Rescheduling due to work travel',
      });

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.success).toBe(true);
    expect(cancelRes.body.appointment.status).toBe('cancelled');
  });
});
