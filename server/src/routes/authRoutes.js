import { Hono } from 'hono';
import { loginUser, registerUser, getMe, resetPassword } from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';
import { adaptHandler } from '../utils/honoAdapter.js';

const router = new Hono();

router.post('/login', adaptHandler(loginUser));
router.post('/register', adaptHandler(registerUser));
router.get('/me', protect, adaptHandler(getMe));
router.post('/reset-password', protect, adaptHandler(resetPassword));

export default router;
