import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ParentTrackingPage() {
  const { user } = useAuth();
  const [parentEmail, setParentEmail] = useState('');
  const [parents, setParents] = useState([]);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childProgress, setChildProgress] = useState([]);
  const [alertPref, setAlertPref] = useState(null);
  const [alertPreview, setAlertPreview] = useState([]);
  const [status, setStatus] = useState('');

  const load = async () => {
    if (!user) return;
    if (user.role === 'parent') {
      const [childRes, prefRes, previewRes] = await Promise.all([
        api.get('/parents/children'),
        api.get('/parent-alerts/preferences'),
        api.get('/parent-alerts/preview')
      ]);
      setChildren(childRes.data);
      setAlertPref(prefRes.data);
      setAlertPreview(previewRes.data.summaries || []);
    } else {
      const { data } = await api.get('/parents/mine');
      setParents(data);
    }
  };

  useEffect(() => { load(); }, [user?.role]);

  const linkParent = async (e) => {
    e.preventDefault();
    await api.post('/parents/link', { parentEmail });
    setStatus('Parent linked successfully.');
    setParentEmail('');
    load();
  };

  const viewChildProgress = async (childId) => {
    const { data } = await api.get(`/parents/children/${childId}/progress`);
    setSelectedChild(data.child);
    setChildProgress(data.progress || []);
  };

  const saveAlerts = async () => {
    await api.patch('/parent-alerts/preferences', alertPref);
    setStatus('Alert preferences saved.');
    load();
  };

  return (
    <main className="container">
      <section className="card surface-strong group-hero">
        <img src="/images/parent-tracking.svg" alt="Parent tracking" className="section-image" />
        <div>
          <h2>Parent Tracking</h2>
          <p className="muted">Track learner progress and configure weekly/inactivity/milestone alerts.</p>
        </div>
      </section>
      {status && <p className="ok">{status}</p>}

      {user?.role === 'learner' && (
        <section className="card">
          <h3>Link Parent Account</h3>
          <form className="row wrap" onSubmit={linkParent}>
            <input placeholder="Parent email" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} required />
            <button type="submit">Link Parent</button>
          </form>
          {parents.map((p) => (
            <div key={p.id} className="lesson-item"><p><strong>{p.name}</strong> ({p.email})</p></div>
          ))}
        </section>
      )}

      {user?.role === 'parent' && (
        <section className="grid two-col">
          <article className="card">
            <h3>Linked Children</h3>
            {children.map((c) => (
              <div key={c.id} className="lesson-item">
                <p><strong>{c.name}</strong></p>
                <p className="muted">{c.points} points • streak {c.streakDays} days</p>
                <button onClick={() => viewChildProgress(c.id)}>View Progress</button>
              </div>
            ))}
          </article>

          <article className="card">
            <h3>Alert Preferences</h3>
            {alertPref && (
              <>
                <label className="option"><input type="checkbox" checked={alertPref.weeklyDigest} onChange={(e) => setAlertPref({ ...alertPref, weeklyDigest: e.target.checked })} /><span>Weekly Digest</span></label>
                <label className="option"><input type="checkbox" checked={alertPref.inactivityAlert} onChange={(e) => setAlertPref({ ...alertPref, inactivityAlert: e.target.checked })} /><span>Inactivity Alert</span></label>
                <label className="option"><input type="checkbox" checked={alertPref.milestoneAlert} onChange={(e) => setAlertPref({ ...alertPref, milestoneAlert: e.target.checked })} /><span>Milestone Alert</span></label>
                <button onClick={saveAlerts}>Save Preferences</button>
              </>
            )}
            <h4>Alert Preview</h4>
            {alertPreview.map((p, idx) => (
              <div key={idx} className="lesson-item">
                <p><strong>{p.child}</strong></p>
                <p>{p.weeklyDigest}</p>
                <p className="muted">{p.inactivityAlert}</p>
                <p className="muted">{p.milestoneAlert}</p>
              </div>
            ))}
          </article>

          <article className="card two-col-span">
            <h3>Child Progress Details</h3>
            {!selectedChild && <p className="muted">Select a child to inspect lesson progress.</p>}
            {selectedChild && childProgress.map((p) => (
              <div key={p.id} className="progress-row">
                <p><strong>{p.Lesson?.title}</strong></p>
                <p className="muted">{p.status} • quiz {Math.round(p.quizScore)}%</p>
                <div className="progress-track"><span style={{ width: `${p.completionPercent}%` }} /></div>
              </div>
            ))}
          </article>
        </section>
      )}
    </main>
  );
}
