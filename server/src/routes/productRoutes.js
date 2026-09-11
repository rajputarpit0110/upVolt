import { Hono } from 'hono';
import {
  getProducts,
  getProductById,
  getRelatedProducts,
  createProduct,
  updateProduct,  
  deleteProduct,
  seedProducts
} from '../controllers/productController.js';
import { protect, authorize } from '../middlewares/auth.js';
import { adaptHandler } from '../utils/honoAdapter.js';

const router = new Hono();

router.get('/', adaptHandler(getProducts));
router.get('/:id/related', adaptHandler(getRelatedProducts));
router.get('/:id', adaptHandler(getProductById));

// Protected routes: Only Admin and Master Admin can add, edit, or delete products
router.post('/', protect, authorize('admin', 'master_admin'), adaptHandler(createProduct));
router.put('/:id', protect, authorize('admin', 'master_admin'), adaptHandler(updateProduct));
router.delete('/:id', protect, authorize('admin', 'master_admin'), adaptHandler(deleteProduct));
router.post('/seed', protect, authorize('admin', 'master_admin'), adaptHandler(seedProducts));

export default router;
