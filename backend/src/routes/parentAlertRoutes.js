import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { getAlertPreference, parentAlertPreview, updateAlertPreference, weeklyParentReport } from '../controllers/parentAlertController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.get('/preferences', requireAuth, asyncHandler(getAlertPreference));
router.patch('/preferences', requireAuth, asyncHandler(updateAlertPreference));
router.get('/preview', requireAuth, asyncHandler(parentAlertPreview));
router.get('/weekly-report', requireAuth, asyncHandler(weeklyParentReport));

export default router;
