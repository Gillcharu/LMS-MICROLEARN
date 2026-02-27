import { Lesson, Progress, QuizQuestion } from '../models/index.js';
import { addPoints, updateStreak } from '../services/gamificationService.js';
import { httpError } from '../utils/httpError.js';

export async function updateLessonProgress(req, res, next) {
  const lesson = await Lesson.findByPk(req.params.lessonId);
  if (!lesson || !lesson.published) return next(httpError(404, 'Lesson not found'));

  const { completionPercent = 0, timeSpentSeconds = 0, status = 'in_progress' } = req.body;

  const [progress] = await Progress.findOrCreate({
    where: { userId: req.user.id, lessonId: lesson.id },
    defaults: { status: 'not_started' }
  });

  progress.completionPercent = Math.max(progress.completionPercent, completionPercent);
  progress.timeSpentSeconds += timeSpentSeconds;
  progress.status = status;
  progress.lastAccessedAt = new Date();
  await progress.save();

  res.json(progress);
}

export async function submitQuiz(req, res, next) {
  const lesson = await Lesson.findByPk(req.params.lessonId, { include: [{ model: QuizQuestion, as: 'quizQuestions' }] });
  if (!lesson || !lesson.published) return next(httpError(404, 'Lesson not found'));

  const answers = req.body.answers || {};
  const questions = lesson.quizQuestions;
  let correct = 0;

  for (const q of questions) {
    if (answers[q.id] === q.correctOption) correct += 1;
  }

  const score = Math.round((correct / questions.length) * 100);
  const completed = score >= 60;

  const [progress] = await Progress.findOrCreate({ where: { userId: req.user.id, lessonId: lesson.id } });
  progress.quizScore = score;
  progress.completionPercent = completed ? 100 : Math.max(progress.completionPercent, 60);
  progress.status = completed ? 'completed' : 'in_progress';
  progress.lastAccessedAt = new Date();
  await progress.save();

  if (completed) {
    await addPoints(req.user.id, 50, `Completed lesson ${lesson.title}`);
    await updateStreak(req.user.id);
  } else {
    await addPoints(req.user.id, 10, `Attempted quiz for ${lesson.title}`);
  }

  res.json({ score, correct, total: questions.length, passed: completed });
}

export async function myProgress(req, res) {
  const rows = await Progress.findAll({
    where: { userId: req.user.id },
    include: [{ model: Lesson, attributes: ['id', 'title', 'category', 'durationMinutes'] }],
    order: [['updatedAt', 'DESC']]
  });
  res.json(rows);
}
