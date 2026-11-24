import React, { useEffect, useState } from "react";
import api from '../utils/api';
import { useChat } from '../context/ChatContext';
export default function GroupModal({ onClose }) {
  const [name, setName] = useState(''); const [users, setUsers] = useState([]); const [selected, setSelected] = useState([]);
  const { setActiveChat, refreshChats } = useChat();
  useEffect(() => { api.get('/auth/users').then(({ data }) => setUsers(data)).catch(console.error); }, []);
  const create = async (e) => { e.preventDefault(); try { const { data } = await api.post('/chats/group', { name, users: selected }); await refreshChats(); setActiveChat(data); onClose(); } catch (err) { alert(err.response?.data?.message || 'Could not create group'); } };
  return <div className="modal-backdrop" onClick={onClose}><form className="modal-card" onSubmit={create} onClick={e => e.stopPropagation()}><div className="modal-title"><h2>Create a group</h2><button type="button" className="icon-btn" onClick={onClose}>✕</button></div><input value={name} onChange={e => setName(e.target.value)} placeholder="Group name" required/><p className="muted">Select at least two people</p><div className="member-list">{users.map(u => <label key={u._id} className="member-option"><input type="checkbox" checked={selected.includes(u._id)} onChange={e => setSelected(v => e.target.checked ? [...v,u._id] : v.filter(id => id !== u._id))}/><span className="avatar">{u.name[0]}</span>{u.name}</label>)}</div><button className="primary-btn" disabled={!name.trim() || selected.length < 2}>Create group</button></form></div>;
}
