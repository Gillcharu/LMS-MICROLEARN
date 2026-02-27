import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { connectIntegration, disconnectIntegration, myIntegrations } from '../controllers/integrationController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.get('/', requireAuth, asyncHandler(myIntegrations));
router.post('/connect', requireAuth, asyncHandler(connectIntegration));
router.post('/:provider/disconnect', requireAuth, asyncHandler(disconnectIntegration));

export default router;
