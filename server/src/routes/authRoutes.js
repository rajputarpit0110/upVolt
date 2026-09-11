import { Hono } from 'hono';
import {
  loginUser,
  registerUser,
  verifyOtp,
  resendOtp,
  getMe,
  resetPassword
} from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';
import { adaptHandler } from '../utils/honoAdapter.js';
import { otpSendRateLimiter, otpVerifyRateLimiter } from '../middlewares/otpRateLimiter.js';

const router = new Hono();

router.post('/login', adaptHandler(loginUser));
router.post('/register', otpSendRateLimiter, adaptHandler(registerUser));
router.post('/verify-otp', otpVerifyRateLimiter, adaptHandler(verifyOtp));
router.post('/resend-otp', otpSendRateLimiter, adaptHandler(resendOtp));
router.post('/send-otp', otpSendRateLimiter, adaptHandler(resendOtp));
router.get('/me', protect, adaptHandler(getMe));
router.post('/reset-password', protect, adaptHandler(resetPassword));

export default router;

