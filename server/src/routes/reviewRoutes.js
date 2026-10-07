import { Hono } from 'hono';
import { 
  getEligibleProducts, 
  createReview, 
  getProductReviews 
} from '../controllers/reviewController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = new Hono();

// Public route to get reviews for a specific product
router.get('/:productId', getProductReviews);

// Protected routes (require login)
router.get('/user/eligible', protect, getEligibleProducts);
router.post('/', protect, createReview);

export default router;
