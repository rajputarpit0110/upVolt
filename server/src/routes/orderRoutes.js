import { Hono } from 'hono';
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus
} from '../controllers/orderController.js';
import { protect, authorize } from '../middlewares/auth.js';
import { adaptHandler } from '../utils/honoAdapter.js';

const router = new Hono();

// Public / student endpoints
router.post('/', adaptHandler(createOrder));
router.get('/my-orders', adaptHandler(getMyOrders));

// Admin endpoints
router.get('/', protect, authorize('admin', 'master_admin'), adaptHandler(getAllOrders));
router.put('/:id/status', protect, authorize('admin', 'master_admin'), adaptHandler(updateOrderStatus));

export default router;
