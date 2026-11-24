import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import api from '../utils/api';

const sections = [
  { id: 'profile', label: 'My Profile', icon: '◉', description: 'Your identity on Chatterly' },
  { id: 'appearance', label: 'Appearance', icon: '◐', description: 'Make Chatterly feel like yours' },
  { id: 'notifications', label: 'Notifications', icon: '♢', description: 'Choose what deserves your attention' },
  { id: 'privacy', label: 'Privacy', icon: '◇', description: 'Control what others can see' },
  { id: 'chat', label: 'Chat Preferences', icon: '▤', description: 'Tune your messaging experience' },
  { id: 'security', label: 'Security', icon: '⌑', description: 'Keep your account protected' },
  { id: 'general', label: 'Language & General', icon: '◎', description: 'Your app-wide preferences' },
  { id: 'storage', label: 'Data & Storage', icon: '▦', description: 'Understand local app data' }
];

function Toggle({ label, description, checked, onChange, disabled = false }) {
  return <div className="setting-row">
    <div className="setting-row-copy">
      <strong>{label}</strong>
      {description && <small>{description}</small>}
      </div>
      <button type="button" role="switch" aria-checked={checked} disabled={disabled} className={`setting-switch ${checked ? 'on' : ''}`} onClick={() => onChange(!checked)}><span/></button>
      </div>;
}
function SelectSetting({ label, description, value, options, onChange }) {
  return <label className="setting-row">
    <span className="setting-row-copy">
      <strong>{label}</strong>
      {description && <small>{description}</small>}
      </span>
      <select className="setting-select" value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>;
}

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { preferences, updatePreference, saving } = useSettings();
  const [active, setActive] = useState('profile');
  const [notice, setNotice] = useState('');
  const [profile, setProfile] = useState({ name: user?.name || '', customStatus: user?.customStatus || '', avatar: user?.avatar || '' });
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [busy, setBusy] = useState(false);
  const [storageBytes, setStorageBytes] = useState(0);
  const currentSection = useMemo(() => sections.find(s => s.id === active), [active]);

  useEffect(() => {
    setProfile({ name: user?.name || '', customStatus: user?.customStatus || '', avatar: user?.avatar || '' });
  }, [user]);
  useEffect(() => {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('chatterly_')) total += (key.length + (localStorage.getItem(key) || '').length) * 2;
    }
    setStorageBytes(total);
  }, [active, preferences]);

  const savePreference = async (section, field, value) => {
    setNotice('');
    try { await updatePreference(section, field, value); setNotice('Your preference has been saved.'); }
    catch { setNotice('Could not sync with the server. Your latest choice is cached on this device; please retry.'); }
  };
  const saveProfile = async e => {
    e.preventDefault(); setBusy(true); setNotice('');
    try { const { data } = await api.patch('/settings/profile', profile); updateUser(data.user); setNotice('Profile updated successfully.'); }
    catch (error) { setNotice(error.response?.data?.message || 'Could not update profile.'); }
    finally { setBusy(false); }
  };
  const savePassword = async e => {
    e.preventDefault(); setNotice('');
    if (password.newPassword !== password.confirmPassword) return setNotice('New password and confirmation do not match.');
    setBusy(true);
    try { const { data } = await api.patch('/settings/password', { currentPassword: password.currentPassword, newPassword: password.newPassword }); setNotice(data.message); setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' }); }
    catch (error) { setNotice(error.response?.data?.message || 'Could not change password.'); }
    finally { setBusy(false); }
  };
  const requestDesktopPermission = async value => {
    if (value && 'Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return setNotice('Browser notification permission was not granted.');
    }
    if (value && (!('Notification' in window) || Notification.permission !== 'granted')) return setNotice('Desktop notifications are not available or permission is blocked in this browser.');
    savePreference('notifications', 'desktop', value);
  };
  const p = preferences;

  return <main className="settings-page">
    <header className="settings-topbar"><div><div className="settings-eyebrow">PERSONAL WORKSPACE</div><h1>Settings</h1><p>Shape your Chatterly experience, one preference at a time.</p></div><div className="settings-save-state"><span className={`save-dot ${saving ? 'busy' : ''}`}/>{saving ? 'Saving…' : 'Synced preferences'}</div></header>
    <div className="settings-layout">
      <aside className="settings-menu"><div className="settings-menu-title">PREFERENCES</div>{sections.map(item => <button key={item.id} className={`settings-menu-item ${active === item.id ? 'active' : ''}`} onClick={() => { setActive(item.id); setNotice(''); }}><span className="settings-menu-icon">{item.icon}</span><span>{item.label}</span><span className="settings-menu-arrow">›</span></button>)}</aside>
      <section className="settings-content"><div className="settings-section-heading"><div><span className="settings-section-icon">{currentSection.icon}</span><div><h2>{currentSection.label}</h2><p>{currentSection.description}</p></div></div></div>
        {notice && <div className="settings-notice" role="status">{notice}</div>}
        {active === 'profile' && <form className="settings-card" onSubmit={saveProfile}><div className="profile-preview"><div className="profile-avatar-preview">{profile.avatar ? <img src={profile.avatar} alt="Profile" onError={e => { e.currentTarget.style.display = 'none'; }}/> : (profile.name?.[0] || 'U')}</div><div><strong>{profile.name || 'Your name'}</strong><small>{user?.email}</small></div></div><label className="settings-field">Display name<input value={profile.name} maxLength={60} onChange={e => setProfile(v => ({...v,name:e.target.value}))} required/></label><label className="settings-field">Custom status<input value={profile.customStatus} maxLength={120} onChange={e => setProfile(v => ({...v,customStatus:e.target.value}))} placeholder="What are you up to?"/></label><label className="settings-field">Avatar image URL<input type="url" value={profile.avatar} onChange={e => setProfile(v => ({...v,avatar:e.target.value}))} placeholder="https://…"/></label><label className="settings-field">Email address<input value={user?.email || ''} disabled/><small>Email changes are disabled until email verification is implemented.</small></label><button className="settings-primary-btn" disabled={busy}>{busy ? 'Saving…' : 'Save profile changes'}</button></form>}
        {active === 'appearance' && <div className="settings-card"><div className="settings-subtitle">THEME</div><SelectSetting label="Color theme" description="Choose a comfortable interface" value={p.appearance.theme} options={[{value:'dark',label:'Dark'},{value:'light',label:'Light'}]} onChange={v=>savePreference('appearance','theme',v)}/><div className="settings-row"><div className="setting-row-copy"><strong>Accent color</strong><small>Used for highlights and primary actions</small></div><div className="accent-picker">{['#6d5dfc','#3285ff','#16a085','#e87936','#e05283'].map(c=><button type="button" key={c} aria-label={`Set accent ${c}`} className={p.appearance.accentColor===c?'chosen':''} style={{'--swatch':c}} onClick={()=>savePreference('appearance','accentColor',c)}/>)}</div></div><SelectSetting label="Font size" value={p.appearance.fontSize} options={[{value:'small',label:'Small'},{value:'medium',label:'Medium'},{value:'large',label:'Large'}]} onChange={v=>savePreference('appearance','fontSize',v)}/><SelectSetting label="Chat wallpaper" value={p.appearance.wallpaper} options={[{value:'default',label:'Midnight dots'},{value:'plain',label:'Plain'},{value:'gradient',label:'Soft gradient'}]} onChange={v=>savePreference('appearance','wallpaper',v)}/><div className="settings-preview"><span>LIVE PREVIEW</span><div className="preview-message">Your conversations, your style.<small>Just now</small></div></div></div>}
        {active === 'notifications' && <div className="settings-card"><div className="settings-subtitle">WHAT TO NOTIFY</div><Toggle label="Direct messages" description="Alerts when someone messages you" checked={p.notifications.messages} onChange={v=>savePreference('notifications','messages',v)}/><Toggle label="Group messages" description="Alerts from your group conversations" checked={p.notifications.groups} onChange={v=>savePreference('notifications','groups',v)}/><Toggle label="Notification sounds" description="Play a sound for new message alerts" checked={p.notifications.sound} onChange={v=>savePreference('notifications','sound',v)}/><Toggle label="Desktop notifications" description="Show browser notifications while Chatterly is open" checked={p.notifications.desktop} onChange={requestDesktopPermission}/><Toggle label="Message previews" description="Show message text in notifications" checked={p.notifications.previews} onChange={v=>savePreference('notifications','previews',v)}/></div>}
        {active === 'privacy' && <div className="settings-card"><div className="settings-subtitle">VISIBILITY</div><SelectSetting label="Last seen" description="Who can see when you were last active" value={p.privacy.lastSeen} options={[{value:'everyone',label:'Everyone'},{value:'contacts',label:'Contacts'},{value:'nobody',label:'Nobody'}]} onChange={v=>savePreference('privacy','lastSeen',v)}/><SelectSetting label="Online status" description="Who can see when you are online" value={p.privacy.onlineStatus} options={[{value:'everyone',label:'Everyone'},{value:'contacts',label:'Contacts'},{value:'nobody',label:'Nobody'}]} onChange={v=>savePreference('privacy','onlineStatus',v)}/><Toggle label="Read receipts" description="Allow others to know when you have read messages" checked={p.privacy.readReceipts} onChange={v=>savePreference('privacy','readReceipts',v)}/><p className="settings-footnote">These privacy preferences are saved to your account. Enforcing visibility rules in presence and message APIs requires corresponding server-side feature integration.</p></div>}
        {active === 'chat' && <div className="settings-card"><div className="settings-subtitle">MESSAGING BEHAVIOUR</div><Toggle label="Enter to send" description="Press Enter to send a message instead of creating a new line" checked={p.chat.enterToSend} onChange={v=>savePreference('chat','enterToSend',v)}/><Toggle label="Auto-download media" description="Automatically download shared images and files (when media support is enabled)" checked={p.chat.mediaAutoDownload} onChange={v=>savePreference('chat','mediaAutoDownload',v)}/><Toggle label="Compact mode" description="Use tighter spacing in chat lists and message areas" checked={p.chat.compactMode} onChange={v=>savePreference('chat','compactMode',v)}/></div>}
        {active === 'security' && <form className="settings-card" onSubmit={savePassword}><div className="security-callout">🔒 Use a unique password with at least 8 characters. Your password is securely hashed before it is stored.</div><label className="settings-field">Current password<input type="password" autoComplete="current-password" value={password.currentPassword} onChange={e=>setPassword(v=>({...v,currentPassword:e.target.value}))} required/></label><label className="settings-field">New password<input type="password" autoComplete="new-password" minLength={8} value={password.newPassword} onChange={e=>setPassword(v=>({...v,newPassword:e.target.value}))} required/></label><label className="settings-field">Confirm new password<input type="password" autoComplete="new-password" value={password.confirmPassword} onChange={e=>setPassword(v=>({...v,confirmPassword:e.target.value}))} required/></label><button className="settings-primary-btn" disabled={busy}>{busy ? 'Updating…' : 'Update password'}</button><p className="settings-footnote">Changing your password does not currently revoke existing JWT sessions on other devices. Session management is not part of the current backend.</p></form>}
        {active === 'general' && <div className="settings-card"><SelectSetting label="Application language" description="Preferred language for supported interface text" value={p.general.language} options={[{value:'en',label:'English'},{value:'hi',label:'Hindi'}]} onChange={v=>savePreference('general','language',v)}/><p className="settings-footnote">The language preference is stored now. Full translation of every screen requires adding an application-wide translation layer.</p></div>}
        {active === 'storage' && <div className="settings-card"><div className="storage-stat"><span>Chatterly data cached in this browser</span><strong>{storageBytes < 1024 ? `${storageBytes} bytes` : `${(storageBytes/1024).toFixed(1)} KB`}</strong></div><div className="storage-bar"><span style={{width:`${Math.min(100,storageBytes/1024)}%`}}/></div><p className="settings-footnote">This estimate includes Chatterly LocalStorage keys only. It does not include MongoDB data or browser-managed cache.</p><button className="settings-secondary-btn" onClick={()=>{const key=`chatterly_preferences_${user?._id}`;localStorage.removeItem(key);setNotice('Local preference cache cleared. Reload or change a setting to sync it again from your account.');}}>Clear local preference cache</button></div>}
      </section>
    </div>
  </main>;
}
