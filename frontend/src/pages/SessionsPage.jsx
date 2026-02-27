import { useEffect, useState } from 'react';
import { api } from '../api/client';

function toYouTubeEmbed(url) {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  if (!match) return null;
  return `https://www.youtube.com/embed/${match[1]}`;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [market, setMarket] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [status, setStatus] = useState('');
  const [busyKey, setBusyKey] = useState('');

  const load = async () => {
    const [liveRes, marketRes, purchaseRes] = await Promise.all([
      api.get('/live'),
      api.get('/monetization/marketplace'),
      api.get('/monetization/purchases/mine')
    ]);
    setSessions(liveRes.data);
    setMarket(marketRes.data);
    setPurchases(purchaseRes.data);
  };

  useEffect(() => {
    load();
  }, []);

  const enroll = async (id) => {
    setBusyKey(`enroll-${id}`);
    try {
      const { data } = await api.post(`/live/${id}/enroll`);
      setStatus(data.message || 'Enrolled in session.');
    } catch (err) {
      setStatus(err.response?.data?.error || 'Unable to enroll in session.');
    } finally {
      setBusyKey('');
    }
  };

  const purchase = async (id) => {
    setBusyKey(`buy-${id}`);
    try {
      const { data } = await api.post(`/monetization/offerings/${id}/purchase`);
      setStatus(data.message || 'Purchase successful.');
      load();
    } catch (err) {
      setStatus(err.response?.data?.error || 'Purchase failed.');
    } finally {
      setBusyKey('');
    }
  };

  const owned = new Set(purchases.map((p) => p.offeringId));

  return (
    <main className="container">
      <h2>Sessions & Marketplace</h2>
      {status && <p className="ok">{status}</p>}

      <section className="grid two-col">
        <article className="card">
          <h3>Live Sessions</h3>
          {sessions.length === 0 && <p className="muted">No sessions scheduled yet.</p>}
          {sessions.map((s) => (
            <div key={s.id} className="lesson-item">
              <p><strong>{s.title}</strong></p>
              <p className="muted">{new Date(s.startsAt).toLocaleString()} • {s.durationMinutes} min</p>
              <p className="muted">By {s.creator?.name}</p>
              <div className="row wrap">
                <button type="button" disabled={busyKey === `enroll-${s.id}`} onClick={() => enroll(s.id)}>
                  {busyKey === `enroll-${s.id}` ? 'Enrolling...' : 'Enroll'}
                </button>
                {s.meetingUrl && (
                  <a className="ghost-btn" href={s.meetingUrl} target="_blank" rel="noreferrer">
                    Watch Demo
                  </a>
                )}
              </div>
              {toYouTubeEmbed(s.meetingUrl) && (
                <iframe
                  title={`session-${s.id}`}
                  src={toYouTubeEmbed(s.meetingUrl)}
                  width="100%"
                  height="200"
                  style={{ border: 0, borderRadius: '10px', marginTop: '0.5rem' }}
                  allowFullScreen
                />
              )}
            </div>
          ))}
        </article>

        <article className="card">
          <h3>Creator Marketplace</h3>
          {market.length === 0 && <p className="muted">No offerings available yet.</p>}
          {market.map((m) => (
            <div key={m.id} className="lesson-item">
              <p><strong>{m.title}</strong></p>
              <p className="muted">By {m.creator?.name}</p>
              <p className="muted">${(m.priceCents / 100).toFixed(2)} / {m.billingType}</p>
              <button type="button" disabled={owned.has(m.id) || busyKey === `buy-${m.id}`} onClick={() => purchase(m.id)}>
                {owned.has(m.id) ? 'Purchased' : busyKey === `buy-${m.id}` ? 'Processing...' : 'Purchase'}
              </button>
            </div>
          ))}
        </article>
      </section>
    </main>
  );
}
