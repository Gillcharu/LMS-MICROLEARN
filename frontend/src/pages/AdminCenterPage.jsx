import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function AdminCenterPage() {
  const [overview, setOverview] = useState(null);
  const [flags, setFlags] = useState([]);

  const load = async () => {
    const [overviewRes, flagRes] = await Promise.all([
      api.get('/admin/overview'),
      api.get('/admin/flags'),
    ]);
    setOverview(overviewRes.data);
    setFlags(flagRes.data);
  };

  useEffect(() => { load(); }, []);

  const resolveFlag = async (id) => {
    await api.post(`/admin/flags/${id}/resolve`);
    load();
  };

  if (!overview) return <main className="container">Loading admin center...</main>;

  return (
    <main className="container">
      <h2>Admin Control Center</h2>
      <section className="grid metrics">
        <article className="card stat"><h3>Users</h3><p>{overview.users}</p></article>
        <article className="card stat"><h3>Creators</h3><p>{overview.creators}</p></article>
        <article className="card stat"><h3>Learners</h3><p>{overview.learners}</p></article>
        <article className="card stat"><h3>Parents</h3><p>{overview.parents}</p></article>
        <article className="card stat"><h3>Pending Lessons</h3><p>{overview.pendingLessons}</p></article>
        <article className="card stat"><h3>Open Flags</h3><p>{overview.openFlags}</p></article>
      </section>

      <section className="card">
        <h3>Content Moderation Flags</h3>
        {flags.map((flag) => (
          <article key={flag.id} className="lesson-item">
            <p><strong>Lesson:</strong> {flag.Lesson?.title}</p>
            <p><strong>Reporter:</strong> {flag.reporter?.name}</p>
            <p><strong>Reason:</strong> {flag.reason}</p>
            <p><strong>Status:</strong> {flag.status}</p>
            {flag.status === 'open' && <button onClick={() => resolveFlag(flag.id)}>Resolve</button>}
          </article>
        ))}
      </section>
    </main>
  );
}
