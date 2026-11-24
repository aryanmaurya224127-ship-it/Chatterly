# Chatterly — Real-time Chat Application

A full-stack starter implementation using React + Vite, Express, MongoDB/Mongoose, JWT, and Socket.IO.

## Requirements
- Node.js 18+ (Node 20 LTS recommended)
- MongoDB Atlas account or local MongoDB

## 1. Configure MongoDB and backend
1. Copy `backend/.env.example` to `backend/.env`.
2. Set `MONGO_URI` to your MongoDB connection string.
3. Set a long random `JWT_SECRET`.
4. Keep `CLIENT_URL=http://localhost:5173`.

```bash
cd backend
npm install
npm run dev
```

## 2. Start frontend (new terminal)
```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```
Open http://localhost:5173

## API overview
- `POST /api/auth/register` — create account
- `POST /api/auth/login` — login
- `GET /api/auth/me` — current user (Bearer token)
- `GET /api/auth/users?search=` — search users
- `GET /api/chats` — list current user's chats
- `POST /api/chats` — access/create direct chat (`{ "userId": "..." }`)
- `POST /api/chats/group` — create group (`{ "name": "...", "users": ["..."] }`)
- `GET /api/messages/:chatId` — fetch chat messages
- `POST /api/messages` — send (`{ "content": "...", "chatId": "..." }`)

## Socket.IO events
Client -> server: authenticated connection, `setup`, `join_chat`, `leave_chat`, `typing`, `stop_typing`, `new_message`, `message_read`.
Server -> client: `connected`, `user_online`, `user_offline`, `typing`, `stop_typing`, `message_received`, `message_notification`, `message_read`.

## Important notes
- Never commit `.env`; use `.env.example` as a template.
- Socket connections are JWT-authenticated. Do not trust a client-supplied user ID.
- This is a strong academic-project foundation, not a production-audited messenger. Add rate limiting, request validation, pagination, upload storage, robust unread/read receipt updates, and automated tests before public production use.
- `readBy` is updated when a chat is fetched. The UI currently shows a basic sent/read-style tick; full per-member read-receipt UI is a sensible next enhancement.


## Updated interface
The frontend now uses the Chatterly reference layout: a left navigation rail, a dedicated conversations panel, and a wide chat workspace with a blue-purple visual theme. The Groups navigation filters the conversation list to group chats. The compose button opens the existing create-group dialog. The interface adapts for narrower screens.



## Advanced Settings Dashboard

The authenticated app now includes a Settings area with profile editing, appearance preferences, notification preferences, privacy preferences, chat preferences, password changes, language preference, and local storage information. Preferences are cached per user in LocalStorage and synchronized with MongoDB through protected `/api/settings` endpoints.

Backend endpoints: `GET /api/settings`, `PUT /api/settings`, `PATCH /api/settings/profile`, and `PATCH /api/settings/password`. All require the existing Bearer JWT.

Some options are preference storage/UI only at this stage: privacy enforcement, full Hindi translation, media auto-download, browser push delivery, and cross-device session revocation require additional feature integration.
