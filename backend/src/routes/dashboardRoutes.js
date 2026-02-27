import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { dashboard } from '../controllers/dashboardController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.get('/', requireAuth, requireRole('learner'), asyncHandler(dashboard));

export default router;
