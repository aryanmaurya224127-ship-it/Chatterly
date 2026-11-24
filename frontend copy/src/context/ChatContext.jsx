import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../utils/api';
const ChatContext = createContext(null);
export function ChatProvider({ children }) {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState('');
  const refreshChats = async () => { const { data } = await api.get('/chats'); setChats(data); };
  useEffect(() => {
    if (!user) { setChats([]); setActiveChat(null); setMessages([]); return; }
    refreshChats().catch(console.error);
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', { auth: { token: localStorage.getItem('chatterly_token') } });
    socketRef.current = socket;
    socket.on('user_online', ({ userId }) => setOnlineUsers(v => [...new Set([...v, userId])]));
    socket.on('user_offline', ({ userId }) => setOnlineUsers(v => v.filter(id => id !== userId)));
    socket.on('message_notification', () => refreshChats().catch(console.error));
    socket.on('message_received', message => {
      setMessages(current => current.some(m => m._id === message._id) ? current : [...current, message]);
      refreshChats().catch(console.error);
    });
    socket.on('typing', ({ roomId, name }) => { if (String(activeChat?._id) === String(roomId)) setTypingUser(name); });
    socket.on('stop_typing', ({ roomId }) => { if (String(activeChat?._id) === String(roomId)) setTypingUser(''); });
    return () => { socket.disconnect(); socketRef.current = null; };
  }, [user]);
  useEffect(() => {
    if (!activeChat) { setMessages([]); return; }
    const socket = socketRef.current;
    socket?.emit('join_chat', activeChat._id);
    api.get(`/messages/${activeChat._id}`).then(({ data }) => setMessages(data)).catch(console.error);
    return () => socket?.emit('leave_chat', activeChat._id);
  }, [activeChat?._id]);
  const sendMessage = async (content) => {
    const { data } = await api.post('/messages', { content, chatId: activeChat._id });
    setMessages(v => [...v, data]);
    socketRef.current?.emit('new_message', { ...data, chat: { _id: activeChat._id, users: activeChat.users } });
    refreshChats().catch(console.error);
    return data;
  };
  return <ChatContext.Provider value={{ chats, setChats, activeChat, setActiveChat, messages, sendMessage, refreshChats, socket: socketRef, onlineUsers, typingUser, setTypingUser }}>{children}</ChatContext.Provider>;
}
export const useChat = () => useContext(ChatContext);
