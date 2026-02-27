import { LiveSession, LiveSessionEnrollment, User } from '../models/index.js';
import { httpError } from '../utils/httpError.js';

export async function createLiveSession(req, res, next) {
  const { title, description, startsAt, durationMinutes, meetingUrl, capacity } = req.body;
  if (!title || !startsAt || !durationMinutes) return next(httpError(400, 'title, startsAt and durationMinutes are required'));

  const row = await LiveSession.create({
    creatorId: req.user.id,
    title,
    description,
    startsAt,
    durationMinutes,
    meetingUrl,
    capacity: capacity || 100,
    status: 'scheduled'
  });
  res.status(201).json(row);
}

export async function listLiveSessions(req, res) {
  const rows = await LiveSession.findAll({
    where: { status: 'scheduled' },
    include: [{ model: User, as: 'creator', attributes: ['id', 'name'] }],
    order: [['startsAt', 'ASC']]
  });
  res.json(rows);
}

export async function enrollLiveSession(req, res, next) {
  const row = await LiveSession.findByPk(req.params.sessionId);
  if (!row || row.status !== 'scheduled') return next(httpError(404, 'Live session not found'));

  await LiveSessionEnrollment.findOrCreate({
    where: { sessionId: row.id, userId: req.user.id },
    defaults: { attendanceStatus: 'enrolled' }
  });

  res.json({ message: 'Enrolled in live session' });
}

export async function creatorLiveSessions(req, res) {
  const rows = await LiveSession.findAll({
    where: { creatorId: req.user.id },
    include: [{ model: User, as: 'attendees', attributes: ['id'], through: { attributes: ['attendanceStatus'] } }],
    order: [['startsAt', 'DESC']]
  });
  res.json(rows);
}
