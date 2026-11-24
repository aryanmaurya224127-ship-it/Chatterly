import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const makeToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const publicUser = (user) => ({ _id: user._id, name: user.name, email: user.email, avatar: user.avatar, customStatus: user.customStatus, isOnline: user.isOnline });

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: 'Name, email and password are required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    const normalizedEmail = email.toLowerCase().trim();
    if (await User.findOne({ email: normalizedEmail })) return res.status(409).json({ message: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 12);
    const avatar = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}`;
    const user = await User.create({ name: name.trim(), email: normalizedEmail, password: hashed, avatar });
    res.status(201).json({ user: publicUser(user), token: makeToken(user._id) });
  } catch (error) { res.status(500).json({ message: error.message }); }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(password || '', user.password))) return res.status(401).json({ message: 'Invalid email or password' });
    res.json({ user: publicUser(user), token: makeToken(user._id) });
  } catch (error) { res.status(500).json({ message: error.message }); }
}

export async function me(req, res) { res.json({ user: publicUser(req.user) }); }
export async function searchUsers(req, res) {
  const q = (req.query.search || '').trim();
  const users = await User.find({ _id: { $ne: req.user._id }, $or: [{ name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }] }).select('-password').limit(20);
  res.json(users);
}
