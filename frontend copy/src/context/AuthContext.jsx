import React, { createContext, useContext, useEffect, useState } from "react";
import api from '../utils/api';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!localStorage.getItem('chatterly_token')) { setLoading(false); return; }
    api.get('/auth/me').then(({ data }) => setUser(data.user)).catch(() => localStorage.removeItem('chatterly_token')).finally(() => setLoading(false));
  }, []);
  const authenticate = async (mode, payload) => {
    const { data } = await api.post(`/auth/${mode}`, payload);
    localStorage.setItem('chatterly_token', data.token);
    setUser(data.user);
    return data.user;
  };
  const logout = () => { localStorage.removeItem('chatterly_token'); setUser(null); };
  return <AuthContext.Provider value={{ user, loading, authenticate, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
