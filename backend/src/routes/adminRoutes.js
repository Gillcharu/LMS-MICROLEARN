import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  adminOverview,
  decideFlag,
  listFlags,
  listSuspensions,
  moderationAuditLog,
  reportLesson,
  resolveFlag,
  setLessonVisibility,
  suspendUser,
  unsuspendUser
} from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.get('/overview', requireAuth, requireRole('admin'), asyncHandler(adminOverview));
router.get('/flags', requireAuth, requireRole('admin'), asyncHandler(listFlags));
router.post('/flags/:flagId/resolve', requireAuth, requireRole('admin'), asyncHandler(resolveFlag));
router.post('/flags/:flagId/decision', requireAuth, requireRole('admin'), asyncHandler(decideFlag));
router.get('/suspensions', requireAuth, requireRole('admin'), asyncHandler(listSuspensions));
router.post('/users/:userId/suspend', requireAuth, requireRole('admin'), asyncHandler(suspendUser));
router.post('/users/:userId/unsuspend', requireAuth, requireRole('admin'), asyncHandler(unsuspendUser));
router.get('/audit-log', requireAuth, requireRole('admin'), asyncHandler(moderationAuditLog));
router.post('/lessons/:lessonId/visibility', requireAuth, requireRole('admin'), asyncHandler(setLessonVisibility));
router.post('/lessons/:lessonId/report', requireAuth, asyncHandler(reportLesson));

export default router;
