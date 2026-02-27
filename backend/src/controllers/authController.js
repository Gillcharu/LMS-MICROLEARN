import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';
import { signToken } from '../utils/jwt.js';
import { httpError } from '../utils/httpError.js';

const demoAccounts = {
  'learner@microlearn.app': { name: 'Learner One', role: 'learner' },
  'creator@microlearn.app': { name: 'Creator One', role: 'creator' },
  'parent@microlearn.app': { name: 'Parent One', role: 'parent' },
  'admin@microlearn.app': { name: 'Admin One', role: 'admin' }
};

async function ensureDemoAccount(email) {
  const profile = demoAccounts[email];
  if (!profile) return null;

  const passwordHash = await bcrypt.hash('password123', 10);
  const [user] = await User.findOrCreate({
    where: { email },
    defaults: { name: profile.name, role: profile.role, passwordHash }
  });
  await user.update({ name: profile.name, role: profile.role, passwordHash });
  return user;
}

export async function register(req, res, next) {
  const { name, email, password, role = 'learner' } = req.body;
  if (!name || !email || !password) return next(httpError(400, 'Name, email and password are required'));
  if (!['learner', 'creator', 'parent'].includes(role)) return next(httpError(400, 'Invalid role'));

  const existing = await User.findOne({ where: { email } });
  if (existing) return next(httpError(409, 'Email already registered'));

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, role, passwordHash });

  return res.status(201).json({
    token: signToken(user),
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
}

export async function login(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) return next(httpError(400, 'Email and password are required'));

  // Demo mode resilience: reset demo account automatically when using default demo password.
  if (demoAccounts[email] && password === 'password123') {
    await ensureDemoAccount(email);
  }

  const user = await User.findOne({ where: { email } });
  if (!user) return next(httpError(401, 'Invalid credentials'));

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return next(httpError(401, 'Invalid credentials'));

  return res.json({
    token: signToken(user),
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
}

export async function me(req, res) {
  const user = req.user;
  return res.json({ id: user.id, name: user.name, email: user.email, role: user.role, points: user.points, streakDays: user.streakDays });
}
