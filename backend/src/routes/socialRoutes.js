import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { discoverUsers, feed, followUser } from '../controllers/socialController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/feed', requireAuth, requireRole('learner'), asyncHandler(feed));
router.get('/users', requireAuth, requireRole('learner'), asyncHandler(discoverUsers));
router.post('/follow/:userId', requireAuth, requireRole('learner'), asyncHandler(followUser));

export default router;
