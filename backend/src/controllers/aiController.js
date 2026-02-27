import { AiHintLog, Lesson, Progress } from '../models/index.js';
import { httpError } from '../utils/httpError.js';

function buildHint(question, lesson) {
  const q = (question || '').toLowerCase();
  if (q.includes('summary')) return `Focus on the lesson objective: ${lesson.title}. Break it into one key idea and one practical action.`;
  if (q.includes('quiz')) return 'Read each option and remove obviously incorrect choices first. Then match remaining options with lesson keywords.';
  if (q.includes('remember') || q.includes('retention')) return 'Use retrieval: close notes, explain in your own words, then reopen notes to fill gaps.';
  return `Start with the core topic "${lesson.category}". Write a 2-line takeaway and complete the quiz to validate understanding.`;
}

export async function getHint(req, res, next) {
  const lesson = await Lesson.findByPk(req.params.lessonId);
  if (!lesson || !lesson.published) return next(httpError(404, 'Lesson not found'));

  const question = req.body.question || 'Give me a quick learning hint';
  const hint = buildHint(question, lesson);
  await AiHintLog.create({ userId: req.user.id, lessonId: lesson.id, question, hint });

  res.json({ hint });
}

export async function recommendations(req, res) {
  const progresses = await Progress.findAll({ where: { userId: req.user.id }, include: [{ model: Lesson }] });
  const weakLessons = progresses.filter((p) => p.quizScore < 60).slice(0, 3).map((p) => p.Lesson?.title).filter(Boolean);

  const recommendations = [
    weakLessons.length ? `Retry these lessons: ${weakLessons.join(', ')}.` : 'Great work. Try a higher difficulty lesson next.',
    'Follow one learning path this week for structured progress.',
    'Maintain streak by completing one short lesson today.'
  ];

  res.json({ recommendations });
}
