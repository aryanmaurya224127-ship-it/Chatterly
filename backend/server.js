
import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import socketHandler from './socket/socketHandler.js';

if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error('MONGO_URI and JWT_SECRET must be set in backend/.env');
  process.exit(1);
}

await connectDB();

const app = express();
const server = http.createServer(app);

// Allowed frontend origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.CLIENT_URL
].filter(Boolean);

// CORS configuration
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '1mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'Chatterly API'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/settings', settingsRoutes);

// Error handling
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({
    message: 'Internal server error'
  });
});

// Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

socketHandler(io);

// Start server
const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Chatterly server running on port ${PORT}`);
});
