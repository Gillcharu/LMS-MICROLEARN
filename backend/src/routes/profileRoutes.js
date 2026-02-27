import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { updateProfile } from '../controllers/profileController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.patch('/me', requireAuth, asyncHandler(updateProfile));

export default router;
