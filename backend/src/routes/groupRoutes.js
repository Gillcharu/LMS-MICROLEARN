import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { createGroup, createPost, getGroup, joinGroup, listGroups } from '../controllers/groupController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, requireRole('learner'), asyncHandler(listGroups));
router.get('/:groupId', requireAuth, requireRole('learner'), asyncHandler(getGroup));
router.post('/', requireAuth, requireRole('learner'), asyncHandler(createGroup));
router.post('/:groupId/join', requireAuth, requireRole('learner'), asyncHandler(joinGroup));
router.post('/:groupId/posts', requireAuth, requireRole('learner'), asyncHandler(createPost));

export default router;
