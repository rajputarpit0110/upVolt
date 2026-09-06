import { Hono } from 'hono';
import { getAuditLogs, getAdminStats } from '../controllers/adminController.js';
import { protect, authorize } from '../middlewares/auth.js';
import { adaptHandler } from '../utils/honoAdapter.js';

const router = new Hono();

// Activity Audit Logs (Visible to all 3 Administrators)
router.get('/audit-logs', protect, authorize('admin', 'master_admin'), adaptHandler(getAuditLogs));

// Admin & Master Admin stats
router.get('/stats', protect, authorize('admin', 'master_admin'), adaptHandler(getAdminStats));

export default router;
