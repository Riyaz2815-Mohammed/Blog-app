import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Nav() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      {/* Sidebar (desktop) */}
      <nav style={s.sidebar}>
        <span style={s.logo}>Blog</span>
        <NavLink to="/" style={({ isActive }) => ({ ...s.link, ...(isActive ? s.active : {}) })} end>Home</NavLink>
        <NavLink to="/explore" style={({ isActive }) => ({ ...s.link, ...(isActive ? s.active : {}) })}>Explore</NavLink>
        <NavLink to={`/profile/${session?.user?.username}`} style={({ isActive }) => ({ ...s.link, ...(isActive ? s.active : {}) })}>
          Profile
        </NavLink>
        <div style={s.bottom}>
          <span style={s.uname}>@{session?.user?.username}</span>
          <button onClick={handleLogout} style={s.logoutBtn}>Logout</button>
        </div>
      </nav>

      {/* Bottom bar (mobile) */}
      <nav style={s.bottomBar}>
        <NavLink to="/" style={({ isActive }) => ({ ...s.mLink, ...(isActive ? s.mActive : {}) })} end>Home</NavLink>
        <NavLink to="/explore" style={({ isActive }) => ({ ...s.mLink, ...(isActive ? s.mActive : {}) })}>Explore</NavLink>
        <NavLink to={`/profile/${session?.user?.username}`} style={({ isActive }) => ({ ...s.mLink, ...(isActive ? s.mActive : {}) })}>Me</NavLink>
      </nav>
    </>
  );
}

const s = {
  sidebar: { position: 'fixed', top: 0, left: 0, width: 'var(--nav-w)', height: '100vh', borderRight: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', padding: '1.5rem 1rem', gap: '0.25rem', zIndex: 10 },
  logo: { fontWeight: 700, fontSize: '1.3rem', marginBottom: '1rem', paddingLeft: '0.5rem' },
  link: { padding: '0.55rem 0.75rem', borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: '0.95rem', fontWeight: 500, display: 'block' },
  active: { background: 'var(--bg)', color: 'var(--primary)', fontWeight: 600 },
  bottom: { marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  uname: { fontSize: '0.8rem', color: 'var(--muted)', paddingLeft: '0.5rem' },
  logoutBtn: { background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)', width: '100%', textAlign: 'left' },
  bottomBar: { display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--surface)', borderTop: '1px solid var(--border)', zIndex: 10, '@media(maxWidth:768px)': { display: 'flex' } },
  mLink: { flex: 1, padding: '0.75rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--muted)', display: 'block' },
  mActive: { color: 'var(--primary)', fontWeight: 600 },
};
