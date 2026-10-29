import { Hono } from 'hono';
import {
  getEligibleProducts,
  createReview,
  getProductReviews
} from '../controllers/reviewController.js';
import { protect, optionalAuth } from '../middlewares/auth.js';
import { adaptHandler } from '../utils/honoAdapter.js';

const router = new Hono();

// Public route to get reviews for a specific product
router.get('/:productId', adaptHandler(getProductReviews));

// Protected route to get user's eligible products
router.get('/user/eligible', protect, adaptHandler(getEligibleProducts));

// Create or update review (supports both logged in users and guest student makers)
router.post('/', optionalAuth, adaptHandler(createReview));

export default router;
