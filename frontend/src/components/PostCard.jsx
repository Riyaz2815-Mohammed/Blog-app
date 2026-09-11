import { useState } from 'react';
import { Link } from 'react-router-dom';
import { likePost, updatePost, deletePost } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function PostCard({ post, onDelete, onUpdate }) {
  const { session } = useAuth();
  const [likes, setLikes] = useState(post.likes.length);
  const [liked, setLiked] = useState(post.likes.includes(session.user._id));
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(post.content);
  const [saving, setSaving] = useState(false);

  const isOwner = post.author._id === session.user._id;

  const handleLike = async () => {
    try {
      const res = await likePost(session.token, post._id);
      setLikes(res.likes);
      setLiked(res.liked);
    } catch {}
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      const updated = await updatePost(session.token, post._id, { content });
      onUpdate(updated);
      setEditing(false);
    } catch {}
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await deletePost(session.token, post._id);
      onDelete(post._id);
    } catch {}
  };

  const ago = (d) => {
    const diff = (Date.now() - new Date(d)) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  return (
    <div style={s.card}>
      <div style={s.avatar}>{post.author.name[0].toUpperCase()}</div>
      <div style={s.body}>
        <div style={s.header}>
          <Link to={`/profile/${post.author.username}`} style={s.name}>{post.author.name}</Link>
          <span style={s.handle}>@{post.author.username}</span>
          <span style={s.time}>{ago(post.createdAt)}</span>
          {isOwner && !editing && (
            <div style={s.actions}>
              <button onClick={() => setEditing(true)} style={s.actionBtn}>Edit</button>
              <button onClick={handleDelete} style={{ ...s.actionBtn, color: 'var(--danger)' }}>Del</button>
            </div>
          )}
        </div>

        {editing ? (
          <div style={s.editBox}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={280}
              rows={3}
              autoFocus
            />
            <div style={s.editActions}>
              <span style={s.charCount}>{280 - content.length}</span>
              <button onClick={() => setEditing(false)} style={s.cancelBtn}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={s.saveBtn}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <p style={s.content}>{post.content}</p>
        )}

        <div style={s.footer}>
          <button onClick={handleLike} style={{ ...s.likeBtn, ...(liked ? s.likedBtn : {}) }}>
            {liked ? '♥' : '♡'} {likes}
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  card: { display: 'flex', gap: '0.75rem', padding: '1rem', borderBottom: '1px solid var(--border)', background: 'var(--surface)' },
  avatar: { width: 40, height: 40, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', flexShrink: 0 },
  body: { flex: 1, minWidth: 0 },
  header: { display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.35rem' },
  name: { fontWeight: 600, fontSize: '0.9rem' },
  handle: { color: 'var(--muted)', fontSize: '0.82rem' },
  time: { color: 'var(--muted)', fontSize: '0.78rem', marginLeft: 'auto' },
  actions: { display: 'flex', gap: '0.25rem' },
  actionBtn: { background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)', fontSize: '0.75rem', padding: '0.15rem 0.5rem' },
  content: { fontSize: '0.95rem', lineHeight: 1.5, wordBreak: 'break-word' },
  editBox: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  editActions: { display: 'flex', gap: '0.4rem', alignItems: 'center', justifyContent: 'flex-end' },
  charCount: { fontSize: '0.78rem', color: 'var(--muted)', marginRight: 'auto' },
  cancelBtn: { background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: '0.8rem' },
  saveBtn: { background: 'var(--primary)', color: '#fff', fontSize: '0.8rem' },
  footer: { marginTop: '0.5rem' },
  likeBtn: { background: 'transparent', color: 'var(--muted)', border: 'none', fontSize: '0.88rem', padding: '0.2rem 0', cursor: 'pointer' },
  likedBtn: { color: 'var(--danger)' },
};
