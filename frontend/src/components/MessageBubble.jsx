import React from "react";
import { useAuth } from '../context/AuthContext';
export default function MessageBubble({ message }) {
  const { user } = useAuth();
  const mine = String(message.sender?._id) === String(user?._id);
  return <div className={`message-row ${mine ? 'mine' : ''}`}><div className={`bubble ${mine ? 'sent' : 'received'}`}>
    {!mine && <small className="sender-name">{message.sender?.name}</small>}
    <div>{message.content}</div><div className="message-meta">{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{mine && <span className="read-mark"> ✓</span>}</div>
  </div></div>;
}
