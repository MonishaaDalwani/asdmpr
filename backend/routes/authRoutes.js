import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  getAllPatients,
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validateRegister, validateLogin } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.get('/patients', protect, authorize('admin'), getAllPatients);

export default router;
