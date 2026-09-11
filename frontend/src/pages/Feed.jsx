import { useState, useEffect } from 'react';
import { getFeed } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import PostForm from '../components/PostForm.jsx';
import PostCard from '../components/PostCard.jsx';

export default function Feed() {
  const { session } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeed(session.token)
      .then(setPosts)
      .finally(() => setLoading(false));
  }, [session.token]);

  const onPost = (p) => setPosts((prev) => [p, ...prev]);
  const onDelete = (id) => setPosts((prev) => prev.filter((p) => p._id !== id));
  const onUpdate = (updated) => setPosts((prev) => prev.map((p) => p._id === updated._id ? updated : p));

  return (
    <div>
      <div style={s.header}><h2 style={s.title}>Home</h2></div>
      <PostForm onPost={onPost} />
      {loading ? (
        <p style={s.empty}>Loading…</p>
      ) : posts.length === 0 ? (
        <p style={s.empty}>No posts yet. Follow people or post something!</p>
      ) : (
        posts.map((p) => <PostCard key={p._id} post={p} onDelete={onDelete} onUpdate={onUpdate} />)
      )}
    </div>
  );
}

const s = {
  header: { padding: '1rem', borderBottom: '1px solid var(--border)', background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 5 },
  title: { fontWeight: 700, fontSize: '1.1rem' },
  empty: { textAlign: 'center', color: 'var(--muted)', padding: '3rem 1rem', fontSize: '0.9rem' },
};
