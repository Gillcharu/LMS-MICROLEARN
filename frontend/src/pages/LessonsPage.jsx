import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function LessonsPage() {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [tags, setTags] = useState('');
  const [creator, setCreator] = useState('');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [maxDuration, setMaxDuration] = useState(15);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('q', search.trim());
    if (category !== 'all') params.set('topic', category);
    if (difficulty) params.set('difficulty', difficulty);
    if (creator.trim()) params.set('creator', creator.trim());
    if (tags.trim()) params.set('tags', tags.trim());
    const endpoint = params.toString() ? `/lessons/search?${params.toString()}` : '/lessons';

    api.get(endpoint)
      .then((res) => {
        setLessons(res.data);
        setError('');
      })
      .catch(() => setError('Unable to load lessons. Check backend server and login.'));
  }, [search, category, difficulty, creator, tags]);

  const categories = useMemo(() => {
    const vals = Array.from(new Set(lessons.map((l) => l.category))).filter(Boolean);
    return ['all', ...vals];
  }, [lessons]);

  const filtered = useMemo(() => {
    return [...lessons]
      .filter((lesson) => category === 'all' || lesson.category === category)
      .filter((lesson) => lesson.durationMinutes <= maxDuration)
      .filter((lesson) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return lesson.title.toLowerCase().includes(q) || (lesson.description || '').toLowerCase().includes(q);
      })
      .sort((a, b) => {
        if (sortBy === 'duration') return a.durationMinutes - b.durationMinutes;
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [lessons, sortBy, maxDuration]);

  return (
    <main className="container">
      <section className="card surface-strong">
        <div className="row between wrap">
          <div>
            <h2>Micro-Lesson Library</h2>
            <p className="muted">Interactive discovery with filters, search, and duration controls.</p>
          </div>
          <span className="pill">{filtered.length} lessons</span>
        </div>
        <div className="grid controls-grid">
          <input placeholder="Search by title or description" value={search} onChange={(e) => setSearch(e.target.value)} />
          <input placeholder="Tags (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
          <input placeholder="Creator name" value={creator} onChange={(e) => setCreator(e.target.value)} />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="">Difficulty: All</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Sort: Newest</option>
            <option value="duration">Sort: Shortest Duration</option>
            <option value="title">Sort: Title A-Z</option>
          </select>
          <label>
            Max Duration: {maxDuration} min
            <input type="range" min="5" max="15" value={maxDuration} onChange={(e) => setMaxDuration(Number(e.target.value))} />
          </label>
        </div>
      </section>

      <div className="grid">
        {error && <p className="error">{error}</p>}
        {filtered.map((lesson) => (
          <article key={lesson.id} className="card lesson-card">
            <p className="chip">{lesson.category}</p>
            <h3>{lesson.title}</h3>
            <p>{lesson.description}</p>
            <div className="row between">
              <p><strong>{lesson.durationMinutes}</strong> min</p>
              <p><strong>{lesson.quizQuestions?.length || 0}</strong> quiz Qs</p>
            </div>
            <button type="button" className="cta-btn" onClick={() => navigate(`/lessons/${lesson.id}`)}>
              Start Lesson
            </button>
          </article>
        ))}
      </div>
    </main>
  );
}
