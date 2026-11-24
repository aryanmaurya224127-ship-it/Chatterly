import Chat from '../models/Chat.js';
import Message from '../models/Message.js';

export async function getMessages(req, res) {
  try {
    const chat = await Chat.findOne({ _id: req.params.chatId, users: req.user._id });
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    const messages = await Message.find({ chat: chat._id }).populate('sender', 'name email avatar').populate('readBy', 'name').sort({ createdAt: 1 });
    await Message.updateMany({ chat: chat._id, sender: { $ne: req.user._id }, readBy: { $ne: req.user._id } }, { $addToSet: { readBy: req.user._id } });
    res.json(messages);
  } catch (error) { res.status(500).json({ message: error.message }); }
}

export async function sendMessage(req, res) {
  try {
    const { content, chatId } = req.body;
    if (!content?.trim() || !chatId) return res.status(400).json({ message: 'Message content and chatId are required' });
    const chat = await Chat.findOne({ _id: chatId, users: req.user._id });
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    let message = await Message.create({ sender: req.user._id, content: content.trim(), chat: chatId, readBy: [req.user._id] });
    message = await message.populate('sender', 'name email avatar');
    message = await message.populate('readBy', 'name');
    chat.latestMessage = message._id;
    await chat.save();
    res.status(201).json(message);
  } catch (error) { res.status(500).json({ message: error.message }); }
}
