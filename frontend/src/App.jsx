import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { SettingsProvider } from './context/SettingsContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ChatPage from './pages/ChatPage';
function Guard({children}){const {user,loading}=useAuth();if(loading)return <div className="loading-screen"><div className="brand-mark">c.</div><p>Getting your chats ready...</p></div>;return user?children:<Navigate to="/login" replace/>}
function PublicOnly({children}){const {user,loading}=useAuth();if(loading)return null;return user?<Navigate to="/" replace/>:children}
function AppRoutes(){return <SettingsProvider><ChatProvider><Routes><Route path="/login" element={<PublicOnly><Login/></PublicOnly>}/><Route path="/register" element={<PublicOnly><Register/></PublicOnly>}/><Route path="/" element={<Guard><ChatPage/></Guard>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes></ChatProvider></SettingsProvider>}
export default function App(){return <BrowserRouter><AuthProvider><AppRoutes/></AuthProvider></BrowserRouter>}
