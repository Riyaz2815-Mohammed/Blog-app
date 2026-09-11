const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

const safe = (u) => ({
  _id: u._id,
  name: u.name,
  username: u.username,
  bio: u.bio,
  followers: u.followers,
  following: u.following,
  createdAt: u.createdAt,
});

// GET /api/users/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'Not found' });
    res.json(safe(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/search?q=
router.get('/search', auth, async (req, res) => {
  try {
    const q = req.query.q?.trim();
    if (!q) return res.json([]);
    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } },
      ],
      _id: { $ne: req.userId },
    }).select('name username bio followers').limit(10);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/:username
router.get('/:username', auth, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate('followers', 'name username')
      .populate('following', 'name username');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(safe(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/me — update bio/name
router.put('/me', auth, async (req, res) => {
  try {
    const { name, bio } = req.body;
    const user = await User.findById(req.userId);
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    await user.save();
    res.json(safe(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/users/:username/follow — toggle follow
router.post('/:username/follow', auth, async (req, res) => {
  try {
    const target = await User.findOne({ username: req.params.username });
    if (!target) return res.status(404).json({ message: 'User not found' });
    if (target._id.toString() === req.userId)
      return res.status(400).json({ message: 'Cannot follow yourself' });

    const me = await User.findById(req.userId);
    const isFollowing = me.following.includes(target._id);

    if (isFollowing) {
      me.following.pull(target._id);
      target.followers.pull(me._id);
    } else {
      me.following.push(target._id);
      target.followers.push(me._id);
    }

    await Promise.all([me.save(), target.save()]);
    res.json({ following: !isFollowing, followersCount: target.followers.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
