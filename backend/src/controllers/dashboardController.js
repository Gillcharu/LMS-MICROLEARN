import { Activity, LearningPath, Lesson, Progress } from '../models/index.js';

export async function dashboard(req, res) {
  const userId = req.user.id;
  const [completedLessons, inProgress, totalLessons, availablePaths, recentActivities] = await Promise.all([
    Progress.count({ where: { userId, status: 'completed' } }),
    Progress.count({ where: { userId, status: 'in_progress' } }),
    Lesson.count({ where: { published: true } }),
    LearningPath.count({ where: { published: true } }),
    Activity.findAll({ where: { userId }, order: [['createdAt', 'DESC']], limit: 10 })
  ]);

  const badges = await req.user.getBadges({ joinTableAttributes: [] });
  const completionRate = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;

  res.json({
    points: req.user.points,
    streakDays: req.user.streakDays,
    completedLessons,
    inProgress,
    availablePaths,
    completionRate,
    recentActivities,
    badges
  });
}
