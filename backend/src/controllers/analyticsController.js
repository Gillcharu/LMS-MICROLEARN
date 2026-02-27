import { Assignment, AssignmentSubmission, CreatorOffering, LearningPath, Lesson, PathEnrollment, Progress, Purchase, QuizAttempt, User } from '../models/index.js';

export async function creatorAnalytics(req, res) {
  const creatorId = req.user.id;

  const lessons = await Lesson.findAll({ where: { creatorId }, include: [{ model: Progress }] });
  const paths = await LearningPath.findAll({ where: { creatorId } });
  const pathIds = paths.map((p) => p.id);
  const pathEnrollments = pathIds.length ? await PathEnrollment.count({ where: { pathId: pathIds } }) : 0;

  const lessonStats = lessons.map((lesson) => {
    const progresses = lesson.Progresses || [];
    const completed = progresses.filter((p) => p.status === 'completed').length;
    const avgScore = progresses.length ? progresses.reduce((sum, p) => sum + p.quizScore, 0) / progresses.length : 0;
    return {
      lessonId: lesson.id,
      title: lesson.title,
      learners: progresses.length,
      completionRate: progresses.length ? Math.round((completed / progresses.length) * 100) : 0,
      avgQuizScore: Math.round(avgScore)
    };
  });

  const offerings = await CreatorOffering.findAll({ where: { creatorId }, include: [{ model: Purchase, as: 'purchases' }] });
  const revenueCents = offerings.reduce((sum, o) => sum + (o.purchases || []).reduce((pSum, p) => pSum + (p.status === 'paid' ? p.amountCents : 0), 0), 0);

  const assignmentSubmissions = await AssignmentSubmission.count({
    include: [{ model: Assignment, where: { creatorId } }]
  }).catch(() => 0);

  res.json({
    lessonStats,
    pathCount: paths.length,
    pathEnrollments,
    revenueCents,
    assignmentSubmissions
  });
}

export async function adminAnalytics(req, res) {
  const [users, lessons, paths, progresses, purchases] = await Promise.all([
    User.count(),
    Lesson.count(),
    LearningPath.count(),
    Progress.count(),
    Purchase.count({ where: { status: 'paid' } })
  ]);

  const completionCount = await Progress.count({ where: { status: 'completed' } });
  const completionRate = progresses ? Math.round((completionCount / progresses) * 100) : 0;

  res.json({ users, lessons, paths, progressRecords: progresses, completionRate, paidPurchases: purchases });
}

export async function creatorRetentionAnalytics(req, res) {
  const lessons = await Lesson.findAll({ where: { creatorId: req.user.id }, attributes: ['id', 'title'] });
  const lessonIds = lessons.map((l) => l.id);
  if (!lessonIds.length) return res.json({ dropoff: [], questionAccuracy: [] });

  const progresses = await Progress.findAll({ where: { lessonId: lessonIds } });
  const attempts = await QuizAttempt.findAll({ where: { lessonId: lessonIds, status: 'submitted' } });

  const dropoff = lessons.map((lesson) => {
    const rows = progresses.filter((p) => p.lessonId === lesson.id);
    const bucket = { under40: 0, between40And79: 0, over80: 0 };
    rows.forEach((r) => {
      if (r.completionPercent < 40) bucket.under40 += 1;
      else if (r.completionPercent < 80) bucket.between40And79 += 1;
      else bucket.over80 += 1;
    });
    return { lessonId: lesson.id, title: lesson.title, ...bucket };
  });

  const questionMap = {};
  attempts.forEach((attempt) => {
    const answers = attempt.answerMap || {};
    Object.entries(answers).forEach(([qId, row]) => {
      if (!questionMap[qId]) questionMap[qId] = { questionId: Number(qId), attempts: 0, correct: 0 };
      questionMap[qId].attempts += 1;
      if (row.isCorrect) questionMap[qId].correct += 1;
    });
  });
  const questionAccuracy = Object.values(questionMap).map((row) => ({
    ...row,
    accuracyPercent: row.attempts ? Math.round((row.correct / row.attempts) * 100) : 0
  }));

  res.json({ dropoff, questionAccuracy });
}
