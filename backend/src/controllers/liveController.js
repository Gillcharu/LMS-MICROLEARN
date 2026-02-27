import { LiveSession, LiveSessionEnrollment, LiveSessionRecording, User } from '../models/index.js';
import { buildMediaUrl } from '../services/mediaService.js';
import { createNotification } from '../services/notificationService.js';
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
  await createNotification({
    userId: req.user.id,
    type: 'session_enrollment',
    title: 'Session enrollment confirmed',
    message: `You enrolled in "${row.title}".`
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

function inferThumbnail(videoUrl) {
  const m = (videoUrl || '').match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  if (m) return `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg`;
  return 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=900&q=80';
}

export async function addSessionRecording(req, res, next) {
  const sessionId = Number(req.params.sessionId);
  const session = await LiveSession.findByPk(sessionId);
  if (!session) return next(httpError(404, 'Live session not found'));
  if (session.creatorId !== req.user.id && req.user.role !== 'admin') return next(httpError(403, 'Not allowed'));

  const { title, videoUrl, thumbnailUrl, storageKey } = req.body;
  const finalVideoUrl = videoUrl || buildMediaUrl(storageKey);
  if (!title || !finalVideoUrl) return next(httpError(400, 'title and videoUrl/storageKey are required'));

  const row = await LiveSessionRecording.create({
    sessionId,
    creatorId: req.user.id,
    title,
    videoUrl: finalVideoUrl,
    thumbnailUrl: thumbnailUrl || inferThumbnail(finalVideoUrl)
  });
  res.status(201).json(row);
}

export async function listSessionRecordings(req, res, next) {
  const session = await LiveSession.findByPk(req.params.sessionId);
  if (!session) return next(httpError(404, 'Live session not found'));
  const rows = await LiveSessionRecording.findAll({
    where: { sessionId: session.id },
    order: [['createdAt', 'DESC']]
  });
  res.json(rows);
}
