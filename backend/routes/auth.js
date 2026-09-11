const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const safe = (user) => ({
  _id: user._id,
  name: user.name,
  username: user.username,
  email: user.email,
  bio: user.bio,
  followers: user.followers,
  following: user.following,
});

router.post('/register', async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    if (!name || !username || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });
    if (await User.findOne({ $or: [{ email }, { username }] }))
      return res.status(409).json({ message: 'Email or username already taken' });
    const user = await User.create({ name, username, email, password });
    res.status(201).json({ token: sign(user._id), user: safe(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ token: sign(user._id), user: safe(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
