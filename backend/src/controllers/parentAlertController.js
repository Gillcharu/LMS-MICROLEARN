import { ParentAlertPreference, ParentChildLink, Progress, User } from '../models/index.js';
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
