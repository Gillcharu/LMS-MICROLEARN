import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { adminOverview, listFlags, reportLesson, resolveFlag, setLessonVisibility } from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.get('/overview', requireAuth, requireRole('admin'), asyncHandler(adminOverview));
router.get('/flags', requireAuth, requireRole('admin'), asyncHandler(listFlags));
router.post('/flags/:flagId/resolve', requireAuth, requireRole('admin'), asyncHandler(resolveFlag));
router.post('/lessons/:lessonId/visibility', requireAuth, requireRole('admin'), asyncHandler(setLessonVisibility));
router.post('/lessons/:lessonId/report', requireAuth, asyncHandler(reportLesson));

export default router;
