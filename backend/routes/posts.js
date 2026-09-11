const router = require('express').Router();
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');

const populate = { path: 'author', select: 'name username' };

// GET /api/posts/feed — posts from followed users + own posts
router.get('/feed', auth, async (req, res) => {
  try {
    const me = await User.findById(req.userId).select('following');
    const ids = [...me.following, req.userId];
    const posts = await Post.find({ author: { $in: ids } })
      .populate(populate)
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/posts/explore — all posts
router.get('/explore', auth, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate(populate)
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/posts/user/:username — posts by a user
router.get('/user/:username', auth, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('_id');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const posts = await Post.find({ author: user._id })
      .populate(populate)
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/posts
router.post('/', auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: 'Content required' });
    const post = await Post.create({ author: req.userId, content });
    await post.populate(populate);
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/posts/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, author: req.userId });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    post.content = req.body.content ?? post.content;
    await post.save();
    await post.populate(populate);
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/posts/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.id, author: req.userId });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/posts/:id/like — toggle like
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const idx = post.likes.indexOf(req.userId);
    if (idx === -1) post.likes.push(req.userId);
    else post.likes.splice(idx, 1);
    await post.save();
    res.json({ likes: post.likes.length, liked: idx === -1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
