import { useState } from 'react';
import { createPost } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function PostForm({ onPost }) {
  const { session } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setError('');
    try {
      const post = await createPost(session.token, { content });
      onPost(post);
      setContent('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} style={s.form}>
      <div style={s.row}>
        <div style={s.avatar}>{session.user.name[0].toUpperCase()}</div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          maxLength={280}
          rows={3}
          style={s.textarea}
        />
      </div>
      {error && <p className="error" style={{ paddingLeft: '3.25rem' }}>{error}</p>}
      <div style={s.footer}>
        <span style={s.count}>{280 - content.length}</span>
        <button type="submit" disabled={loading || !content.trim()} style={s.btn}>
          {loading ? 'Posting…' : 'Post'}
        </button>
      </div>
    </form>
  );
}

const s = {
  form: { padding: '1rem', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  row: { display: 'flex', gap: '0.75rem' },
  avatar: { width: 40, height: 40, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 },
  textarea: { border: 'none', outline: 'none', fontSize: '0.95rem', padding: '0.25rem 0', background: 'transparent', resize: 'none', flex: 1 },
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', paddingLeft: '3.25rem' },
  count: { fontSize: '0.8rem', color: 'var(--muted)' },
  btn: { background: 'var(--primary)', color: '#fff' },
};
