import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [progress, setProgress] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [liveSessions, setLiveSessions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [market, setMarket] = useState([]);
  const [aiHint, setAiHint] = useState('');
  const [aiQuestion, setAiQuestion] = useState('Give me a retention tip for this week');
  const [hintLessonId, setHintLessonId] = useState('');
  const [status, setStatus] = useState('');
  const [busyPurchaseId, setBusyPurchaseId] = useState(null);

  const load = async () => {
    const [dash, prog, certs, live, asg, subs, marketplace] = await Promise.all([
      api.get('/dashboard'),
      api.get('/progress/mine'),
      api.get('/certificates/mine'),
      api.get('/live'),
      api.get('/assignments'),
      api.get('/assignments/mine/submissions'),
      api.get('/monetization/marketplace')
    ]);
    setStats(dash.data);
    setProgress(prog.data);
    setCertificates(certs.data);
    setLiveSessions(live.data.slice(0, 6));
    setAssignments(asg.data.slice(0, 8));
    setSubmissions(subs.data.slice(0, 8));
    setMarket(marketplace.data.slice(0, 6));
    if (prog.data[0]?.lessonId) setHintLessonId(String(prog.data[0].lessonId));
  };

  useEffect(() => {
    load();
  }, []);

  const askHint = async () => {
    if (!hintLessonId) return;
    const { data } = await api.post(`/ai/lessons/${hintLessonId}/hint`, { question: aiQuestion });
    setAiHint(data.hint);
  };

  const getRecommendations = async () => {
    const { data } = await api.get('/ai/recommendations');
    setAiHint(data.recommendations.join(' '));
  };

  const enrollLive = async (id) => {
    await api.post(`/live/${id}/enroll`);
    setStatus('Enrolled in live session.');
  };

  const submitAssignment = async (assignmentId) => {
    const content = prompt('Enter your assignment response:');
    if (!content) return;
    await api.post(`/assignments/${assignmentId}/submit`, { content });
    setStatus('Assignment submitted.');
    load();
  };

  const purchase = async (offeringId) => {
    setBusyPurchaseId(offeringId);
    try {
      const { data } = await api.post(`/monetization/offerings/${offeringId}/purchase`);
      setStatus(data.message || 'Purchase successful.');
      load();
    } catch (err) {
      setStatus(err.response?.data?.error || 'Purchase failed.');
    } finally {
      setBusyPurchaseId(null);
    }
  };

  if (!stats) return <main className="container">Loading dashboard...</main>;

  return (
    <main className="container">
      <h2>Learner Dashboard</h2>
      {status && <p className="ok">{status}</p>}

      <section className="grid metrics">
        <article className="card stat"><h3>Points</h3><p>{stats.points}</p></article>
        <article className="card stat"><h3>Streak</h3><p>{stats.streakDays} days</p></article>
        <article className="card stat"><h3>Completed</h3><p>{stats.completedLessons}</p></article>
        <article className="card stat"><h3>Completion</h3><p>{stats.completionRate}%</p></article>
      </section>

      <section className="grid two-col">
        <article className="card">
          <h3>AI Tutor</h3>
          <input value={aiQuestion} onChange={(e) => setAiQuestion(e.target.value)} />
          <div className="row wrap">
            <input value={hintLessonId} onChange={(e) => setHintLessonId(e.target.value)} placeholder="Lesson ID" />
            <button onClick={askHint}>Get Hint</button>
            <button className="ghost-btn" onClick={getRecommendations}>Recommendations</button>
          </div>
          {aiHint && <p>{aiHint}</p>}
        </article>

        <article className="card">
          <h3>Certificates</h3>
          {certificates.length === 0 && <p className="muted">No certificates yet. Complete lessons and issue certificates.</p>}
          {certificates.map((c) => <p key={c.id}>🏅 {c.Lesson?.title} ({new Date(c.issuedAt).toLocaleDateString()})</p>)}
        </article>
      </section>

      <section className="grid two-col">
        <article className="card">
          <h3>Live Classes</h3>
          {liveSessions.map((s) => (
            <div key={s.id} className="lesson-item">
              <p><strong>{s.title}</strong></p>
              <p className="muted">{new Date(s.startsAt).toLocaleString()} • {s.durationMinutes} min</p>
              <button onClick={() => enrollLive(s.id)}>Enroll</button>
            </div>
          ))}
        </article>

        <article className="card">
          <h3>Assignments</h3>
          {assignments.map((a) => (
            <div key={a.id} className="lesson-item">
              <p><strong>{a.title}</strong></p>
              <p className="muted">Due: {a.dueAt ? new Date(a.dueAt).toLocaleDateString() : 'No deadline'}</p>
              <button onClick={() => submitAssignment(a.id)}>Submit</button>
            </div>
          ))}
          <h4>My Submissions</h4>
          {submissions.map((s) => <p key={s.id}>{s.Assignment?.title}: {s.status} {s.score != null ? `(${s.score})` : ''}</p>)}
        </article>
      </section>

      <section className="card">
        <h3>Creator Marketplace</h3>
        <div className="grid">
          {market.map((m) => (
            <article key={m.id} className="lesson-item">
              <p><strong>{m.title}</strong></p>
              <p className="muted">By {m.creator?.name} • ${(m.priceCents / 100).toFixed(2)} / {m.billingType}</p>
              <button type="button" disabled={busyPurchaseId === m.id} onClick={() => purchase(m.id)}>
                {busyPurchaseId === m.id ? 'Processing...' : 'Purchase'}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="card">
        <h3>Progress Tracking</h3>
        {progress.map((p) => (
          <article key={p.id} className="progress-row">
            <div className="row between wrap">
              <strong>{p.Lesson?.title}</strong>
              <span className="pill">Quiz {Math.round(p.quizScore)}%</span>
            </div>
            <div className="progress-track"><span style={{ width: `${p.completionPercent}%` }} /></div>
          </article>
        ))}
      </section>
    </main>
  );
}
