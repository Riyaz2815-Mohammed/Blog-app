import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProfile, getUserPosts, followUser, updateMe } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import PostCard from '../components/PostCard.jsx';

function UserListModal({ title, users, onClose }) {
  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        <div style={s.modalHeader}>
          <span style={s.modalTitle}>{title}</span>
          <button onClick={onClose} style={s.closeBtn}>✕</button>
        </div>
        {users.length === 0 ? (
          <p style={s.modalEmpty}>Nobody here yet.</p>
        ) : (
          users.map((u) => (
            <Link key={u._id} to={`/profile/${u.username}`} onClick={onClose} style={s.userRow}>
              <div style={s.rAvatar}>{u.name[0].toUpperCase()}</div>
              <div>
                <div style={s.rName}>{u.name}</div>
                <div style={s.rHandle}>@{u.username}</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

export default function Profile() {
  const { username } = useParams();
  const { session, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null); // 'followers' | 'following' | null

  const isMe = session.user.username === username;

  useEffect(() => {
    setLoading(true);
    Promise.all([getProfile(session.token, username), getUserPosts(session.token, username)])
      .then(([p, posts]) => { setProfile(p); setBio(p.bio || ''); setPosts(posts); })
      .finally(() => setLoading(false));
  }, [username, session.token]);

  const isFollowing = profile?.followers?.some((f) => f._id === session.user._id || f === session.user._id);

  const handleFollow = async () => {
    try {
      const res = await followUser(session.token, username);
      setProfile((p) => ({
        ...p,
        followers: res.following
          ? [...p.followers, { _id: session.user._id, name: session.user.name, username: session.user.username }]
          : p.followers.filter((f) => (f._id || f) !== session.user._id),
      }));
    } catch {}
  };

  const handleSaveBio = async () => {
    setSaving(true);
    try {
      const updated = await updateMe(session.token, { bio });
      updateUser(updated);
      setProfile((p) => ({ ...p, bio }));
      setEditingBio(false);
    } catch {}
    setSaving(false);
  };

  const onDelete = (id) => setPosts((p) => p.filter((x) => x._id !== id));
  const onUpdate = (updated) => setPosts((p) => p.map((x) => x._id === updated._id ? updated : x));

  if (loading) return <p style={s.empty}>Loading…</p>;
  if (!profile) return <p style={s.empty}>User not found.</p>;

  return (
    <div>
      {modal && (
        <UserListModal
          title={modal === 'followers' ? 'Followers' : 'Following'}
          users={modal === 'followers' ? profile.followers : profile.following}
          onClose={() => setModal(null)}
        />
      )}

      {/* Header */}
      <div style={s.header}>
        <div style={s.avatarLg}>{profile.name[0].toUpperCase()}</div>
        <div style={s.info}>
          <div style={s.nameRow}>
            <h2 style={s.name}>{profile.name}</h2>
            {!isMe && (
              <button onClick={handleFollow} style={isFollowing ? s.unfollowBtn : s.followBtn}>
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>
          <span style={s.handle}>@{profile.username}</span>

          {editingBio ? (
            <div style={s.bioEdit}>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} maxLength={160} placeholder="Write a short bio…" />
              <div style={s.bioActions}>
                <button onClick={() => setEditingBio(false)} style={s.cancelBtn}>Cancel</button>
                <button onClick={handleSaveBio} disabled={saving} style={s.saveBtn}>{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </div>
          ) : (
            <p style={s.bio}>
              {profile.bio || (isMe ? <span style={{ color: 'var(--muted)' }}>Add a bio…</span> : '')}
              {isMe && <span style={s.editBioLink} onClick={() => setEditingBio(true)}> Edit</span>}
            </p>
          )}

          <div style={s.stats}>
            <span><strong>{posts.length}</strong> <span style={s.statLabel}>posts</span></span>
            <span style={s.statBtn} onClick={() => setModal('followers')}>
              <strong>{profile.followers.length}</strong> <span style={s.statLabel}>followers</span>
            </span>
            <span style={s.statBtn} onClick={() => setModal('following')}>
              <strong>{profile.following.length}</strong> <span style={s.statLabel}>following</span>
            </span>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div style={s.postsHeader}><span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Posts</span></div>
      {posts.length === 0
        ? <p style={s.empty}>No posts yet.</p>
        : posts.map((p) => <PostCard key={p._id} post={p} onDelete={onDelete} onUpdate={onUpdate} />)
      }
    </div>
  );
}

const s = {
  header: { padding: '1.25rem 1rem', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', gap: '1rem' },
  avatarLg: { width: 64, height: 64, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.5rem', flexShrink: 0 },
  info: { flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  nameRow: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  name: { fontWeight: 700, fontSize: '1.1rem' },
  handle: { color: 'var(--muted)', fontSize: '0.85rem' },
  bio: { fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text)' },
  bioEdit: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  bioActions: { display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' },
  cancelBtn: { background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: '0.8rem' },
  saveBtn: { background: 'var(--primary)', color: '#fff', fontSize: '0.8rem' },
  editBioLink: { color: 'var(--primary)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 },
  stats: { display: 'flex', gap: '1rem', marginTop: '0.25rem', fontSize: '0.88rem' },
  statLabel: { color: 'var(--muted)' },
  statBtn: { cursor: 'pointer', borderBottom: '1px dashed var(--border)' },
  followBtn: { background: 'var(--primary)', color: '#fff', fontSize: '0.82rem', padding: '0.3rem 0.9rem' },
  unfollowBtn: { background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)', fontSize: '0.82rem', padding: '0.3rem 0.9rem' },
  postsHeader: { padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', background: 'var(--surface)' },
  empty: { textAlign: 'center', color: 'var(--muted)', padding: '3rem 1rem', fontSize: '0.9rem' },
  // Modal
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  modal: { background: 'var(--surface)', borderRadius: 'var(--radius)', width: '100%', maxWidth: 380, maxHeight: '70vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'var(--surface)' },
  modalTitle: { fontWeight: 700, fontSize: '1rem' },
  closeBtn: { background: 'transparent', color: 'var(--muted)', fontSize: '1rem', padding: '0.2rem 0.4rem', border: 'none' },
  modalEmpty: { padding: '2rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.9rem' },
  userRow: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 1rem', borderBottom: '1px solid var(--border)', color: 'var(--text)' },
  rAvatar: { width: 38, height: 38, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 },
  rName: { fontWeight: 600, fontSize: '0.9rem' },
  rHandle: { color: 'var(--muted)', fontSize: '0.8rem' },
};
