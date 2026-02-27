import { randomUUID } from 'crypto';
import { Certificate, Lesson, Progress, User } from '../models/index.js';
import { makeSimpleCertificatePdf } from '../services/pdfService.js';
import { httpError } from '../utils/httpError.js';

export async function issueCertificate(req, res, next) {
  const lessonId = Number(req.params.lessonId);
  const lesson = await Lesson.findByPk(lessonId);
  if (!lesson) return next(httpError(404, 'Lesson not found'));

  const progress = await Progress.findOne({ where: { userId: req.user.id, lessonId, status: 'completed' } });
  if (!progress) return next(httpError(400, 'Complete this lesson before generating a certificate'));

  const [certificate] = await Certificate.findOrCreate({
    where: { userId: req.user.id, lessonId },
    defaults: { code: randomUUID() }
  });

  res.status(201).json(certificate);
}

export async function myCertificates(req, res) {
  const rows = await Certificate.findAll({
    where: { userId: req.user.id },
    include: [{ model: Lesson, attributes: ['id', 'title', 'category'] }],
    order: [['issuedAt', 'DESC']]
  });
  res.json(rows);
}

export async function downloadCertificatePdf(req, res, next) {
  const certificate = await Certificate.findByPk(req.params.certificateId, {
    include: [
      { model: Lesson, attributes: ['title', 'category'] },
      { model: User, attributes: ['name'] }
    ]
  });
  if (!certificate || certificate.userId !== req.user.id) return next(httpError(404, 'Certificate not found'));

  const pdf = makeSimpleCertificatePdf({
    learnerName: certificate.User?.name || 'Learner',
    lessonTitle: certificate.Lesson?.title || 'Lesson',
    category: certificate.Lesson?.category || 'General',
    code: certificate.code,
    issuedAt: certificate.issuedAt
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=certificate-${certificate.id}.pdf`);
  res.send(pdf);
}
