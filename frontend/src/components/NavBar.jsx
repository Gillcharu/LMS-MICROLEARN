import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function navClass({ isActive }) {
  return isActive ? 'nav-link active' : 'nav-link';
}

export default function NavBar() {
  const { user, logout } = useAuth();

  return (
    <header className="nav-shell">
      <div className="nav">
        <NavLink className="brand" to="/">MicroLearn ✦</NavLink>
        <nav>
          {user?.role === 'learner' && <NavLink className={navClass} to="/lessons">Lessons</NavLink>}
          {user?.role === 'learner' && <NavLink className={navClass} to="/paths">Paths</NavLink>}
          {user?.role === 'learner' && <NavLink className={navClass} to="/groups">Groups</NavLink>}
          {user?.role === 'learner' && <NavLink className={navClass} to="/sessions">Sessions</NavLink>}
          {user?.role === 'learner' && <NavLink className={navClass} to="/dashboard">Dashboard</NavLink>}
          {user?.role === 'creator' && <NavLink className={navClass} to="/creator">Creator Studio</NavLink>}
          {user?.role === 'parent' && <NavLink className={navClass} to="/parent-tracking">Parent Tracking</NavLink>}
          {user?.role === 'admin' && <NavLink className={navClass} to="/admin">Admin Center</NavLink>}
          <NavLink className={navClass} to="/help">Help</NavLink>
        </nav>
        <div className="nav-user">
          {!user && <NavLink className={navClass} to="/login">Login</NavLink>}
          {!user && <NavLink className={navClass} to="/register">Register</NavLink>}
          {user && <span className="pill">{user.name} ({user.role})</span>}
          {user && <button className="ghost-btn" onClick={logout}>Logout</button>}
        </div>
      </div>
    </header>
  );
}
