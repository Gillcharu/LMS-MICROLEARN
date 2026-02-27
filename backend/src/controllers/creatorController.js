import { LearningPath, Lesson, PathEnrollment, PathLesson, QuizQuestion } from '../models/index.js';
import { httpError } from '../utils/httpError.js';

export async function creatorSummary(req, res) {
  const creatorId = req.user.id;
  const [lessonCount, publishedLessons, pathCount, publishedPaths] = await Promise.all([
    Lesson.count({ where: { creatorId } }),
    Lesson.count({ where: { creatorId, published: true } }),
    LearningPath.count({ where: { creatorId } }),
    LearningPath.count({ where: { creatorId, published: true } })
  ]);

  const recentLessons = await Lesson.findAll({
    where: { creatorId },
    include: [{ model: QuizQuestion, as: 'quizQuestions' }],
    order: [['createdAt', 'DESC']],
    limit: 8
  });

  res.json({ lessonCount, publishedLessons, pathCount, publishedPaths, recentLessons });
}

export async function creatorLibrary(req, res) {
  const creatorId = req.user.id;

  const lessons = await Lesson.findAll({
    where: { creatorId },
    include: [{ model: QuizQuestion, as: 'quizQuestions' }],
    order: [['updatedAt', 'DESC']]
  });

  const paths = await LearningPath.findAll({
    where: { creatorId },
    include: [{ model: Lesson, as: 'lessons', through: { attributes: ['orderIndex'] } }],
    order: [['updatedAt', 'DESC']]
  });

  const pathIds = paths.map((p) => p.id);
  const enrollmentRows = pathIds.length ? await PathEnrollment.findAll({ where: { pathId: pathIds } }) : [];
  const enrollmentCountByPath = {};
  for (const row of enrollmentRows) {
    enrollmentCountByPath[row.pathId] = (enrollmentCountByPath[row.pathId] || 0) + 1;
  }

  res.json({
    lessons,
    paths: paths.map((p) => ({ ...p.toJSON(), enrollmentCount: enrollmentCountByPath[p.id] || 0 }))
  });
}

export async function duplicateLesson(req, res, next) {
  const source = await Lesson.findByPk(req.params.lessonId, {
    include: [{ model: QuizQuestion, as: 'quizQuestions' }]
  });
  if (!source) return next(httpError(404, 'Lesson not found'));
  if (source.creatorId !== req.user.id && req.user.role !== 'admin') return next(httpError(403, 'Not allowed'));

  const copy = await Lesson.create({
    creatorId: req.user.id,
    title: `${source.title} (Copy)`,
    description: source.description,
    category: source.category,
    durationMinutes: source.durationMinutes,
    contentType: source.contentType,
    contentBody: source.contentBody,
    mediaUrl: source.mediaUrl,
    difficulty: source.difficulty,
    published: false
  });

  if (source.quizQuestions?.length) {
    await QuizQuestion.bulkCreate(
      source.quizQuestions.map((q) => ({
        lessonId: copy.id,
        prompt: q.prompt,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctOption: q.correctOption,
        explanation: q.explanation
      }))
    );
  }

  res.status(201).json({ id: copy.id, message: 'Lesson duplicated as draft' });
}

export async function toggleLessonPublish(req, res, next) {
  const lesson = await Lesson.findByPk(req.params.lessonId, { include: [{ model: QuizQuestion, as: 'quizQuestions' }] });
  if (!lesson) return next(httpError(404, 'Lesson not found'));
  if (lesson.creatorId !== req.user.id && req.user.role !== 'admin') return next(httpError(403, 'Not allowed'));

  if (!lesson.published) {
    if (lesson.durationMinutes < 5 || lesson.durationMinutes > 15) return next(httpError(400, 'Duration must be 5-15 minutes'));
    if (!lesson.quizQuestions || lesson.quizQuestions.length < 3 || lesson.quizQuestions.length > 5) {
      return next(httpError(400, 'Lesson must have 3-5 quiz questions'));
    }
  }

  lesson.published = !lesson.published;
  await lesson.save();
  res.json({ message: lesson.published ? 'Lesson published' : 'Lesson unpublished', published: lesson.published });
}

export async function togglePathPublish(req, res, next) {
  const path = await LearningPath.findByPk(req.params.pathId, {
    include: [{ model: Lesson, as: 'lessons' }]
  });
  if (!path) return next(httpError(404, 'Path not found'));
  if (path.creatorId !== req.user.id && req.user.role !== 'admin') return next(httpError(403, 'Not allowed'));

  if (!path.published && (!path.lessons || path.lessons.length === 0)) {
    return next(httpError(400, 'Path must include at least one lesson before publishing'));
  }

  path.published = !path.published;
  await path.save();
  res.json({ message: path.published ? 'Path published' : 'Path unpublished', published: path.published });
}

export async function updatePathLessons(req, res, next) {
  const path = await LearningPath.findByPk(req.params.pathId);
  if (!path) return next(httpError(404, 'Path not found'));
  if (path.creatorId !== req.user.id && req.user.role !== 'admin') return next(httpError(403, 'Not allowed'));

  const lessonIds = req.body.lessonIds || [];
  await PathLesson.destroy({ where: { pathId: path.id } });
  await Promise.all(lessonIds.map((lessonId, idx) => PathLesson.create({ pathId: path.id, lessonId, orderIndex: idx + 1 })));

  res.json({ message: 'Path lesson sequence updated' });
}
