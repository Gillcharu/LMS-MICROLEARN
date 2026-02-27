import { Progress, ParentChildLink, User, Lesson } from '../models/index.js';
import { httpError } from '../utils/httpError.js';

export async function linkParent(req, res, next) {
  if (req.user.role !== 'learner') return next(httpError(403, 'Only learners can link a parent account'));

  const { parentEmail } = req.body;
  if (!parentEmail) return next(httpError(400, 'parentEmail is required'));

  const parent = await User.findOne({ where: { email: parentEmail } });
  if (!parent) return next(httpError(404, 'Parent account not found'));

  await ParentChildLink.findOrCreate({ where: { parentId: parent.id, childId: req.user.id } });
  res.json({ message: 'Parent linked successfully', parent: { id: parent.id, name: parent.name, email: parent.email } });
}

export async function myLinkedParents(req, res) {
  const parents = await req.user.getParents({ joinTableAttributes: [], attributes: ['id', 'name', 'email', 'role'] });
  res.json(parents);
}

export async function parentChildren(req, res, next) {
  if (req.user.role !== 'parent' && req.user.role !== 'admin') return next(httpError(403, 'Only parent accounts can view this'));

  const children = await req.user.getChildren({ joinTableAttributes: [], attributes: ['id', 'name', 'email', 'points', 'streakDays'] });
  res.json(children);
}

export async function childProgress(req, res, next) {
  if (req.user.role !== 'parent' && req.user.role !== 'admin') return next(httpError(403, 'Only parent accounts can view this'));

  const childId = Number(req.params.childId);
  const linked = await ParentChildLink.findOne({ where: { parentId: req.user.id, childId } });
  if (!linked && req.user.role !== 'admin') return next(httpError(403, 'Child is not linked to your account'));

  const child = await User.findByPk(childId, { attributes: ['id', 'name', 'email', 'points', 'streakDays'] });
  if (!child) return next(httpError(404, 'Child not found'));

  const progress = await Progress.findAll({
    where: { userId: childId },
    include: [{ model: Lesson, attributes: ['id', 'title', 'category', 'durationMinutes'] }],
    order: [['updatedAt', 'DESC']],
    limit: 30
  });

  res.json({ child, progress });
}
