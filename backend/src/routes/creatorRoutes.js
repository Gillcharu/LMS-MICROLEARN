import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  creatorLibrary,
  creatorSummary,
  duplicateLesson,
  toggleLessonPublish,
  togglePathPublish,
  updatePathLessons
} from '../controllers/creatorController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/summary', requireAuth, requireRole('creator', 'admin'), asyncHandler(creatorSummary));
router.get('/library', requireAuth, requireRole('creator', 'admin'), asyncHandler(creatorLibrary));
router.post('/lessons/:lessonId/duplicate', requireAuth, requireRole('creator', 'admin'), asyncHandler(duplicateLesson));
router.post('/lessons/:lessonId/toggle-publish', requireAuth, requireRole('creator', 'admin'), asyncHandler(toggleLessonPublish));
router.post('/paths/:pathId/toggle-publish', requireAuth, requireRole('creator', 'admin'), asyncHandler(togglePathPublish));
router.post('/paths/:pathId/reorder', requireAuth, requireRole('creator', 'admin'), asyncHandler(updatePathLessons));

export default router;
