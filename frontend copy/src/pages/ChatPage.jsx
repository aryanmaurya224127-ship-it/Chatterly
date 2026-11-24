import React, { useState } from "react";
import NavRail from '../components/NavRail';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';

export default function ChatPage() {
  const [activeSection, setActiveSection] = useState('chats');
  return <div className="app-shell">
    <NavRail activeSection={activeSection} onSectionChange={setActiveSection}/>
    <Sidebar activeSection={activeSection}/>
    <ChatArea/>
  </div>;
}
