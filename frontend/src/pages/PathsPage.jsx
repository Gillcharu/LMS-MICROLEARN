import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function PathsPage() {
  const { user } = useAuth();
  const [paths, setPaths] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedLessonIds, setSelectedLessonIds] = useState([]);
  const [publishNow, setPublishNow] = useState(false);
  const [status, setStatus] = useState('');

  const load = async () => {
    const [pathRes, lessonRes] = await Promise.all([api.get('/paths'), api.get('/lessons')]);
    setPaths(pathRes.data);
    setLessons(lessonRes.data);
  };

  useEffect(() => { load(); }, []);

  const enroll = async (id) => {
    await api.post(`/paths/${id}/enroll`);
    setStatus('Enrolled in path successfully.');
  };

  const toggleLesson = (lessonId) => {
    setSelectedLessonIds((prev) => (prev.includes(lessonId) ? prev.filter((id) => id !== lessonId) : [...prev, lessonId]));
  };

  const createPath = async (e) => {
    e.preventDefault();
    const { data } = await api.post('/paths', { title, description, lessonIds: selectedLessonIds });
    if (publishNow && user && (user.role === 'creator' || user.role === 'admin')) {
      await api.post(`/paths/${data.id}/publish`);
    }
    setTitle('');
    setDescription('');
    setSelectedLessonIds([]);
    setPublishNow(false);
    setStatus('Path created successfully.');
    load();
  };

  return (
    <main className="container">
      <h2>Learning Paths</h2>
      <p className="muted">Enroll in published paths or build your own path from existing lessons.</p>

      {user && (
        <form className="card" onSubmit={createPath}>
          <div className="row between wrap">
            <h3>Create Custom Path</h3>
            <span className="pill">{selectedLessonIds.length} lessons selected</span>
          </div>
          <input placeholder="Path title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <textarea placeholder="What outcome should learners reach?" value={description} onChange={(e) => setDescription(e.target.value)} required />

          <div className="lesson-picker">
            {lessons.map((lesson) => (
              <label className="option" key={lesson.id}>
                <input
                  type="checkbox"
                  checked={selectedLessonIds.includes(lesson.id)}
                  onChange={() => toggleLesson(lesson.id)}
                />
                <span>{lesson.title} ({lesson.durationMinutes} min)</span>
              </label>
            ))}
          </div>

          {(user.role === 'creator' || user.role === 'admin') && (
            <label className="option">
              <input type="checkbox" checked={publishNow} onChange={(e) => setPublishNow(e.target.checked)} />
              <span>Publish immediately</span>
            </label>
          )}

          <button type="submit" disabled={selectedLessonIds.length === 0}>Create Path</button>
          {status && <p className="ok">{status}</p>}
        </form>
      )}

      <div className="grid">
        {paths.map((p) => (
          <article key={p.id} className="card">
            <h3>{p.title}</h3>
            <p>{p.description}</p>
            <p><strong>{p.lessons?.length || 0}</strong> lessons</p>
            <div className="row wrap">
              {(p.lessons || []).slice(0, 4).map((lesson) => (
                <span key={lesson.id} className="chip">{lesson.title}</span>
              ))}
            </div>
            {user && <button onClick={() => enroll(p.id)}>Enroll</button>}
          </article>
        ))}
      </div>
    </main>
  );
}
