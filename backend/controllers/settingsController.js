import bcrypt from 'bcryptjs';
import User, { defaultPreferences } from '../models/User.js';

const publicSettingsUser = (user) => ({
  _id: user._id, name: user.name, email: user.email, avatar: user.avatar,
  customStatus: user.customStatus, preferences: user.preferences || defaultPreferences
});

const allowed = {
  appearance: ['theme', 'accentColor', 'fontSize', 'wallpaper'],
  notifications: ['messages', 'groups', 'sound', 'desktop', 'previews'],
  privacy: ['lastSeen', 'onlineStatus', 'readReceipts'],
  chat: ['enterToSend', 'mediaAutoDownload', 'compactMode'],
  general: ['language']
};

export async function getSettings(req, res) {
  res.json({ user: publicSettingsUser(req.user) });
}

export async function updateSettings(req, res) {
  const incoming = req.body?.preferences;
  if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) {
    return res.status(400).json({ message: 'A preferences object is required' });
  }
  const merged = structuredClone(req.user.preferences || defaultPreferences);
  for (const [section, fields] of Object.entries(allowed)) {
    if (!incoming[section] || typeof incoming[section] !== 'object' || Array.isArray(incoming[section])) continue;
    for (const field of fields) {
      if (Object.hasOwn(incoming[section], field)) merged[section][field] = incoming[section][field];
    }
  }
  const valid = merged.appearance.theme === 'light' || merged.appearance.theme === 'dark';
  if (!valid) return res.status(400).json({ message: 'Invalid theme value' });
  if (!['small', 'medium', 'large'].includes(merged.appearance.fontSize)) return res.status(400).json({ message: 'Invalid font size' });
  if (!['en', 'hi'].includes(merged.general.language)) return res.status(400).json({ message: 'Invalid language' });
  if (!/^#[0-9a-f]{6}$/i.test(merged.appearance.accentColor)) return res.status(400).json({ message: 'Invalid accent color' });
  if (!['default', 'plain', 'gradient'].includes(merged.appearance.wallpaper)) return res.status(400).json({ message: 'Invalid wallpaper' });
  for (const key of ['messages', 'groups', 'sound', 'desktop', 'previews']) { if (typeof merged.notifications[key] !== 'boolean') return res.status(400).json({ message: 'Invalid notification preference' }); }
  for (const key of ['readReceipts']) { if (typeof merged.privacy[key] !== 'boolean') return res.status(400).json({ message: 'Invalid privacy preference' }); }
  for (const key of ['enterToSend', 'mediaAutoDownload', 'compactMode']) { if (typeof merged.chat[key] !== 'boolean') return res.status(400).json({ message: 'Invalid chat preference' }); }
  if (!['everyone', 'contacts', 'nobody'].includes(merged.privacy.lastSeen) || !['everyone', 'contacts', 'nobody'].includes(merged.privacy.onlineStatus)) {
    return res.status(400).json({ message: 'Invalid privacy setting' });
  }
  req.user.preferences = merged;
  await req.user.save();
  res.json({ preferences: req.user.preferences, message: 'Settings saved' });
}

export async function updateProfile(req, res) {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : req.user.name;
  const customStatus = typeof req.body.customStatus === 'string' ? req.body.customStatus.trim() : req.user.customStatus;
  const avatar = typeof req.body.avatar === 'string' ? req.body.avatar.trim() : req.user.avatar;
  if (!name || name.length > 60) return res.status(400).json({ message: 'Name must be between 1 and 60 characters' });
  if (customStatus.length > 120) return res.status(400).json({ message: 'Status must be 120 characters or less' });
  if (avatar.length > 500 || (avatar && !/^https:\/\//i.test(avatar))) return res.status(400).json({ message: 'Avatar must be a valid HTTPS URL' });
  req.user.name = name;
  req.user.customStatus = customStatus;
  req.user.avatar = avatar;
  await req.user.save();
  res.json({ user: publicSettingsUser(req.user), message: 'Profile updated' });
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Both password fields are required' });
  if (String(newPassword).length < 8) return res.status(400).json({ message: 'New password must be at least 8 characters' });
  const account = await User.findById(req.user._id);
  if (!account || !(await bcrypt.compare(currentPassword, account.password))) return res.status(400).json({ message: 'Current password is incorrect' });
  account.password = await bcrypt.hash(newPassword, 12);
  await account.save();
  res.json({ message: 'Password changed successfully. Please sign in again on other devices.' });
}
