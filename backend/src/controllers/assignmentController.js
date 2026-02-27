import { Assignment, AssignmentSubmission, Lesson, Progress, User } from '../models/index.js';
import { createNotification } from '../services/notificationService.js';
import { httpError } from '../utils/httpError.js';

export async function createAssignment(req, res, next) {
  const { lessonId, title, description, dueAt, maxPoints = 100 } = req.body;
  if (!lessonId || !title || !description) return next(httpError(400, 'lessonId, title and description are required'));

  const lesson = await Lesson.findByPk(lessonId);
  if (!lesson || lesson.creatorId !== req.user.id) return next(httpError(403, 'Can only create assignments for your own lessons'));

  const row = await Assignment.create({ creatorId: req.user.id, lessonId, title, description, dueAt, maxPoints, published: true });

  const activeLearners = await Progress.findAll({
    where: { lessonId },
    attributes: ['userId'],
    group: ['userId']
  });
  await Promise.all(activeLearners.map((p) => createNotification({
    userId: p.userId,
    type: 'assignment_new',
    title: 'New assignment available',
    message: `New assignment posted: ${title}`
  })));

  res.status(201).json(row);
}

export async function listAssignments(req, res) {
  const rows = await Assignment.findAll({
    where: { published: true },
    include: [{ model: Lesson, attributes: ['id', 'title'] }, { model: User, as: 'creator', attributes: ['id', 'name'] }],
    order: [['createdAt', 'DESC']]
  });
  res.json(rows);
}

export async function submitAssignment(req, res, next) {
  const assignment = await Assignment.findByPk(req.params.assignmentId);
  if (!assignment || !assignment.published) return next(httpError(404, 'Assignment not found'));

  const { content, attachmentUrl } = req.body;
  if (!content) return next(httpError(400, 'content is required'));

  const [row] = await AssignmentSubmission.findOrCreate({
    where: { assignmentId: assignment.id, userId: req.user.id },
    defaults: { content, attachmentUrl, status: 'submitted' }
  });

  if (row.content !== content || row.attachmentUrl !== attachmentUrl) {
    row.content = content;
    row.attachmentUrl = attachmentUrl;
    row.status = 'submitted';
    await row.save();
  }

  res.status(201).json(row);
}

export async function gradeSubmission(req, res, next) {
  const submission = await AssignmentSubmission.findByPk(req.params.submissionId, { include: [{ model: Assignment }] });
  if (!submission) return next(httpError(404, 'Submission not found'));
  if (submission.Assignment.creatorId !== req.user.id && req.user.role !== 'admin') return next(httpError(403, 'Not allowed'));

  submission.score = req.body.score ?? submission.score;
  submission.feedback = req.body.feedback ?? submission.feedback;
  submission.status = 'graded';
  await submission.save();
  await createNotification({
    userId: submission.userId,
    type: 'assignment_graded',
    title: 'Assignment graded',
    message: `${submission.Assignment?.title || 'Assignment'} was graded.`
  });

  res.json(submission);
}

export async function mySubmissions(req, res) {
  const rows = await AssignmentSubmission.findAll({
    where: { userId: req.user.id },
    include: [{ model: Assignment, include: [{ model: Lesson, attributes: ['id', 'title'] }] }],
    order: [['updatedAt', 'DESC']]
  });
  res.json(rows);
}

export async function creatorSubmissions(req, res) {
  const rows = await AssignmentSubmission.findAll({
    include: [
      { model: Assignment, where: { creatorId: req.user.id }, include: [{ model: Lesson, attributes: ['id', 'title'] }] },
      { model: User, attributes: ['id', 'name', 'email'] }
    ],
    order: [['updatedAt', 'DESC']]
  });
  res.json(rows);
}
