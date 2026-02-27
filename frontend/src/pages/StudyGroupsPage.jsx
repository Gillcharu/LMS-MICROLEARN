import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function StudyGroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [form, setForm] = useState({ name: '', topic: '', description: '', coverImage: '/images/group-illustration.svg' });
  const [post, setPost] = useState({ content: '', imageUrl: '' });

  const loadGroups = async () => {
    const { data } = await api.get('/groups');
    setGroups(data);
  };

  const openGroup = async (id) => {
    const { data } = await api.get(`/groups/${id}`);
    setSelectedGroup(data);
  };

  useEffect(() => { loadGroups(); }, []);

  const createGroup = async (e) => {
    e.preventDefault();
    await api.post('/groups', form);
    setForm({ name: '', topic: '', description: '', coverImage: '/images/group-illustration.svg' });
    loadGroups();
  };

  const joinGroup = async (id) => {
    await api.post(`/groups/${id}/join`);
    openGroup(id);
  };

  const createPost = async (e) => {
    e.preventDefault();
    if (!selectedGroup) return;
    await api.post(`/groups/${selectedGroup.id}/posts`, post);
    setPost({ content: '', imageUrl: '' });
    openGroup(selectedGroup.id);
  };

  return (
    <main className="container">
      <section className="card surface-strong group-hero">
        <img src="/images/group-illustration.svg" alt="Study groups" className="section-image" />
        <div>
          <h2>Study Groups</h2>
          <p className="muted">Create communities, share check-ins, post screenshots, and motivate peers.</p>
        </div>
      </section>

      {user && (
        <form className="card" onSubmit={createGroup}>
          <h3>➕ Create Group</h3>
          <div className="grid two-col">
            <input placeholder="Group name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input placeholder="Topic" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} required />
          </div>
          <textarea placeholder="Group description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input placeholder="Cover image URL" value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} />
          <button type="submit">Create Study Group</button>
        </form>
      )}

      <section className="grid two-col">
        <article className="card">
          <h3>🌐 Discover Groups</h3>
          {groups.map((group) => (
            <div className="lesson-item" key={group.id}>
              <img src={group.coverImage || '/images/group-illustration.svg'} alt={group.name} className="thumb" />
              <p><strong>{group.name}</strong></p>
              <p className="muted">{group.topic} • {group.memberCount || 0} members</p>
              <div className="row wrap">
                <button onClick={() => openGroup(group.id)}>Open</button>
                {user && <button className="ghost-btn" onClick={() => joinGroup(group.id)}>Join</button>}
              </div>
            </div>
          ))}
        </article>

        <article className="card">
          <h3>💬 Group Feed</h3>
          {!selectedGroup && <p className="muted">Select a group to view live posts.</p>}
          {selectedGroup && (
            <>
              <p><strong>{selectedGroup.name}</strong></p>
              <p className="muted">{selectedGroup.description}</p>
              {user && (
                <form onSubmit={createPost}>
                  <textarea placeholder="Share progress update" value={post.content} onChange={(e) => setPost({ ...post, content: e.target.value })} required />
                  <input placeholder="Optional image URL" value={post.imageUrl} onChange={(e) => setPost({ ...post, imageUrl: e.target.value })} />
                  <button type="submit">Post Update</button>
                </form>
              )}
              {(selectedGroup.posts || []).map((p) => (
                <div key={p.id} className="lesson-item">
                  <p><strong>{p.User?.name}</strong></p>
                  <p>{p.content}</p>
                  {p.imageUrl && <img src={p.imageUrl} alt="Group post" className="thumb" />}
                </div>
              ))}
            </>
          )}
        </article>
      </section>
    </main>
  );
}
