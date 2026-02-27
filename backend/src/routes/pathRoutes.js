import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { createPath, enrollPath, listPaths, publishPath, updatePath } from '../controllers/pathController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, requireRole('learner'), asyncHandler(listPaths));
router.post('/', requireAuth, requireRole('creator', 'admin'), asyncHandler(createPath));
router.patch('/:pathId', requireAuth, requireRole('creator', 'admin'), asyncHandler(updatePath));
router.post('/:pathId/publish', requireAuth, requireRole('creator', 'admin'), asyncHandler(publishPath));
router.post('/:pathId/enroll', requireAuth, requireRole('learner'), asyncHandler(enrollPath));

export default router;
