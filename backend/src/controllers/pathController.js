import { LearningPath, Lesson, PathEnrollment, PathLesson, User } from '../models/index.js';
import { httpError } from '../utils/httpError.js';

export async function listPaths(req, res) {
  const paths = await LearningPath.findAll({
    where: { published: true },
    include: [
      { model: Lesson, as: 'lessons', through: { attributes: ['orderIndex'] } },
      { model: User, as: 'creator', attributes: ['id', 'name'] }
    ],
    order: [['createdAt', 'DESC']]
  });
  res.json(paths);
}

export async function createPath(req, res) {
  const { title, description, lessonIds = [] } = req.body;
  const path = await LearningPath.create({ creatorId: req.user.id, title, description, published: false });

  await Promise.all(
    lessonIds.map((lessonId, idx) => PathLesson.create({ pathId: path.id, lessonId, orderIndex: idx + 1 }))
  );

  res.status(201).json({ id: path.id });
}

export async function updatePath(req, res, next) {
  const path = await LearningPath.findByPk(req.params.pathId);
  if (!path) return next(httpError(404, 'Path not found'));
  if (path.creatorId !== req.user.id && req.user.role !== 'admin') return next(httpError(403, 'Not allowed'));

  const { title, description, lessonIds } = req.body;
  await path.update({ title: title ?? path.title, description: description ?? path.description });
  if (lessonIds) {
    await PathLesson.destroy({ where: { pathId: path.id } });
    await Promise.all(lessonIds.map((lessonId, idx) => PathLesson.create({ pathId: path.id, lessonId, orderIndex: idx + 1 })));
  }
  res.json({ message: 'Path updated' });
}

export async function publishPath(req, res, next) {
  const path = await LearningPath.findByPk(req.params.pathId);
  if (!path) return next(httpError(404, 'Path not found'));
  if (path.creatorId !== req.user.id && req.user.role !== 'admin') return next(httpError(403, 'Not allowed'));

  path.published = true;
  await path.save();
  res.json({ message: 'Path published' });
}

export async function enrollPath(req, res, next) {
  const path = await LearningPath.findByPk(req.params.pathId);
  if (!path || !path.published) return next(httpError(404, 'Path not found'));

  await PathEnrollment.findOrCreate({ where: { userId: req.user.id, pathId: path.id } });
  res.json({ message: 'Enrolled successfully' });
}
