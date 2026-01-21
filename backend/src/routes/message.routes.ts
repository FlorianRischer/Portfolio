// Author: Florian Rischer
import { Router } from 'express';
import {
  getAllMessages,
  getMessage,
  createMessage,
  markAsRead,
  deleteMessage
} from '../controllers/message.controller';

const router = Router();

// GET /api/messages - Get all messages
router.get('/', getAllMessages);

// GET /api/messages/:id - Get single message
router.get('/:id', getMessage);

// POST /api/messages - Create new message (contact form)
router.post('/', createMessage);

// PUT /api/messages/:id/read - Mark message as read
router.put('/:id/read', markAsRead);

// DELETE /api/messages/:id - Delete message
router.delete('/:id', deleteMessage);

export default router;
