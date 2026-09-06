import { Hono } from 'hono';
import {
  getCoupons,
  createCoupon,
  deleteCoupon,
  validateCoupon
} from '../controllers/couponController.js';
import { protect, authorize } from '../middlewares/auth.js';
import { adaptHandler } from '../utils/honoAdapter.js';

const router = new Hono();

// Public route to validate coupon in cart & checkout
router.post('/validate', adaptHandler(validateCoupon));

// Admin-only management routes
router.get('/', protect, authorize('admin', 'master_admin'), adaptHandler(getCoupons));
router.post('/', protect, authorize('admin', 'master_admin'), adaptHandler(createCoupon));
router.delete('/:id', protect, authorize('admin', 'master_admin'), adaptHandler(deleteCoupon));

export default router;
