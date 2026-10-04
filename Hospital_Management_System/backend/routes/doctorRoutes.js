import express from 'express';
import {
  getPublicDoctors,
  getDoctorById,
  getAllDoctorsAdmin,
  createDoctor,
  updateDoctor,
  toggleDoctorStatus,
} from '../controllers/doctorController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes for patient portal
router.get('/', getPublicDoctors);
router.get('/:id', getDoctorById);

// Admin routes for doctor management
router.get('/admin/all', protect, authorize('admin'), getAllDoctorsAdmin);
router.post('/', protect, authorize('admin'), createDoctor);
router.put('/:id', protect, authorize('admin'), updateDoctor);
router.patch('/:id/toggle-status', protect, authorize('admin'), toggleDoctorStatus);

export default router;
