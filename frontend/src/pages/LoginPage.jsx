import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
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
      const user = await login(form.email, form.password);
      navigate(routeByRole(user.role));
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check credentials and backend server.');
    }
  };

  return (
    <main className="container narrow">
      <h2>Login</h2>
      <form className="card" onSubmit={submit}>
        <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error && <p className="error">{error}</p>}
        <button type="submit">Sign in</button>
      </form>
      <section className="card">
        <p className="muted">Demo accounts</p>
        <p><strong>Creator:</strong> creator@microlearn.app / password123</p>
        <p><strong>Learner:</strong> learner@microlearn.app / password123</p>
        <p><strong>Parent:</strong> parent@microlearn.app / password123</p>
        <p><strong>Admin:</strong> admin@microlearn.app / password123</p>
      </section>
      <p>Need an account? <Link to="/register">Register</Link></p>
    </main>
  );
}
