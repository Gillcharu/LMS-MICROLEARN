import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  createAssignment,
  creatorSubmissions,
  gradeSubmission,
  listAssignments,
  mySubmissions,
  submitAssignment
} from '../controllers/assignmentController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.get('/', requireAuth, requireRole('learner'), asyncHandler(listAssignments));
router.post('/', requireAuth, requireRole('creator', 'admin'), asyncHandler(createAssignment));
router.post('/:assignmentId/submit', requireAuth, requireRole('learner'), asyncHandler(submitAssignment));
router.get('/mine/submissions', requireAuth, requireRole('learner'), asyncHandler(mySubmissions));
router.get('/creator/submissions', requireAuth, requireRole('creator', 'admin'), asyncHandler(creatorSubmissions));
router.post('/submissions/:submissionId/grade', requireAuth, requireRole('creator', 'admin'), asyncHandler(gradeSubmission));

export default router;
