import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { getHint, recommendations } from '../controllers/aiController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.post('/lessons/:lessonId/hint', requireAuth, requireRole('learner'), asyncHandler(getHint));
router.get('/recommendations', requireAuth, requireRole('learner'), asyncHandler(recommendations));

export default router;
