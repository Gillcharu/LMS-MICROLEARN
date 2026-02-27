import { Comment, Lesson, Like, QuizQuestion, User } from '../models/index.js';
import { Op } from 'sequelize';
import { httpError } from '../utils/httpError.js';
import { addPoints } from '../services/gamificationService.js';

function validateLessonInput({ durationMinutes, quizQuestions }) {
  if (durationMinutes < 5 || durationMinutes > 15) throw httpError(400, 'Lesson duration must be between 5 and 15 minutes');
  if (!Array.isArray(quizQuestions) || quizQuestions.length < 3 || quizQuestions.length > 5) {
    throw httpError(400, 'Each lesson must include 3 to 5 quiz questions');
  }
}

export async function listLessons(req, res) {
  const lessons = await Lesson.findAll({
    where: { published: true },
    include: [{ model: User, as: 'creator', attributes: ['id', 'name'] }, { model: QuizQuestion, as: 'quizQuestions' }],
    order: [['createdAt', 'DESC']]
  });
  res.json(lessons);
}

export async function searchLessons(req, res) {
  const {
    q = '',
    topic = '',
    tags = '',
    creator = '',
    difficulty = ''
  } = req.query;

  const where = { published: true };
  if (difficulty) where.difficulty = difficulty;
  if (topic) where.category = { [Op.like]: `%${topic}%` };

  const searchTokens = [q, ...String(tags).split(',').map((t) => t.trim()).filter(Boolean)].filter(Boolean);
  if (searchTokens.length) {
    where[Op.and] = searchTokens.map((token) => ({
      [Op.or]: [
        { title: { [Op.like]: `%${token}%` } },
        { description: { [Op.like]: `%${token}%` } },
        { category: { [Op.like]: `%${token}%` } }
      ]
    }));
  }

  const lessons = await Lesson.findAll({
    where,
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'name'],
        where: creator ? { name: { [Op.like]: `%${creator}%` } } : undefined
      },
      { model: QuizQuestion, as: 'quizQuestions' }
    ],
    order: [['createdAt', 'DESC']]
  });
  res.json(lessons);
}

export async function getLesson(req, res, next) {
  const lesson = await Lesson.findByPk(req.params.lessonId, {
    include: [
      { model: QuizQuestion, as: 'quizQuestions' },
      { model: Comment, include: [{ model: User, attributes: ['id', 'name'] }] },
      { model: Like }
    ]
  });
  if (!lesson || !lesson.published) return next(httpError(404, 'Lesson not found'));
  res.json(lesson);
}

export async function createLesson(req, res, next) {
  try {
    validateLessonInput(req.body);
  } catch (err) {
    return next(err);
  }

  const { title, description, category, durationMinutes, contentType, contentBody, mediaUrl, difficulty, quizQuestions } = req.body;
  const lesson = await Lesson.create({
    creatorId: req.user.id,
    title,
    description,
    category,
    durationMinutes,
    contentType,
    contentBody,
    mediaUrl,
    difficulty,
    published: false
  });

  await QuizQuestion.bulkCreate(
    quizQuestions.map((q) => ({
      lessonId: lesson.id,
      prompt: q.prompt,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctOption: q.correctOption,
      explanation: q.explanation || null
    }))
  );

  await addPoints(req.user.id, 20, `Created lesson ${title}`);
  res.status(201).json({ id: lesson.id });
}

export async function updateLesson(req, res, next) {
  const lesson = await Lesson.findByPk(req.params.lessonId, { include: [{ model: QuizQuestion, as: 'quizQuestions' }] });
  if (!lesson) return next(httpError(404, 'Lesson not found'));
  if (lesson.creatorId !== req.user.id && req.user.role !== 'admin') return next(httpError(403, 'Not allowed'));

  const payload = req.body;
  if (payload.durationMinutes || payload.quizQuestions) {
    try {
      validateLessonInput({
        durationMinutes: payload.durationMinutes ?? lesson.durationMinutes,
        quizQuestions: payload.quizQuestions ?? lesson.quizQuestions
      });
    } catch (err) {
      return next(err);
    }
  }

  await lesson.update(payload);
  if (payload.quizQuestions) {
    await QuizQuestion.destroy({ where: { lessonId: lesson.id } });
    await QuizQuestion.bulkCreate(payload.quizQuestions.map((q) => ({ ...q, lessonId: lesson.id })));
  }

  res.json({ message: 'Lesson updated' });
}

export async function publishLesson(req, res, next) {
  const lesson = await Lesson.findByPk(req.params.lessonId, { include: [{ model: QuizQuestion, as: 'quizQuestions' }] });
  if (!lesson) return next(httpError(404, 'Lesson not found'));
  if (lesson.creatorId !== req.user.id && req.user.role !== 'admin') return next(httpError(403, 'Not allowed'));

  try {
    validateLessonInput({ durationMinutes: lesson.durationMinutes, quizQuestions: lesson.quizQuestions });
  } catch (err) {
    return next(err);
  }

  lesson.published = true;
  await lesson.save();
  res.json({ message: 'Lesson published' });
}
