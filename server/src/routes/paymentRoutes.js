import { Hono } from 'hono';
import {
  getRazorpayKey,
  createRazorpayOrder,
  verifyRazorpayPayment
} from '../controllers/paymentController.js';
import { adaptHandler } from '../utils/honoAdapter.js';

const router = new Hono();

// GET /api/payments/razorpay/key - Fetch Razorpay public key ID
router.get('/razorpay/key', adaptHandler(getRazorpayKey));

// POST /api/payments/razorpay/create-order - Initialize a transaction
router.post('/razorpay/create-order', adaptHandler(createRazorpayOrder));

// POST /api/payments/razorpay/verify - Verify signature and place confirmed order
router.post('/razorpay/verify', adaptHandler(verifyRazorpayPayment));

export default router;
