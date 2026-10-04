import express from 'express';
import { getAdminStats, getDoctorStats } from '../controllers/statsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/admin', protect, authorize('admin'), getAdminStats);
router.get('/doctor', protect, authorize('doctor'), getDoctorStats);

export default router;
