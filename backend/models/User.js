import mongoose from 'mongoose';

const defaultPreferences = {
  appearance: { theme: 'dark', accentColor: '#6d5dfc', fontSize: 'medium', wallpaper: 'default' },
  notifications: { messages: true, groups: true, sound: true, desktop: false, previews: true },
  privacy: { lastSeen: 'everyone', onlineStatus: 'everyone', readReceipts: true },
  chat: { enterToSend: true, mediaAutoDownload: false, compactMode: false },
  general: { language: 'en' }
};

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 60 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  avatar: { type: String, default: '' },
  customStatus: { type: String, default: 'Hey! I am using Chatterly' },
  isOnline: { type: Boolean, default: false },
  preferences: { type: mongoose.Schema.Types.Mixed, default: () => structuredClone(defaultPreferences) }
}, { timestamps: true });

export { defaultPreferences };
export default mongoose.model('User', userSchema);
