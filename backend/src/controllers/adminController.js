import { ContentFlag, Lesson, User } from '../models/index.js';
import { httpError } from '../utils/httpError.js';

export async function adminOverview(req, res) {
  const [users, creators, learners, parents, pendingLessons, openFlags] = await Promise.all([
    User.count(),
    User.count({ where: { role: 'creator' } }),
    User.count({ where: { role: 'learner' } }),
    User.count({ where: { role: 'parent' } }),
    Lesson.count({ where: { published: false } }),
    ContentFlag.count({ where: { status: 'open' } })
  ]);

  res.json({ users, creators, learners, parents, pendingLessons, openFlags });
}

export async function reportLesson(req, res, next) {
  const lessonId = Number(req.params.lessonId);
  const lesson = await Lesson.findByPk(lessonId);
  if (!lesson) return next(httpError(404, 'Lesson not found'));

  const row = await ContentFlag.create({ reporterId: req.user.id, lessonId, reason: req.body.reason || 'Inappropriate content' });
  res.status(201).json(row);
}

export async function listFlags(req, res) {
  const rows = await ContentFlag.findAll({ include: [{ model: Lesson }, { model: User, as: 'reporter', attributes: ['id', 'name'] }], order: [['createdAt', 'DESC']] });
  res.json(rows);
}

export async function resolveFlag(req, res, next) {
  const row = await ContentFlag.findByPk(req.params.flagId);
  if (!row) return next(httpError(404, 'Flag not found'));

  row.status = 'resolved';
  await row.save();
  res.json(row);
}

export async function setLessonVisibility(req, res, next) {
  const lesson = await Lesson.findByPk(req.params.lessonId);
  if (!lesson) return next(httpError(404, 'Lesson not found'));

  lesson.published = Boolean(req.body.published);
  await lesson.save();
  res.json({ id: lesson.id, published: lesson.published });
}
