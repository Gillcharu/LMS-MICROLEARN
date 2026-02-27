import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { childProgress, linkParent, myLinkedParents, parentChildren } from '../controllers/parentController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/link', requireAuth, asyncHandler(linkParent));
router.get('/mine', requireAuth, asyncHandler(myLinkedParents));
router.get('/children', requireAuth, asyncHandler(parentChildren));
router.get('/children/:childId/progress', requireAuth, asyncHandler(childProgress));

export default router;
