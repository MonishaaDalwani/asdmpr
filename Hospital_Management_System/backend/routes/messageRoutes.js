import express from 'express';
import {
  createMessage,
  getAllMessages,
  getMessageById,
  replyMessage,
  deleteMessage,
} from '../controllers/messageController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validateMessageInput } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Optional user attachment for message sender
router.post('/', validateMessageInput, createMessage);

// Admin-only message management routes
router.get('/', protect, authorize('admin'), getAllMessages);
router.get('/:id', protect, authorize('admin'), getMessageById);
router.put('/:id/reply', protect, authorize('admin'), replyMessage);
router.delete('/:id', protect, authorize('admin'), deleteMessage);

export default router;
