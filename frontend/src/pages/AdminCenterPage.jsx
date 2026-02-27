import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function AdminCenterPage() {
  const [overview, setOverview] = useState(null);
  const [flags, setFlags] = useState([]);
  const [suspensions, setSuspensions] = useState([]);
  const [audit, setAudit] = useState([]);
  const [suspendUserId, setSuspendUserId] = useState('');
  const [suspendReason, setSuspendReason] = useState('');

  const load = async () => {
    const [overviewRes, flagRes, suspensionRes, auditRes] = await Promise.all([
      api.get('/admin/overview'),
      api.get('/admin/flags'),
      api.get('/admin/suspensions'),
      api.get('/admin/audit-log')
    ]);
    setOverview(overviewRes.data);
    setFlags(flagRes.data);
    setSuspensions(suspensionRes.data);
    setAudit(auditRes.data);
  };

  useEffect(() => { load(); }, []);

  const resolveFlag = async (id) => {
    await api.post(`/admin/flags/${id}/resolve`);
    load();
  };

  const decideFlag = async (id, decision) => {
    await api.post(`/admin/flags/${id}/decision`, { decision, note: `${decision} by admin` });
    load();
  };

  const suspendUser = async (e) => {
    e.preventDefault();
    await api.post(`/admin/users/${suspendUserId}/suspend`, { reason: suspendReason || 'Policy violation' });
    setSuspendUserId('');
    setSuspendReason('');
    load();
  };

  const unsuspendUser = async (userId) => {
    await api.post(`/admin/users/${userId}/unsuspend`, { note: 'Reviewed and restored' });
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
            {flag.status === 'open' && (
              <div className="row wrap">
                <button onClick={() => resolveFlag(flag.id)}>Resolve</button>
                <button className="ghost-btn" onClick={() => decideFlag(flag.id, 'approve')}>Approve Report</button>
                <button className="ghost-btn" onClick={() => decideFlag(flag.id, 'reject')}>Reject Report</button>
              </div>
            )}
          </article>
        ))}
      </section>

      <section className="grid two-col">
        <article className="card">
          <h3>User Suspension</h3>
          <form className="row wrap" onSubmit={suspendUser}>
            <input placeholder="User ID" value={suspendUserId} onChange={(e) => setSuspendUserId(e.target.value)} required />
            <input placeholder="Reason" value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)} />
            <button type="submit">Suspend</button>
          </form>
          {suspensions.map((s) => (
            <div key={s.id} className="lesson-item">
              <p><strong>{s.User?.name}</strong> ({s.User?.email})</p>
              <p className="muted">{s.reason} • {s.active ? 'Active' : 'Released'}</p>
              {s.active && <button className="ghost-btn" onClick={() => unsuspendUser(s.userId)}>Unsuspend</button>}
            </div>
          ))}
        </article>

        <article className="card">
          <h3>Moderation Audit Log</h3>
          {audit.map((a) => (
            <div key={a.id} className="lesson-item">
              <p><strong>{a.action}</strong> by {a.admin?.name}</p>
              <p className="muted">{a.targetType} #{a.targetId}</p>
              {a.note && <p>{a.note}</p>}
            </div>
          ))}
        </article>
      </section>
    </main>
  );
}
