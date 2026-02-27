import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { adminAnalytics, creatorAnalytics } from '../controllers/analyticsController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.get('/creator', requireAuth, requireRole('creator', 'admin'), asyncHandler(creatorAnalytics));
router.get('/admin', requireAuth, requireRole('admin'), asyncHandler(adminAnalytics));

export default router;
