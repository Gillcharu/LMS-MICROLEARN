import { Notification, Progress } from '../models/index.js';
import { createNotification } from '../services/notificationService.js';
import { httpError } from '../utils/httpError.js';

export async function myNotifications(req, res) {
  const rows = await Notification.findAll({
    where: { userId: req.user.id },
    order: [['createdAt', 'DESC']],
    limit: 100
  });
  res.json(rows);
}

export async function markNotificationRead(req, res, next) {
  const row = await Notification.findByPk(req.params.notificationId);
  if (!row || row.userId !== req.user.id) return next(httpError(404, 'Notification not found'));
  await row.update({ readAt: row.readAt || new Date() });
  res.json(row);
}

export async function checkStreakRisk(req, res) {
  const latest = await Progress.findOne({
    where: { userId: req.user.id },
    order: [['updatedAt', 'DESC']]
  });
  const atRisk = !latest || (Date.now() - new Date(latest.updatedAt).getTime()) > 2 * 24 * 60 * 60 * 1000;
  if (atRisk) {
    await createNotification({
      userId: req.user.id,
      type: 'streak_risk',
      title: 'Streak at risk',
      message: 'You have been inactive for 2+ days. Complete one lesson today to protect your streak.'
    });
  }
  res.json({ atRisk });
}
