import { User, UserSuspension } from '../models/index.js';
import { verifyToken } from '../utils/jwt.js';
import { httpError } from '../utils/httpError.js';

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(httpError(401, 'Authorization token is required'));
  }

  try {
    const token = header.replace('Bearer ', '');
    const payload = verifyToken(token);
    const user = await User.findByPk(payload.sub);
    if (!user) return next(httpError(401, 'User account not found'));
    const suspension = await UserSuspension.findOne({ where: { userId: user.id, active: true } });
    if (suspension && (!suspension.suspendedUntil || new Date(suspension.suspendedUntil) > new Date())) {
      return next(httpError(403, `Account suspended: ${suspension.reason}`));
    }
    req.user = user;
    return next();
  } catch {
    return next(httpError(401, 'Invalid or expired token'));
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(httpError(403, 'Insufficient permissions'));
    }
    return next();
  };
}
