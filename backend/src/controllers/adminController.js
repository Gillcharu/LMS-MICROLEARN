import { ContentFlag, Lesson, ModerationAudit, User, UserSuspension } from '../models/index.js';
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

export async function decideFlag(req, res, next) {
  const row = await ContentFlag.findByPk(req.params.flagId);
  if (!row) return next(httpError(404, 'Flag not found'));

  const { decision, note = '' } = req.body;
  if (!['approve', 'reject'].includes(decision)) return next(httpError(400, 'decision must be approve or reject'));

  row.status = 'resolved';
  await row.save();

  await ModerationAudit.create({
    adminId: req.user.id,
    targetType: 'content_flag',
    targetId: row.id,
    action: `flag_${decision}`,
    note
  });

  res.json({ ...row.toJSON(), decision, note });
}

export async function setLessonVisibility(req, res, next) {
  const lesson = await Lesson.findByPk(req.params.lessonId);
  if (!lesson) return next(httpError(404, 'Lesson not found'));

  lesson.published = Boolean(req.body.published);
  await lesson.save();
  res.json({ id: lesson.id, published: lesson.published });
}

export async function suspendUser(req, res, next) {
  const userId = Number(req.params.userId);
  const user = await User.findByPk(userId);
  if (!user) return next(httpError(404, 'User not found'));
  if (user.role === 'admin') return next(httpError(400, 'Cannot suspend an admin account'));

  const reason = req.body.reason || 'Policy violation';
  const suspendedUntil = req.body.suspendedUntil || null;
  const [row] = await UserSuspension.findOrCreate({
    where: { userId },
    defaults: { reason, suspendedUntil, active: true }
  });
  await row.update({ reason, suspendedUntil, active: true });

  await ModerationAudit.create({
    adminId: req.user.id,
    targetType: 'user',
    targetId: user.id,
    action: 'suspend_user',
    note: reason
  });

  res.json(row);
}

export async function unsuspendUser(req, res, next) {
  const row = await UserSuspension.findOne({ where: { userId: Number(req.params.userId), active: true } });
  if (!row) return next(httpError(404, 'Active suspension not found'));
  await row.update({ active: false });

  await ModerationAudit.create({
    adminId: req.user.id,
    targetType: 'user',
    targetId: row.userId,
    action: 'unsuspend_user',
    note: req.body.note || 'Manual unsuspend'
  });

  res.json({ message: 'User unsuspended' });
}

export async function listSuspensions(_req, res) {
  const rows = await UserSuspension.findAll({
    include: [{ model: User, attributes: ['id', 'name', 'email', 'role'] }],
    order: [['updatedAt', 'DESC']]
  });
  res.json(rows);
}

export async function moderationAuditLog(_req, res) {
  const rows = await ModerationAudit.findAll({
    include: [{ model: User, as: 'admin', attributes: ['id', 'name'] }],
    order: [['createdAt', 'DESC']],
    limit: 200
  });
  res.json(rows);
}
