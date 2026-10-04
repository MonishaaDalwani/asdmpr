import express from 'express';
import {
  bookAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  getAllAppointmentsAdmin,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
} from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validateAppointmentBooking } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Patient routes
router.post('/', protect, authorize('patient'), validateAppointmentBooking, bookAppointment);
router.get('/my-appointments', protect, authorize('patient'), getPatientAppointments);
router.patch('/:id/cancel', protect, cancelAppointment);

// Doctor routes
router.get('/doctor-appointments', protect, authorize('doctor'), getDoctorAppointments);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllAppointmentsAdmin);

// Shared role routes (Patient, Doctor, Admin)
router.get('/:id', protect, getAppointmentById);
router.patch('/:id/status', protect, authorize('doctor', 'admin'), updateAppointmentStatus);

export default router;
