import { Hono } from 'hono';
import {
  getDeliverySettings,
  updateDeliverySettings,
  getStatsSettings,
  updateStatsSettings
} from '../controllers/settingsController.js';
import { protect, authorize } from '../middlewares/auth.js';
import { adaptHandler } from '../utils/honoAdapter.js';

const router = new Hono();

// Public: get delivery pricing and settings for checkout & student UI
router.get('/delivery', adaptHandler(getDeliverySettings));

// Admin: update delivery fees, thresholds, and estimated timelines
router.put('/delivery', protect, authorize('admin', 'master_admin'), adaptHandler(updateDeliverySettings));

// Public: get homepage stats
router.get('/stats', adaptHandler(getStatsSettings));

// Admin: update homepage stats
router.put('/stats', protect, authorize('admin', 'master_admin'), adaptHandler(updateStatsSettings));

export default router;
