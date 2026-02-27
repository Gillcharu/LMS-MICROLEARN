import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { issueCertificate, myCertificates } from '../controllers/certificateController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.get('/mine', requireAuth, requireRole('learner'), asyncHandler(myCertificates));
router.post('/lessons/:lessonId/issue', requireAuth, requireRole('learner'), asyncHandler(issueCertificate));

export default router;
