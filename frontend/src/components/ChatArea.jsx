import React, { useEffect, useRef, useState } from "react";
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import MessageBubble from './MessageBubble';
import TypingDots from './TypingDots';
export default function ChatArea() {
  const { user }=useAuth();
   const { activeChat,messages,sendMessage,socket,typingUser,onlineUsers }=useChat();
  const [text,setText]=useState('');
   const bottom=useRef(null); 
   const timer=useRef(null);
  useEffect(() => {
    if (bottom.current) {
        bottom.current.scrollIntoView({
            behavior: "smooth"
        });
    }
}, [messages, typingUser]);
  if(!activeChat)
     return <main className="chat-empty">
      <div className="empty-art">✳</div>
      <h1>Your conversations, <em>closer.</em></h1>
      <p>Choose a chat from the sidebar or search for someone new.</p>
      <span className="encryption-note">✦ A little space for your everyday conversations</span>
      </main>;
  const other=activeChat.users.find(u=>u._id!==user?._id);
  const title=activeChat.isGroupChat?activeChat.chatName:other?.name||'Conversation';
  const submit=async e=>{e.preventDefault();
    if(!text.trim())return;
    const value=text;setText('');
    socket.current?.emit('stop_typing',{roomId:activeChat._id});
    clearTimeout(timer.current);
    try{await sendMessage(value);
    }
    catch{setText(value);

    }};
  const typing=e=>{setText(e.target.value);
    if(!activeChat)return;
    socket.current?.emit('typing',{roomId:activeChat._id});
    clearTimeout(timer.current);
    timer.current=setTimeout(()=>socket.current?.emit('stop_typing',{roomId:activeChat._id}),1200);
  };
  return <main className="chat-area">
    <header className="chat-header">
      <div className="chat-person">
        <span className="avatar large-avatar">{title[0]}</span>
        <div>
          <h2>{title}</h2>
          <small>
            {activeChat.isGroupChat?`${activeChat.users.length} members`:onlineUsers.includes(other?._id)?'● Online':'Offline'}
            </small>
            </div>
            </div>
            <div className="header-actions">
              <span className="secure-label">✦ Private space</span>
              </div>
              </header>
    <section className="messages">
      {messages.length === 0 ? 
      <div className="welcome-panel"><div className="welcome-bubbles"><div className="welcome-bubble blue">•••</div><div className="welcome-bubble purple">•••</div></div><h1>Welcome to <em>Chatterly!</em> 🚀</h1><p>Start a conversation with {title}</p></div> : <><div className="date-chip">MESSAGES</div>{messages.map(m=><MessageBubble key={m._id} message={m}/>)}<TypingDots name={typingUser}/></>}<div ref={bottom}/></section>
    <form className="composer" onSubmit={submit}><input value={text} onChange={typing} placeholder="Write a message..." maxLength={5000}/><button className="send-btn" disabled={!text.trim()} aria-label="Send message">➤</button></form><div className="composer-foot">Press Enter to send <span>Chatterly · made for meaningful conversations</span></div>
  </main>;
}
