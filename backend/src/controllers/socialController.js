import { Op } from 'sequelize';
import { Activity, Comment, Follow, Lesson, Like, User } from '../models/index.js';
import { httpError } from '../utils/httpError.js';

export async function addComment(req, res, next) {
  const lesson = await Lesson.findByPk(req.params.lessonId);
  if (!lesson || !lesson.published) return next(httpError(404, 'Lesson not found'));

  const comment = await Comment.create({ userId: req.user.id, lessonId: lesson.id, body: req.body.body });
  await Activity.create({ userId: req.user.id, type: 'social', message: `Commented on ${lesson.title}` });
  res.status(201).json(comment);
}

export async function toggleLike(req, res, next) {
  const lesson = await Lesson.findByPk(req.params.lessonId);
  if (!lesson || !lesson.published) return next(httpError(404, 'Lesson not found'));

  const existing = await Like.findOne({ where: { userId: req.user.id, lessonId: lesson.id } });
  if (existing) {
    await existing.destroy();
    return res.json({ liked: false });
  }

  await Like.create({ userId: req.user.id, lessonId: lesson.id });
  await Activity.create({ userId: req.user.id, type: 'social', message: `Liked lesson ${lesson.title}` });
  return res.json({ liked: true });
}

export async function followUser(req, res, next) {
  const targetId = Number(req.params.userId);
  if (targetId === req.user.id) return next(httpError(400, 'Cannot follow yourself'));

  const target = await User.findByPk(targetId);
  if (!target) return next(httpError(404, 'Target user not found'));

  await Follow.findOrCreate({ where: { followerId: req.user.id, followingId: targetId } });
  await Activity.create({ userId: req.user.id, type: 'social', message: `Started following ${target.name}` });
  res.json({ message: 'Following user' });
}

export async function feed(req, res) {
  const items = await Activity.findAll({
    include: [{ model: User, attributes: ['id', 'name'] }],
    order: [['createdAt', 'DESC']],
    limit: 50
  });
  res.json(items);
}

export async function discoverUsers(req, res) {
  const users = await User.findAll({
    where: { id: { [Op.ne]: req.user.id } },
    attributes: ['id', 'name', 'role', 'bio', 'points'],
    order: [['points', 'DESC']],
    limit: 20
  });
  res.json(users);
}
