import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import Tooltip from '../components/Tooltip';

const emptyQuestion = { prompt: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A' };

function normalizeLessonToForm(lesson) {
  return {
    title: lesson.title || '',
    description: lesson.description || '',
    category: lesson.category || 'General',
    durationMinutes: lesson.durationMinutes || 10,
    contentType: lesson.contentType || 'text',
    contentBody: lesson.contentBody || '',
    difficulty: lesson.difficulty || 'beginner',
    mediaUrl: lesson.mediaUrl || '',
    quizQuestions: (lesson.quizQuestions || []).map((q) => ({
      prompt: q.prompt,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctOption: q.correctOption,
      explanation: q.explanation || ''
    }))
  };
}

export default function CreatorStudioPage() {
  const [summary, setSummary] = useState(null);
  const [library, setLibrary] = useState({ lessons: [], paths: [] });
  const [msg, setMsg] = useState('');
  const [editingLessonId, setEditingLessonId] = useState(null);

  const [selectedForPath, setSelectedForPath] = useState([]);
  const [pathTitle, setPathTitle] = useState('');
  const [pathDescription, setPathDescription] = useState('');

  const [liveForm, setLiveForm] = useState({ title: '', description: '', startsAt: '', durationMinutes: 45, meetingUrl: '' });
  const [liveMine, setLiveMine] = useState([]);

  const [assignmentForm, setAssignmentForm] = useState({ lessonId: '', title: '', description: '', dueAt: '' });
  const [submissions, setSubmissions] = useState([]);

  const [offeringForm, setOfferingForm] = useState({ title: '', description: '', priceCents: 999, billingType: 'monthly' });
  const [revenue, setRevenue] = useState({ totalRevenueCents: 0, purchaseCount: 0 });

  const [integrations, setIntegrations] = useState([]);
  const [provider, setProvider] = useState('google_calendar');
  const [token, setToken] = useState('demo-token');

  const [analytics, setAnalytics] = useState(null);

  const [lesson, setLesson] = useState({
    title: '',
    description: '',
    category: 'General',
    durationMinutes: 10,
    contentType: 'text',
    contentBody: '',
    difficulty: 'beginner',
    mediaUrl: '',
    quizQuestions: [{ ...emptyQuestion }, { ...emptyQuestion }, { ...emptyQuestion }]
  });

  const load = async () => {
    const [summaryRes, libraryRes, liveRes, subRes, revenueRes, integrationRes, analyticsRes] = await Promise.all([
      api.get('/creator/summary'),
      api.get('/creator/library'),
      api.get('/live/creator/mine'),
      api.get('/assignments/creator/submissions'),
      api.get('/monetization/creator/revenue'),
      api.get('/integrations'),
      api.get('/analytics/creator')
    ]);
    setSummary(summaryRes.data);
    setLibrary(libraryRes.data);
    setLiveMine(liveRes.data);
    setSubmissions(subRes.data);
    setRevenue(revenueRes.data);
    setIntegrations(integrationRes.data);
    setAnalytics(analyticsRes.data);
  };

  useEffect(() => { load(); }, []);

  const canAddQuestion = lesson.quizQuestions.length < 5;
  const canRemoveQuestion = lesson.quizQuestions.length > 3;

  const isLessonValid = useMemo(() => {
    const basic = lesson.title.trim() && lesson.category.trim() && lesson.contentBody.trim();
    const validQuestions = lesson.quizQuestions.every((q) => q.prompt && q.optionA && q.optionB && q.optionC && q.optionD);
    return basic && validQuestions && lesson.durationMinutes >= 5 && lesson.durationMinutes <= 15;
  }, [lesson]);

  const updateQuestion = (idx, key, value) => {
    const quizQuestions = [...lesson.quizQuestions];
    quizQuestions[idx][key] = value;
    setLesson({ ...lesson, quizQuestions });
  };

  const resetForm = () => {
    setEditingLessonId(null);
    setLesson({ title: '', description: '', category: 'General', durationMinutes: 10, contentType: 'text', contentBody: '', difficulty: 'beginner', mediaUrl: '', quizQuestions: [{ ...emptyQuestion }, { ...emptyQuestion }, { ...emptyQuestion }] });
  };

  const submitLesson = async (e) => {
    e.preventDefault();
    if (editingLessonId) {
      await api.patch(`/lessons/${editingLessonId}`, lesson);
      setMsg('Lesson updated.');
    } else {
      await api.post('/lessons', lesson);
      setMsg('Lesson draft created.');
    }
    resetForm();
    await load();
  };

  const startEditLesson = (row) => {
    setEditingLessonId(row.id);
    setLesson(normalizeLessonToForm(row));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleLessonPublish = async (lessonId) => {
    await api.post(`/creator/lessons/${lessonId}/toggle-publish`);
    setMsg('Lesson publish state updated.');
    load();
  };

  const duplicateLesson = async (lessonId) => {
    await api.post(`/creator/lessons/${lessonId}/duplicate`);
    setMsg('Lesson duplicated as draft.');
    load();
  };

  const toggleSelectedLesson = (id) => {
    setSelectedForPath((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const createPath = async (e) => {
    e.preventDefault();
    const { data } = await api.post('/paths', { title: pathTitle, description: pathDescription, lessonIds: selectedForPath });
    await api.post(`/creator/paths/${data.id}/toggle-publish`);
    setMsg('Path created and published.');
    setPathTitle('');
    setPathDescription('');
    setSelectedForPath([]);
    load();
  };

  const createLive = async (e) => {
    e.preventDefault();
    await api.post('/live', liveForm);
    setMsg('Live class scheduled.');
    setLiveForm({ title: '', description: '', startsAt: '', durationMinutes: 45, meetingUrl: '' });
    load();
  };

  const createAssignment = async (e) => {
    e.preventDefault();
    await api.post('/assignments', assignmentForm);
    setMsg('Assignment created.');
    setAssignmentForm({ lessonId: '', title: '', description: '', dueAt: '' });
    load();
  };

  const gradeSubmission = async (submissionId) => {
    const score = Number(prompt('Score (0-100):', '80'));
    const feedback = prompt('Feedback:', 'Good work. Refine examples.') || '';
    if (Number.isNaN(score)) return;
    await api.post(`/assignments/submissions/${submissionId}/grade`, { score, feedback });
    setMsg('Submission graded.');
    load();
  };

  const createOffering = async (e) => {
    e.preventDefault();
    await api.post('/monetization/offerings', offeringForm);
    setMsg('Offering published in marketplace.');
    setOfferingForm({ title: '', description: '', priceCents: 999, billingType: 'monthly' });
    load();
  };

  const connectIntegration = async () => {
    await api.post('/integrations/connect', { provider, token });
    setMsg('Integration connected.');
    load();
  };

  const disconnectIntegration = async (prov) => {
    await api.post(`/integrations/${prov}/disconnect`);
    setMsg('Integration disconnected.');
    load();
  };

  if (!summary) return <main className="container">Loading creator studio...</main>;

  return (
    <main className="container">
      <h2>Creator Studio</h2>
      {msg && <p className="ok">{msg}</p>}

      <section className="grid metrics">
        <article className="card stat"><h3>Lessons</h3><p>{summary.lessonCount}</p></article>
        <article className="card stat"><h3>Published Lessons</h3><p>{summary.publishedLessons}</p></article>
        <article className="card stat"><h3>Paths</h3><p>{summary.pathCount}</p></article>
        <article className="card stat"><h3>Published Paths</h3><p>{summary.publishedPaths}</p></article>
      </section>

      <section className="grid two-col">
        <form className="card" onSubmit={submitLesson}>
          <h3>{editingLessonId ? 'Edit Lesson' : 'Create Lesson'} <Tooltip text="Duration 5-15 minutes and 3-5 quiz questions." /></h3>
          <input placeholder="Title" required value={lesson.title} onChange={(e) => setLesson({ ...lesson, title: e.target.value })} />
          <textarea placeholder="Description" value={lesson.description} onChange={(e) => setLesson({ ...lesson, description: e.target.value })} />
          <div className="row wrap">
            <input placeholder="Category" value={lesson.category} onChange={(e) => setLesson({ ...lesson, category: e.target.value })} />
            <input type="number" min="5" max="15" value={lesson.durationMinutes} onChange={(e) => setLesson({ ...lesson, durationMinutes: Number(e.target.value) })} />
          </div>
          <input placeholder="Media URL" value={lesson.mediaUrl} onChange={(e) => setLesson({ ...lesson, mediaUrl: e.target.value })} />
          <textarea placeholder="Lesson content" value={lesson.contentBody} onChange={(e) => setLesson({ ...lesson, contentBody: e.target.value })} />

          <div className="row wrap">
            <button type="button" className="ghost-btn" disabled={!canAddQuestion} onClick={() => setLesson({ ...lesson, quizQuestions: [...lesson.quizQuestions, { ...emptyQuestion }] })}>Add Question</button>
            <button type="button" className="ghost-btn" disabled={!canRemoveQuestion} onClick={() => setLesson({ ...lesson, quizQuestions: lesson.quizQuestions.slice(0, -1) })}>Remove Last</button>
            <span className="pill">{lesson.quizQuestions.length} questions</span>
          </div>

          {lesson.quizQuestions.map((q, i) => (
            <div key={i} className="quiz-q">
              <h4>Question {i + 1}</h4>
              <input placeholder="Prompt" value={q.prompt} onChange={(e) => updateQuestion(i, 'prompt', e.target.value)} />
              <input placeholder="Option A" value={q.optionA} onChange={(e) => updateQuestion(i, 'optionA', e.target.value)} />
              <input placeholder="Option B" value={q.optionB} onChange={(e) => updateQuestion(i, 'optionB', e.target.value)} />
              <input placeholder="Option C" value={q.optionC} onChange={(e) => updateQuestion(i, 'optionC', e.target.value)} />
              <input placeholder="Option D" value={q.optionD} onChange={(e) => updateQuestion(i, 'optionD', e.target.value)} />
              <select value={q.correctOption} onChange={(e) => updateQuestion(i, 'correctOption', e.target.value)}>
                <option value="A">Correct: A</option>
                <option value="B">Correct: B</option>
                <option value="C">Correct: C</option>
                <option value="D">Correct: D</option>
              </select>
            </div>
          ))}

          <div className="row wrap">
            <button type="submit" disabled={!isLessonValid}>{editingLessonId ? 'Save Changes' : 'Create Draft'}</button>
            {editingLessonId && <button type="button" className="ghost-btn" onClick={resetForm}>Cancel Edit</button>}
          </div>
        </form>

        <div className="card">
          <h3>Lesson Library</h3>
          {library.lessons.map((l) => (
            <article key={l.id} className="lesson-item">
              <p><strong>{l.title}</strong></p>
              <p className="muted">{l.durationMinutes} min • {l.quizQuestions?.length || 0} Q • {l.published ? 'Published' : 'Draft'}</p>
              <div className="row wrap">
                <button onClick={() => startEditLesson(l)}>Edit</button>
                <button className="ghost-btn" onClick={() => duplicateLesson(l.id)}>Duplicate</button>
                <button className="ghost-btn" onClick={() => toggleLessonPublish(l.id)}>{l.published ? 'Unpublish' : 'Publish'}</button>
              </div>
              <label className="option">
                <input type="checkbox" checked={selectedForPath.includes(l.id)} onChange={() => toggleSelectedLesson(l.id)} />
                <span>Select for path</span>
              </label>
            </article>
          ))}
        </div>
      </section>

      <section className="grid two-col">
        <form className="card" onSubmit={createPath}>
          <h3>Path Builder</h3>
          <input placeholder="Path title" required value={pathTitle} onChange={(e) => setPathTitle(e.target.value)} />
          <textarea placeholder="Path description" required value={pathDescription} onChange={(e) => setPathDescription(e.target.value)} />
          <button type="submit" disabled={selectedForPath.length === 0}>Create + Publish Path</button>
        </form>

        <form className="card" onSubmit={createLive}>
          <h3>Live Class Scheduler</h3>
          <input placeholder="Live class title" value={liveForm.title} onChange={(e) => setLiveForm({ ...liveForm, title: e.target.value })} required />
          <textarea placeholder="Description" value={liveForm.description} onChange={(e) => setLiveForm({ ...liveForm, description: e.target.value })} />
          <input type="datetime-local" value={liveForm.startsAt} onChange={(e) => setLiveForm({ ...liveForm, startsAt: e.target.value })} required />
          <input type="number" min="15" value={liveForm.durationMinutes} onChange={(e) => setLiveForm({ ...liveForm, durationMinutes: Number(e.target.value) })} />
          <input placeholder="Meeting URL" value={liveForm.meetingUrl} onChange={(e) => setLiveForm({ ...liveForm, meetingUrl: e.target.value })} />
          <button type="submit">Schedule Live Class</button>
          {liveMine.map((s) => <p key={s.id}>{s.title} - {new Date(s.startsAt).toLocaleString()}</p>)}
        </form>
      </section>

      <section className="grid two-col">
        <form className="card" onSubmit={createAssignment}>
          <h3>Assignment Workspace</h3>
          <select value={assignmentForm.lessonId} onChange={(e) => setAssignmentForm({ ...assignmentForm, lessonId: e.target.value })} required>
            <option value="">Select lesson</option>
            {library.lessons.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
          </select>
          <input placeholder="Assignment title" value={assignmentForm.title} onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })} required />
          <textarea placeholder="Assignment instructions" value={assignmentForm.description} onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })} required />
          <input type="date" value={assignmentForm.dueAt} onChange={(e) => setAssignmentForm({ ...assignmentForm, dueAt: e.target.value })} />
          <button type="submit">Create Assignment</button>
        </form>

        <article className="card">
          <h3>Submission Grading</h3>
          {submissions.map((s) => (
            <div key={s.id} className="lesson-item">
              <p><strong>{s.Assignment?.title}</strong></p>
              <p className="muted">{s.User?.name} • {s.status}</p>
              <p>{s.content}</p>
              <button onClick={() => gradeSubmission(s.id)}>Grade</button>
            </div>
          ))}
        </article>
      </section>

      <section className="grid two-col">
        <form className="card" onSubmit={createOffering}>
          <h3>Monetization</h3>
          <input placeholder="Offering title" value={offeringForm.title} onChange={(e) => setOfferingForm({ ...offeringForm, title: e.target.value })} required />
          <textarea placeholder="Description" value={offeringForm.description} onChange={(e) => setOfferingForm({ ...offeringForm, description: e.target.value })} />
          <input type="number" min="100" value={offeringForm.priceCents} onChange={(e) => setOfferingForm({ ...offeringForm, priceCents: Number(e.target.value) })} />
          <select value={offeringForm.billingType} onChange={(e) => setOfferingForm({ ...offeringForm, billingType: e.target.value })}>
            <option value="one_time">One Time</option>
            <option value="monthly">Monthly</option>
          </select>
          <button type="submit">Publish Offering</button>
          <p className="muted">Revenue: ${(revenue.totalRevenueCents / 100).toFixed(2)} ({revenue.purchaseCount} purchases)</p>
        </form>

        <article className="card">
          <h3>Integrations</h3>
          <div className="row wrap">
            <select value={provider} onChange={(e) => setProvider(e.target.value)}>
              <option value="google_calendar">Google Calendar</option>
              <option value="zoom">Zoom</option>
              <option value="slack">Slack</option>
              <option value="discord">Discord</option>
              <option value="s3">S3</option>
              <option value="stripe">Stripe</option>
            </select>
            <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="API token" />
            <button onClick={connectIntegration}>Connect</button>
          </div>
          {integrations.map((i) => (
            <div className="lesson-item" key={i.id}>
              <p><strong>{i.provider}</strong> - {i.status}</p>
              {i.status === 'connected' && <button className="ghost-btn" onClick={() => disconnectIntegration(i.provider)}>Disconnect</button>}
            </div>
          ))}
        </article>
      </section>

      <section className="card">
        <h3>Analytics</h3>
        {analytics && (
          <>
            <p>Path enrollments: {analytics.pathEnrollments} | Assignment submissions: {analytics.assignmentSubmissions}</p>
            <p>Revenue tracked: ${(analytics.revenueCents / 100).toFixed(2)}</p>
            {analytics.lessonStats.map((row) => (
              <div className="progress-row" key={row.lessonId}>
                <p><strong>{row.title}</strong></p>
                <p className="muted">Learners: {row.learners} • Completion: {row.completionRate}% • Avg Quiz: {row.avgQuizScore}%</p>
              </div>
            ))}
          </>
        )}
      </section>
    </main>
  );
}
