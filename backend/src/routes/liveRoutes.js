import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  addSessionRecording,
  createLiveSession,
  creatorLiveSessions,
  enrollLiveSession,
  listLiveSessions,
  listSessionRecordings
} from '../controllers/liveController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.get('/', requireAuth, asyncHandler(listLiveSessions));
router.post('/', requireAuth, requireRole('creator', 'admin'), asyncHandler(createLiveSession));
router.get('/creator/mine', requireAuth, requireRole('creator', 'admin'), asyncHandler(creatorLiveSessions));
router.post('/:sessionId/enroll', requireAuth, requireRole('learner'), asyncHandler(enrollLiveSession));
router.get('/:sessionId/recordings', requireAuth, asyncHandler(listSessionRecordings));
router.post('/:sessionId/recordings', requireAuth, requireRole('creator', 'admin'), asyncHandler(addSessionRecording));

export default router;
