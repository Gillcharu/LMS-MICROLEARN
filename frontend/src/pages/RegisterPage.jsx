import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'learner' });
  const [error, setError] = useState('');

  const routeByRole = (role) => {
    if (role === 'creator') return '/creator';
    if (role === 'parent') return '/parent-tracking';
    if (role === 'admin') return '/admin';
    return '/dashboard';
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await register(form);
      navigate(routeByRole(user.role));
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <main className="container narrow">
      <h2>Create Account</h2>
      <form className="card" onSubmit={submit}>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="learner">Learner</option>
          <option value="creator">Creator</option>
          <option value="parent">Parent</option>
        </select>
        {error && <p className="error">{error}</p>}
        <button type="submit">Register</button>
      </form>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </main>
  );
}
