import React, { useMemo, useState } from "react";
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import GroupModal from './GroupModal';
export default function Sidebar({ activeSection = 'chats' }) {
  const { user } = useAuth(); const { chats, activeChat, setActiveChat, refreshChats, onlineUsers } = useChat();
  const [query,setQuery]=useState(''); const [results,setResults]=useState([]); const [showGroup,setShowGroup]=useState(false);
  const search = async value => { setQuery(value); if (!value.trim()) { setResults([]); return; } try { const {data}=await api.get(`/auth/users?search=${encodeURIComponent(value)}`); setResults(data); } catch {} };
  const openUser = async u => { const {data}=await api.post('/chats',{userId:u._id}); await refreshChats(); setActiveChat(data); setResults([]); setQuery(''); };
  const title = chat => chat.isGroupChat ? chat.chatName : chat.users.find(u=>u._id!==user?._id)?.name || 'Chat';
  const visible = useMemo(()=>chats.filter(c=>(activeSection !== 'groups' || c.isGroupChat) && title(c).toLowerCase().includes(query.toLowerCase())),[chats,query,user,activeSection]);
  return <aside className="sidebar"><div className="sidebar-top"><div className="sidebar-heading"><span>{activeSection === 'groups' ? 'YOUR GROUPS' : 'MESSAGES'}</span><button className="compose-btn" title="Create group" onClick={()=>setShowGroup(true)}>＋</button></div>
    <div className="search-box"><span>⌕</span><input value={query} onChange={e=>search(e.target.value)} placeholder="Search chats..."/></div></div>
    {results.length>0 && <div className="search-results">{results.map(u=><button key={u._id} onClick={()=>openUser(u)}><span className="avatar">{u.name[0]}</span><span>{u.name}<small>{u.email}</small></span></button>)}</div>}
    <div className="chat-list">{visible.map(chat=>{const other=chat.users.find(u=>u._id!==user?._id);return <button key={chat._id} className={`chat-item ${activeChat?._id===chat._id?'active':''}`} onClick={()=>setActiveChat(chat)}><span className="avatar">{(chat.isGroupChat?chat.chatName:other?.name||'?')[0]}</span><span className="chat-item-copy"><strong>{title(chat)}</strong><small>{chat.latestMessage?.content||'Start a conversation'}</small></span><span className="chat-item-side">{!chat.isGroupChat && onlineUsers.includes(other?._id) && <i className="online-dot"/>}</span></button>})}{visible.length===0&&<p className="empty-hint">No conversations yet. Search for someone to say hello.</p>}</div>
    
    {showGroup&&<GroupModal onClose={()=>setShowGroup(false)}/>}</aside>;
}
