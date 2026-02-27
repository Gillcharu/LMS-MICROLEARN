import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { downloadCertificatePdf, issueCertificate, myCertificates } from '../controllers/certificateController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.get('/mine', requireAuth, requireRole('learner'), asyncHandler(myCertificates));
router.post('/lessons/:lessonId/issue', requireAuth, requireRole('learner'), asyncHandler(issueCertificate));
router.get('/:certificateId/pdf', requireAuth, requireRole('learner'), asyncHandler(downloadCertificatePdf));

export default router;
