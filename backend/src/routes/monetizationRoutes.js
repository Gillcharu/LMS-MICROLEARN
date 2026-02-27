import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { createOffering, creatorRevenue, listMarketplace, myPurchases, purchaseOffering } from '../controllers/monetizationController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.get('/marketplace', requireAuth, asyncHandler(listMarketplace));
router.get('/purchases/mine', requireAuth, requireRole('learner'), asyncHandler(myPurchases));
router.post('/offerings', requireAuth, requireRole('creator', 'admin'), asyncHandler(createOffering));
router.post('/offerings/:offeringId/purchase', requireAuth, requireRole('learner'), asyncHandler(purchaseOffering));
router.get('/creator/revenue', requireAuth, requireRole('creator', 'admin'), asyncHandler(creatorRevenue));

export default router;
