import { Activity, Badge, Progress, User, UserBadge } from '../models/index.js';

export async function addPoints(userId, delta, message) {
  const user = await User.findByPk(userId);
  if (!user) return;
  user.points += delta;
  await user.save();
  if (message) {
    await Activity.create({ userId, type: 'points', message });
  }
  await checkAndAwardBadges(userId);
}

export async function updateStreak(userId) {
  const progresses = await Progress.findAll({
    where: { userId, status: 'completed' },
    order: [['updatedAt', 'DESC']],
    limit: 10
  });
  if (progresses.length === 0) return;

  const today = new Date();
  const isSameDay = (a, b) => a.toDateString() === b.toDateString();
  const isYesterday = (a, b) => {
    const prev = new Date(b);
    prev.setDate(prev.getDate() - 1);
    return a.toDateString() === prev.toDateString();
  };

  const user = await User.findByPk(userId);
  if (!user) return;

  const latest = new Date(progresses[0].updatedAt);
  if (!isSameDay(latest, today) && !isYesterday(latest, today)) {
    user.streakDays = 1;
  } else if (isSameDay(latest, today)) {
    user.streakDays = Math.max(user.streakDays, 1);
  } else if (isYesterday(latest, today)) {
    user.streakDays += 1;
  }

  await user.save();
  await checkAndAwardBadges(userId);
}

export async function checkAndAwardBadges(userId) {
  const user = await User.findByPk(userId);
  if (!user) return;

  const completedCount = await Progress.count({ where: { userId, status: 'completed' } });
  const rules = [
    { code: 'FIRST_STEP', when: completedCount >= 1 },
    { code: 'TEN_LESSONS', when: completedCount >= 10 },
    { code: 'STREAK_7', when: user.streakDays >= 7 },
    { code: 'POINTS_500', when: user.points >= 500 }
  ];

  for (const rule of rules) {
    if (!rule.when) continue;
    const badge = await Badge.findOne({ where: { code: rule.code } });
    if (!badge) continue;
    const existing = await UserBadge.findOne({ where: { userId, badgeId: badge.id } });
    if (existing) continue;
    await UserBadge.create({ userId, badgeId: badge.id });
    await Activity.create({ userId, type: 'badge', message: `Unlocked badge: ${badge.title}` });
  }
}
