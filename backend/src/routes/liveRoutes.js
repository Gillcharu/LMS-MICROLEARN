import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { createLiveSession, creatorLiveSessions, enrollLiveSession, listLiveSessions } from '../controllers/liveController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.get('/', requireAuth, asyncHandler(listLiveSessions));
router.post('/', requireAuth, requireRole('creator', 'admin'), asyncHandler(createLiveSession));
router.get('/creator/mine', requireAuth, requireRole('creator', 'admin'), asyncHandler(creatorLiveSessions));
router.post('/:sessionId/enroll', requireAuth, requireRole('learner'), asyncHandler(enrollLiveSession));

export default router;
