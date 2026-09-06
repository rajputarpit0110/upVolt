import { Hono } from 'hono';
import { pingVisitor, getLiveAnalytics, resetAnalytics } from '../controllers/analyticsController.js';
import { protect, authorize } from '../middlewares/auth.js';
import { adaptHandler } from '../utils/honoAdapter.js';

const router = new Hono();

// Public heartbeat endpoint from client visitors
router.post('/ping', adaptHandler(pingVisitor));

// Protected live analytics for all 3 admins (admin & master_admin)
router.get('/live', protect, authorize('admin', 'master_admin'), adaptHandler(getLiveAnalytics));

// Protected: Clear pre-deployment / test data
router.delete('/reset', protect, authorize('admin', 'master_admin'), adaptHandler(resetAnalytics));

export default router;
