import { useState, useEffect } from 'react';
import { getExplore, searchUsers, followUser } from '../api.js';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import PostCard from '../components/PostCard.jsx';

export default function Explore() {
  const { session, updateUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    getExplore(session.token)
      .then(setPosts)
      .finally(() => setLoading(false));
  }, [session.token]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try { setResults(await searchUsers(session.token, query)); } catch {}
      setSearching(false);
    }, 350);
    return () => clearTimeout(t);
  }, [query, session.token]);

  const handleFollow = async (username) => {
    try {
      const res = await followUser(session.token, username);
      const me = { ...session.user };
      if (res.following) me.following = [...me.following, username];
      else me.following = me.following.filter((id) => id !== username);
      updateUser(me);
    } catch {}
  };

  const onDelete = (id) => setPosts((p) => p.filter((x) => x._id !== id));
  const onUpdate = (updated) => setPosts((p) => p.map((x) => x._id === updated._id ? updated : x));

  return (
    <div>
      <div style={s.header}>
        <h2 style={s.title}>Explore</h2>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search people…"
          style={s.search}
        />
        {query && (
          <div style={s.dropdown}>
            {searching && <p style={s.hint}>Searching…</p>}
            {!searching && results.length === 0 && <p style={s.hint}>No users found</p>}
            {results.map((u) => (
              <div key={u._id} style={s.resultRow}>
                <Link to={`/profile/${u.username}`} style={s.resultInfo} onClick={() => setQuery('')}>
                  <div style={s.rAvatar}>{u.name[0].toUpperCase()}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.name}</div>
                    <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>@{u.username}</div>
                  </div>
                </Link>
                <button
                  onClick={() => handleFollow(u.username)}
                  style={s.followBtn}
                >
                  {session.user.following?.includes(u._id) ? 'Unfollow' : 'Follow'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <p style={s.empty}>Loading…</p>
      ) : (
        posts.map((p) => <PostCard key={p._id} post={p} onDelete={onDelete} onUpdate={onUpdate} />)
      )}
    </div>
  );
}

const s = {
  header: { padding: '1rem', borderBottom: '1px solid var(--border)', background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 5 },
  title: { fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.75rem' },
  search: { borderRadius: 999 },
  dropdown: { position: 'absolute', left: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginTop: '0.25rem', zIndex: 20, overflow: 'hidden' },
  hint: { padding: '0.75rem 1rem', color: 'var(--muted)', fontSize: '0.85rem' },
  resultRow: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1rem', borderBottom: '1px solid var(--border)' },
  resultInfo: { display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1 },
  rAvatar: { width: 34, height: 34, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 },
  followBtn: { background: 'var(--primary)', color: '#fff', fontSize: '0.8rem', padding: '0.3rem 0.8rem' },
  empty: { textAlign: 'center', color: 'var(--muted)', padding: '3rem 1rem', fontSize: '0.9rem' },
};
