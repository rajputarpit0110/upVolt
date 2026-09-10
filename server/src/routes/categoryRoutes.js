import { Hono } from 'hono';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { protect, authorize } from '../middlewares/auth.js';
import { adaptHandler } from '../utils/honoAdapter.js';

const router = new Hono();

// Public: Fetch all active categories (or all if admin)
router.get('/', adaptHandler(getCategories));

// Admin only: Add, update, delete categories
router.post('/', protect, authorize('admin', 'master_admin'), adaptHandler(createCategory));
router.put('/:id', protect, authorize('admin', 'master_admin'), adaptHandler(updateCategory));
router.delete('/:id', protect, authorize('admin', 'master_admin'), adaptHandler(deleteCategory));

export default router;
