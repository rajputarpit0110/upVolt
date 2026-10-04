import { Hono } from 'hono';
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  cancelMyOrder
} from '../controllers/orderController.js';
import { protect, authorize } from '../middlewares/auth.js';
import { adaptHandler } from '../utils/honoAdapter.js';
import { checkoutRateLimiter } from '../middlewares/otpRateLimiter.js';

const router = new Hono();

// Public / student endpoints
router.post('/', checkoutRateLimiter, adaptHandler(createOrder));
router.get('/my-orders', protect, adaptHandler(getMyOrders));
router.put('/:id/cancel', protect, adaptHandler(cancelMyOrder));

// Admin endpoints
router.get('/', protect, authorize('admin', 'master_admin'), adaptHandler(getAllOrders));
router.put('/:id/status', protect, authorize('admin', 'master_admin'), adaptHandler(updateOrderStatus));
router.delete('/:id', protect, authorize('admin', 'master_admin'), adaptHandler(deleteOrder));

export default router;
