import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  chatName: { type: String, trim: true, default: '' },
  isGroupChat: { type: Boolean, default: false },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
  groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

export default mongoose.model('Chat', chatSchema);
