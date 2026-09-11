const BASE = '/api';

const h = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

const ok = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

// Auth
export const register = (b) => fetch(`${BASE}/auth/register`, { method: 'POST', headers: h(), body: JSON.stringify(b) }).then(ok);
export const login = (b) => fetch(`${BASE}/auth/login`, { method: 'POST', headers: h(), body: JSON.stringify(b) }).then(ok);

// Posts
export const getFeed = (t) => fetch(`${BASE}/posts/feed`, { headers: h(t) }).then(ok);
export const getExplore = (t) => fetch(`${BASE}/posts/explore`, { headers: h(t) }).then(ok);
export const getUserPosts = (t, username) => fetch(`${BASE}/posts/user/${username}`, { headers: h(t) }).then(ok);
export const createPost = (t, b) => fetch(`${BASE}/posts`, { method: 'POST', headers: h(t), body: JSON.stringify(b) }).then(ok);
export const updatePost = (t, id, b) => fetch(`${BASE}/posts/${id}`, { method: 'PUT', headers: h(t), body: JSON.stringify(b) }).then(ok);
export const deletePost = (t, id) => fetch(`${BASE}/posts/${id}`, { method: 'DELETE', headers: h(t) }).then(ok);
export const likePost = (t, id) => fetch(`${BASE}/posts/${id}/like`, { method: 'POST', headers: h(t) }).then(ok);

// Users
export const getMe = (t) => fetch(`${BASE}/users/me`, { headers: h(t) }).then(ok);
export const getProfile = (t, username) => fetch(`${BASE}/users/${username}`, { headers: h(t) }).then(ok);
export const updateMe = (t, b) => fetch(`${BASE}/users/me`, { method: 'PUT', headers: h(t), body: JSON.stringify(b) }).then(ok);
export const followUser = (t, username) => fetch(`${BASE}/users/${username}/follow`, { method: 'POST', headers: h(t) }).then(ok);
export const searchUsers = (t, q) => fetch(`${BASE}/users/search?q=${encodeURIComponent(q)}`, { headers: h(t) }).then(ok);
