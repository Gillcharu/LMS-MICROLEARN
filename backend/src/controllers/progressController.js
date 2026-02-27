import { randomUUID } from 'crypto';
import { Lesson, Progress, QuizAttempt, QuizQuestion } from '../models/index.js';
import { addPoints, updateStreak } from '../services/gamificationService.js';
import { createNotification } from '../services/notificationService.js';
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
  const attemptToken = req.body.attemptToken;
  let attempt = null;

  if (attemptToken) {
    attempt = await QuizAttempt.findOne({
      where: { token: attemptToken, userId: req.user.id, lessonId: lesson.id }
    });
    if (!attempt || attempt.status !== 'active') return next(httpError(400, 'Invalid quiz attempt token'));
    if (new Date(attempt.expiresAt) < new Date()) {
      attempt.status = 'expired';
      await attempt.save();
      return next(httpError(400, 'Quiz time window expired. Start a new attempt.'));
    }
  }

  let correct = 0;
  const answerMap = {};

  for (const q of questions) {
    const chosen = answers[q.id] || null;
    const isCorrect = chosen === q.correctOption;
    if (isCorrect) correct += 1;
    answerMap[q.id] = { chosen, correctOption: q.correctOption, isCorrect };
  }

  const score = questions.length ? Math.round((correct / questions.length) * 100) : 0;
  const completed = score >= 60;

  const [progress] = await Progress.findOrCreate({ where: { userId: req.user.id, lessonId: lesson.id } });
  progress.quizScore = score;
  progress.completionPercent = completed ? 100 : Math.max(progress.completionPercent, 60);
  progress.status = completed ? 'completed' : 'in_progress';
  progress.lastAccessedAt = new Date();
  await progress.save();

  if (attempt) {
    await attempt.update({
      answerMap,
      score,
      submittedAt: new Date(),
      status: 'submitted'
    });
  }

  if (completed) {
    await addPoints(req.user.id, 50, `Completed lesson ${lesson.title}`);
    await updateStreak(req.user.id);
    await createNotification({
      userId: req.user.id,
      type: 'quiz_completed',
      title: 'Lesson completed',
      message: `You passed ${lesson.title} with ${score}%.`
    });
  } else {
    await addPoints(req.user.id, 10, `Attempted quiz for ${lesson.title}`);
  }

  res.json({ score, correct, total: questions.length, passed: completed });
}

export async function startQuizAttempt(req, res, next) {
  const lesson = await Lesson.findByPk(req.params.lessonId, { include: [{ model: QuizQuestion, as: 'quizQuestions' }] });
  if (!lesson || !lesson.published) return next(httpError(404, 'Lesson not found'));

  const attemptCount = await QuizAttempt.count({
    where: { userId: req.user.id, lessonId: lesson.id }
  });
  if (attemptCount >= 3) return next(httpError(400, 'Maximum 3 quiz attempts reached for this lesson'));

  const order = lesson.quizQuestions.map((q) => q.id).sort(() => Math.random() - 0.5);
  const durationSeconds = Math.max(300, Math.min(900, lesson.quizQuestions.length * 90));
  const expiresAt = new Date(Date.now() + durationSeconds * 1000);

  const row = await QuizAttempt.create({
    userId: req.user.id,
    lessonId: lesson.id,
    attemptNo: attemptCount + 1,
    token: randomUUID(),
    questionOrder: order,
    expiresAt,
    status: 'active'
  });

  res.status(201).json({
    attemptToken: row.token,
    attemptNo: row.attemptNo,
    questionOrder: row.questionOrder,
    expiresAt: row.expiresAt,
    durationSeconds
  });
}

export async function myProgress(req, res) {
  const rows = await Progress.findAll({
    where: { userId: req.user.id },
    include: [{ model: Lesson, attributes: ['id', 'title', 'category', 'durationMinutes'] }],
    order: [['updatedAt', 'DESC']]
  });
  res.json(rows);
}
