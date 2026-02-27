import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  createCheckoutSession,
  createOffering,
  creatorRevenue,
  listMarketplace,
  myPurchases,
  purchaseOffering,
  stripeWebhook
} from '../controllers/monetizationController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.post('/webhook/stripe', asyncHandler(stripeWebhook));
router.get('/marketplace', requireAuth, asyncHandler(listMarketplace));
router.get('/purchases/mine', requireAuth, requireRole('learner'), asyncHandler(myPurchases));
router.post('/offerings', requireAuth, requireRole('creator', 'admin'), asyncHandler(createOffering));
router.post('/offerings/:offeringId/purchase', requireAuth, requireRole('learner'), asyncHandler(purchaseOffering));
router.post('/offerings/:offeringId/checkout', requireAuth, requireRole('learner'), asyncHandler(createCheckoutSession));
router.get('/creator/revenue', requireAuth, requireRole('creator', 'admin'), asyncHandler(creatorRevenue));

export default router;
