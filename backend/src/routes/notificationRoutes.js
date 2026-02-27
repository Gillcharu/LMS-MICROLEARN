import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { checkStreakRisk, markNotificationRead, myNotifications } from '../controllers/notificationController.js';

const router = Router();
router.get('/mine', requireAuth, asyncHandler(myNotifications));
router.post('/streak-risk-check', requireAuth, asyncHandler(checkStreakRisk));
router.post('/:notificationId/read', requireAuth, asyncHandler(markNotificationRead));

export default router;
