import { Hono } from 'hono';
import {
  getMentors,
  createMentor,
  updateMentor,
  deleteMentor
} from '../controllers/mentorController.js';
import { protect, authorize } from '../middlewares/auth.js';
import { adaptHandler } from '../utils/honoAdapter.js';

const router = new Hono();

// Public: view active mentors
router.get('/', adaptHandler(getMentors));

// Protected: Only Admin and Master Admin can add, edit, or remove mentors
router.post('/', protect, authorize('admin', 'master_admin'), adaptHandler(createMentor));
router.put('/:id', protect, authorize('admin', 'master_admin'), adaptHandler(updateMentor));
router.delete('/:id', protect, authorize('admin', 'master_admin'), adaptHandler(deleteMentor));

export default router;
