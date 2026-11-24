import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import api from '../utils/api';

export const defaultPreferences = {
  appearance: { theme: 'dark', accentColor: '#6d5dfc', fontSize: 'medium', wallpaper: 'default' },
  notifications: { messages: true, groups: true, sound: true, desktop: false, previews: true },
  privacy: { lastSeen: 'everyone', onlineStatus: 'everyone', readReceipts: true },
  chat: { enterToSend: true, mediaAutoDownload: false, compactMode: false },
  general: { language: 'en' }
};
const SettingsContext = createContext(null);
const clone = value => JSON.parse(JSON.stringify(value));
const merge = (base, value) => Object.fromEntries(Object.keys(base).map(key => [key,
  base[key] && typeof base[key] === 'object' && !Array.isArray(base[key])
    ? merge(base[key], value?.[key] || {}) : (value?.[key] ?? base[key])
]));

export function SettingsProvider({ children }) {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [saving, setSaving] = useState(false);
  const storageKey = user?._id ? `chatterly_preferences_${user._id}` : null;

  useEffect(() => {
    if (!user || !storageKey) { setPreferences(defaultPreferences); return; }
    let active = true;
    setLoadingSettings(true);
    try {
      const cached = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (cached && active) setPreferences(merge(defaultPreferences, cached));
    } catch { localStorage.removeItem(storageKey); }
    api.get('/settings').then(({ data }) => {
      if (!active) return;
      const next = merge(defaultPreferences, data.user?.preferences);
      setPreferences(next);
      localStorage.setItem(storageKey, JSON.stringify(next));
    }).catch(error => console.error('Could not load settings:', error)).finally(() => active && setLoadingSettings(false));
    return () => { active = false; };
  }, [user?._id]);

  useEffect(() => {
    if (!user) return;
    const root = document.documentElement;
    root.dataset.theme = preferences.appearance.theme;
    root.style.setProperty('--user-accent', preferences.appearance.accentColor);
    root.dataset.fontSize = preferences.appearance.fontSize;
    root.dataset.wallpaper = preferences.appearance.wallpaper;
    root.dataset.compact = String(preferences.chat.compactMode);
  }, [user, preferences]);

  const updatePreference = useCallback(async (section, field, value) => {
    const next = clone(preferences);
    next[section][field] = value;
    setPreferences(next);
    if (storageKey) localStorage.setItem(storageKey, JSON.stringify(next));
    setSaving(true);
    try {
      const { data } = await api.put('/settings', { preferences: { [section]: { [field]: value } } });
      const synced = merge(defaultPreferences, data.preferences || next);
      setPreferences(synced);
      if (storageKey) localStorage.setItem(storageKey, JSON.stringify(synced));
    } catch (error) {
      console.error('Settings sync failed:', error);
      throw error;
    } finally { setSaving(false); }
  }, [preferences, storageKey]);

  const value = useMemo(() => ({ preferences, updatePreference, loadingSettings, saving }), [preferences, updatePreference, loadingSettings, saving]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used inside SettingsProvider');
  return context;
};
