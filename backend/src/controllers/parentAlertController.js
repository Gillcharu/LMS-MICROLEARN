import { ParentAlertPreference, ParentChildLink, Progress, User } from '../models/index.js';
import { Op } from 'sequelize';
import { httpError } from '../utils/httpError.js';

export async function getAlertPreference(req, res, next) {
  if (req.user.role !== 'parent' && req.user.role !== 'admin') return next(httpError(403, 'Only parent role can access alerts'));

  const [pref] = await ParentAlertPreference.findOrCreate({ where: { parentId: req.user.id } });
  res.json(pref);
}

export async function updateAlertPreference(req, res, next) {
  if (req.user.role !== 'parent' && req.user.role !== 'admin') return next(httpError(403, 'Only parent role can access alerts'));

  const [pref] = await ParentAlertPreference.findOrCreate({ where: { parentId: req.user.id } });
  await pref.update({
    weeklyDigest: req.body.weeklyDigest ?? pref.weeklyDigest,
    inactivityAlert: req.body.inactivityAlert ?? pref.inactivityAlert,
    milestoneAlert: req.body.milestoneAlert ?? pref.milestoneAlert
  });
  res.json(pref);
}

export async function parentAlertPreview(req, res, next) {
  if (req.user.role !== 'parent' && req.user.role !== 'admin') return next(httpError(403, 'Only parent role can access alerts'));

  const links = await ParentChildLink.findAll({ where: { parentId: req.user.id } });
  const childIds = links.map((l) => l.childId);
  const children = childIds.length ? await User.findAll({ where: { id: childIds }, attributes: ['id', 'name', 'points', 'streakDays'] }) : [];

  const summaries = [];
  for (const child of children) {
    const completed = await Progress.count({ where: { userId: child.id, status: 'completed' } });
    const inProgress = await Progress.count({ where: { userId: child.id, status: 'in_progress' } });
    summaries.push({
      child: child.name,
      weeklyDigest: `${completed} completed lessons, ${inProgress} in progress`,
      inactivityAlert: inProgress === 0 && completed === 0 ? 'No learning activity detected recently' : 'Activity detected',
      milestoneAlert: child.points >= 100 ? 'Milestone reached: 100+ points' : 'No milestone yet'
    });
  }

  res.json({ summaries });
}

export async function weeklyParentReport(req, res, next) {
  if (req.user.role !== 'parent' && req.user.role !== 'admin') return next(httpError(403, 'Only parent role can access alerts'));

  const links = await ParentChildLink.findAll({ where: { parentId: req.user.id } });
  const childIds = links.map((l) => l.childId);
  const children = childIds.length ? await User.findAll({ where: { id: childIds }, attributes: ['id', 'name', 'points', 'streakDays'] }) : [];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const reports = [];
  for (const child of children) {
    const rows = await Progress.findAll({ where: { userId: child.id, updatedAt: { [Op.gt]: weekAgo } } });
    const completed = rows.filter((r) => r.status === 'completed').length;
    const avgQuiz = rows.length ? Math.round(rows.reduce((sum, r) => sum + (r.quizScore || 0), 0) / rows.length) : 0;
    const recommendation = completed === 0
      ? 'Schedule two 10-minute sessions this week to restart momentum.'
      : avgQuiz < 60
        ? 'Revise weak topics and retake one quiz with guidance.'
        : 'Maintain streak with one advanced lesson and one recap lesson.';

    reports.push({
      childId: child.id,
      childName: child.name,
      weeklyCompletedLessons: completed,
      avgQuizScore: avgQuiz,
      points: child.points,
      streakDays: child.streakDays,
      recommendation
    });
  }

  res.json({ generatedAt: new Date(), reports });
}
