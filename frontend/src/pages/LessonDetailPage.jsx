import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

function formatTimer(seconds) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export default function LessonDetailPage() {
  const { lessonId } = useParams();
  const { user } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [status, setStatus] = useState('');
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [comment, setComment] = useState('');
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [quizAttempt, setQuizAttempt] = useState(null);
  const [quizSecondsLeft, setQuizSecondsLeft] = useState(0);

  const load = async () => {
    try {
      const { data } = await api.get(`/lessons/${lessonId}`);
      setLesson(data);
      setLoadError('');
    } catch (err) {
      setLoadError(err.response?.data?.error || 'Unable to open lesson.');
    }
  };

  useEffect(() => { load(); }, [lessonId]);

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => {
      setElapsed((v) => v + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!quizAttempt) return undefined;
    const id = setInterval(() => {
      const left = Math.max(0, Math.floor((new Date(quizAttempt.expiresAt).getTime() - Date.now()) / 1000));
      setQuizSecondsLeft(left);
      if (left === 0) setQuizAttempt(null);
    }, 1000);
    return () => clearInterval(id);
  }, [quizAttempt]);

  const totalQuiz = lesson?.quizQuestions?.length || 0;
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const quizProgress = totalQuiz ? Math.round((answeredCount / totalQuiz) * 100) : 0;

  const markStarted = async () => {
    if (!user) return;
    try {
      await api.post(`/progress/lessons/${lessonId}`, { status: 'in_progress', completionPercent: 35, timeSpentSeconds: elapsed || 120 });
      setRunning(true);
      setStatus('Session started.');
    } catch (err) {
      setStatus(err.response?.data?.error || 'Could not start session.');
    }
  };

  const stopAndSaveTime = async () => {
    if (!user) return;
    try {
      await api.post(`/progress/lessons/${lessonId}`, { status: 'in_progress', completionPercent: 60, timeSpentSeconds: elapsed });
      setRunning(false);
      setStatus('Progress saved.');
    } catch (err) {
      setStatus(err.response?.data?.error || 'Could not save progress.');
    }
  };

  const submitQuiz = async () => {
    try {
      const { data } = await api.post(`/progress/lessons/${lessonId}/quiz`, {
        answers,
        attemptToken: quizAttempt?.attemptToken
      });
      setResult(data);
      setRunning(false);
      setQuizAttempt(null);
      setStatus('Quiz submitted.');
    } catch (err) {
      setStatus(err.response?.data?.error || 'Quiz submission failed.');
    }
  };

  const startTimedQuiz = async () => {
    try {
      const { data } = await api.post(`/progress/lessons/${lessonId}/quiz/start`);
      setQuizAttempt(data);
      setQuizSecondsLeft(data.durationSeconds);
      setAnswers({});
      setResult(null);
      setStatus(`Timed quiz started. Attempt ${data.attemptNo}/3`);
    } catch (err) {
      setStatus(err.response?.data?.error || 'Unable to start quiz attempt.');
    }
  };

  const postComment = async () => {
    if (!comment.trim()) return;
    await api.post(`/lessons/${lessonId}/comments`, { body: comment });
    setComment('');
    load();
  };

  const toggleLike = async () => {
    await api.post(`/lessons/${lessonId}/likes/toggle`);
    load();
  };

  if (loadError) return <main className="container"><p className="error">{loadError}</p></main>;
  if (!lesson) return <main className="container">Loading lesson...</main>;

  const recommended = lesson.durationMinutes * 60;
  const pacePct = Math.min(100, Math.round((elapsed / recommended) * 100));
  const orderedQuestions = quizAttempt?.questionOrder?.length
    ? [...lesson.quizQuestions].sort((a, b) => quizAttempt.questionOrder.indexOf(a.id) - quizAttempt.questionOrder.indexOf(b.id))
    : lesson.quizQuestions;

  return (
    <main className="container">
      <section className="card surface-strong">
        <div className="row between wrap">
          <div>
            <p className="chip">{lesson.category} • {lesson.difficulty}</p>
            <h2>{lesson.title}</h2>
            <p>{lesson.description}</p>
          </div>
          <div className="timer-card">
            <p className="muted">Study Timer</p>
            <strong>{formatTimer(elapsed)}</strong>
            <p className="muted">Target {lesson.durationMinutes} min</p>
          </div>
        </div>
        <div className="progress-track"><span style={{ width: `${pacePct}%` }} /></div>
        {status && <p className="ok">{status}</p>}
        <p>{lesson.contentBody}</p>
        {lesson.mediaUrl && <a href={lesson.mediaUrl} target="_blank" rel="noreferrer">Open Media Resource</a>}
        {user && (
          <div className="row wrap">
            <button onClick={markStarted}>Start Session</button>
            <button className="ghost-btn" onClick={stopAndSaveTime}>Pause + Save Time</button>
          </div>
        )}
      </section>

      <section className="card">
        <div className="row between wrap">
          <h3>Quiz ({totalQuiz} questions)</h3>
          <span className="pill">
            {quizAttempt ? `Time left ${formatTimer(quizSecondsLeft)}` : `${quizProgress}% answered`}
          </span>
        </div>
        {user && <button className="ghost-btn" onClick={startTimedQuiz}>Start Timed Quiz</button>}
        <div className="progress-track"><span style={{ width: `${quizProgress}%` }} /></div>
        {orderedQuestions.map((q, idx) => (
          <div key={q.id} className="quiz-q">
            <p>{idx + 1}. {q.prompt}</p>
            {['A', 'B', 'C', 'D'].map((opt) => (
              <label key={opt} className={answers[q.id] === opt ? 'option selected' : 'option'}>
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  checked={answers[q.id] === opt}
                  onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                />
                <span>{q[`option${opt}`]}</span>
              </label>
            ))}
          </div>
        ))}
        {user && <button disabled={answeredCount !== totalQuiz || (quizAttempt && quizSecondsLeft === 0)} onClick={submitQuiz}>Submit Quiz</button>}
        {result && <p className={result.passed ? 'ok' : 'error'}>Score: {result.score}% ({result.correct}/{result.total}) {result.passed ? 'Passed' : 'Try again'}</p>}
      </section>

      <section className="card">
        <div className="row between wrap">
          <h3>Discussion + Reactions</h3>
          {user && <button className="ghost-btn" onClick={toggleLike}>Like / Unlike</button>}
        </div>
        <p>{lesson.Likes?.length || 0} likes</p>
        <div className="comments">
          {(lesson.Comments || []).map((c) => (
            <p key={c.id}><strong>{c.User?.name || 'User'}:</strong> {c.body}</p>
          ))}
        </div>
        {user && (
          <div className="row wrap">
            <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share insight or ask a question" />
            <button onClick={postComment}>Post</button>
          </div>
        )}
      </section>
    </main>
  );
}
