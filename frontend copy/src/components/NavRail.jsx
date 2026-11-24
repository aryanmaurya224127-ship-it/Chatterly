import React from "react";
import { useAuth } from '../context/AuthContext';

export default function NavRail({ activeSection, onSectionChange }) {
  const { user, logout } = useAuth();
  const items = [
    { id: 'chats', icon: '▣', label: 'Chats' },
    { id: 'groups', icon: '♟', label: 'Groups' },
  ];
  return <aside className="nav-rail">
    <div className="rail-brand" title="Chatterly"><span className="rail-brand-icon">●</span></div>
    <nav className="rail-nav" aria-label="Main navigation">
      {items.map(item => <button key={item.id} className={`rail-item ${activeSection === item.id ? 'selected' : ''}`} onClick={() => onSectionChange(item.id)} title={item.label}>
        <span className="rail-icon">{item.icon}</span><span>{item.label}</span>
      </button>)}
    </nav>
    <div className="rail-bottom">
      <div className="rail-promo"><strong>Stay Connected<br/>Always!</strong><span>🚀</span><i/></div>
      <button className="rail-user" title={`${user?.name || 'Profile'} · Log out`} onClick={logout}>
        <span className="rail-user-avatar">{user?.name?.[0] || 'U'}</span>
        <span className="rail-user-copy"><strong>{user?.name || 'My profile'}</strong><small><i/> Online</small></span>
        <span className="rail-chevron">⌄</span>
      </button>
    </div>
  </aside>;
}
