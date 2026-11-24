import Chat from '../models/Chat.js';
import User from '../models/User.js';

const populateChat = (query) => query.populate('users', '-password').populate('groupAdmin', '-password').populate({ path: 'latestMessage', populate: { path: 'sender', select: 'name email avatar' } });

export async function fetchChats(req, res) {
  try {
    const chats = await populateChat(Chat.find({ users: req.user._id }).sort({ updatedAt: -1 }));
    res.json(chats);
  } catch (error) { res.status(500).json({ message: error.message }); }
}

export async function accessChat(req, res) {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId is required' });
    const existing = await Chat.findOne({ isGroupChat: false, users: { $all: [req.user._id, userId], $size: 2 } });
    if (existing) return res.json(await populateChat(Chat.findById(existing._id)));
    const target = await User.findById(userId);
    if (!target) return res.status(404).json({ message: 'User not found' });
    const chat = await Chat.create({ users: [req.user._id, userId] });
    res.status(201).json(await populateChat(Chat.findById(chat._id)));
  } catch (error) { res.status(500).json({ message: error.message }); }
}

export async function createGroup(req, res) {
  try {
    const { name, users } = req.body;
    const memberIds = [...new Set([...(users || []), String(req.user._id)])];
    if (!name?.trim() || memberIds.length < 3) return res.status(400).json({ message: 'Group name and at least two other members are required' });
    const validUsers = await User.countDocuments({ _id: { $in: memberIds } });
    if (validUsers !== memberIds.length) return res.status(400).json({ message: 'One or more users are invalid' });
    const chat = await Chat.create({ chatName: name.trim(), users: memberIds, isGroupChat: true, groupAdmin: req.user._id });
    res.status(201).json(await populateChat(Chat.findById(chat._id)));
  } catch (error) { res.status(500).json({ message: error.message }); }
}
