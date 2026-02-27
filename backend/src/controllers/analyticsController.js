import { Assignment, AssignmentSubmission, CreatorOffering, LearningPath, Lesson, PathEnrollment, Progress, Purchase, User } from '../models/index.js';

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
