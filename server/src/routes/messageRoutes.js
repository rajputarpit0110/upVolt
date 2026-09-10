import { Hono } from 'hono';
import {
  createMessage,
  getMessages,
  updateMessageStatus,
  deleteMessage
} from '../controllers/messageController.js';
import { protect, authorize } from '../middlewares/auth.js';
import { adaptHandler } from '../utils/honoAdapter.js';

const router = new Hono();

// Public: Submit contact form message
router.post('/', adaptHandler(createMessage));

// Admin-only: Fetch all received inquiries
router.get('/', protect, authorize('admin', 'master_admin'), adaptHandler(getMessages));

// Admin-only: Update status (unread, read, replied)
router.patch('/:id/status', protect, authorize('admin', 'master_admin'), adaptHandler(updateMessageStatus));

// Admin-only: Delete message
router.delete('/:id', protect, authorize('admin', 'master_admin'), adaptHandler(deleteMessage));

export default router;
