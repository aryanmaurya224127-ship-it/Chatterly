import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export default function socketHandler(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = await User.findById(decoded.id).select('_id name');
      if (!socket.user) return next(new Error('User not found'));
      next();
    } catch { next(new Error('Invalid socket token')); }
  });

  io.on('connection', async (socket) => {
    const userId = String(socket.user._id);
    socket.join(userId);
    await User.findByIdAndUpdate(userId, { isOnline: true });
    socket.emit('connected');
    socket.broadcast.emit('user_online', { userId });

    socket.on('setup', () => socket.emit('connected'));
    socket.on('join_chat', (roomId) => { if (roomId) socket.join(String(roomId)); });
    socket.on('leave_chat', (roomId) => { if (roomId) socket.leave(String(roomId)); });
    socket.on('typing', ({ roomId }) => socket.to(String(roomId)).emit('typing', { roomId, userId, name: socket.user.name }));
    socket.on('stop_typing', ({ roomId }) => socket.to(String(roomId)).emit('stop_typing', { roomId, userId }));
    socket.on('new_message', (message) => {
      if (!message?.chat?._id) return;
      socket.to(String(message.chat._id)).emit('message_received', message);
      for (const member of (message.chat.users || [])) {
        const id = String(member._id || member);
        if (id !== userId) socket.to(id).emit('message_notification', message);
      }
    });
    socket.on('message_read', ({ chatId, messageId }) => socket.to(String(chatId)).emit('message_read', { chatId, messageId, userId }));

    socket.on('disconnect', async () => {
      const sockets = await io.in(userId).fetchSockets();
      if (!sockets.length) {
        await User.findByIdAndUpdate(userId, { isOnline: false });
        socket.broadcast.emit('user_offline', { userId });
      }
    });
  });
}
