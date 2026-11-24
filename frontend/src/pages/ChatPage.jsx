import React, { useState } from 'react';
import NavRail from '../components/NavRail';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import SettingsPage from './SettingsPage';

export default function ChatPage() {
  const [activeSection, setActiveSection] = useState('chats');
  return <div className={`app-shell ${activeSection === 'settings' ? 'settings-mode' : ''}`}>
    <NavRail activeSection={activeSection} onSectionChange={setActiveSection}/>
    {activeSection === 'settings' ? <SettingsPage/> : <>
    <Sidebar activeSection={activeSection}/>
    <ChatArea/>
    </>}
  </div>;
}
