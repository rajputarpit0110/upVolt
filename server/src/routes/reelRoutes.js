import { Hono } from 'hono';
import {
  getReels,
  createReel,
  deleteReel
} from '../controllers/reelController.js';
import { protect, authorize } from '../middlewares/auth.js';
import { adaptHandler } from '../utils/honoAdapter.js';

const router = new Hono();

// Public: get all active reels
router.get('/', adaptHandler(getReels));

// Protected: Only Admin and Master Admin can add or delete reels
router.post('/', protect, authorize('admin', 'master_admin'), adaptHandler(createReel));
router.delete('/:id', protect, authorize('admin', 'master_admin'), adaptHandler(deleteReel));

export default router;
