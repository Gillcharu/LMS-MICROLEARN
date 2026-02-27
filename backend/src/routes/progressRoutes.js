import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { myProgress, submitQuiz, updateLessonProgress } from '../controllers/progressController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/mine', requireAuth, requireRole('learner'), asyncHandler(myProgress));
router.post('/lessons/:lessonId', requireAuth, requireRole('learner'), asyncHandler(updateLessonProgress));
router.post('/lessons/:lessonId/quiz', requireAuth, requireRole('learner'), asyncHandler(submitQuiz));

export default router;
