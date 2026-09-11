import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Auth() {
  const { login: setSession } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = mode === 'login'
        ? await login({ email: form.email, password: form.password })
        : await register({ name: form.name, username: form.username.toLowerCase(), email: form.email, password: form.password });
      setSession(data);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h2 style={s.logo}>Blog</h2>
        <p style={s.sub}>{mode === 'login' ? 'Sign in to your account' : 'Create an account'}</p>
        <form onSubmit={submit} style={s.form}>
          {mode === 'register' && (
            <>
              <Field label="Name" value={form.name} onChange={set('name')} placeholder="Your name" required />
              <Field label="Username" value={form.username} onChange={set('username')} placeholder="yourhandle" required pattern="[a-zA-Z0-9_]{3,20}" title="3–20 chars, letters/numbers/underscore" />
            </>
          )}
          <Field label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
          <Field label="Password" type="password" value={form.password} onChange={set('password')} placeholder="••••••••" required minLength={6} />
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading} style={s.btn}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Register'}
          </button>
        </form>
        <p style={s.toggle}>
          {mode === 'login' ? "No account? " : 'Have an account? '}
          <span style={s.link} onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
            {mode === 'login' ? 'Register' : 'Sign in'}
          </span>
        </p>
      </div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>{label}</label>
      <input {...props} />
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '2rem', width: '100%', maxWidth: 380 },
  logo: { fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.25rem' },
  sub: { color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '1.5rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.85rem' },
  btn: { background: 'var(--primary)', color: '#fff', padding: '0.6rem', fontSize: '0.9rem', marginTop: '0.25rem' },
  toggle: { textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--muted)' },
  link: { color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 },
};
