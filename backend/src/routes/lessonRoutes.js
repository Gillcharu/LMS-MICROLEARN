import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { createLesson, getLesson, listLessons, publishLesson, searchLessons, updateLesson } from '../controllers/lessonController.js';
import { addComment, toggleLike } from '../controllers/socialController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, requireRole('learner'), asyncHandler(listLessons));
router.get('/search', requireAuth, requireRole('learner'), asyncHandler(searchLessons));
router.get('/:lessonId', requireAuth, requireRole('learner'), asyncHandler(getLesson));
router.post('/', requireAuth, requireRole('creator', 'admin'), asyncHandler(createLesson));
router.patch('/:lessonId', requireAuth, requireRole('creator', 'admin'), asyncHandler(updateLesson));
router.post('/:lessonId/publish', requireAuth, requireRole('creator', 'admin'), asyncHandler(publishLesson));
router.post('/:lessonId/comments', requireAuth, requireRole('learner'), asyncHandler(addComment));
router.post('/:lessonId/likes/toggle', requireAuth, requireRole('learner'), asyncHandler(toggleLike));

export default router;
