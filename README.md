# WhatsApp Clone

A full-stack real-time chat application built with Next.js, Express, MongoDB, and Socket.io — styled to match WhatsApp Web.

## Features

- 🔐 JWT authentication (register / login / logout)
- 💬 Real-time messaging via Socket.io
- ✍️ Typing indicators
- 🟢 Online / offline presence
- ✅ Message status (sent, delivered, read ticks)
- 🔍 User search to start new conversations
- 📱 Responsive layout (mobile + desktop)
- 🎨 WhatsApp Web dark theme

## Tech Stack

| Layer    | Tech                          |
|----------|-------------------------------|
| Frontend | Next.js 16, Tailwind CSS 4    |
| Backend  | Express 5, Node.js            |
| Database | MongoDB + Mongoose            |
| Realtime | Socket.io                     |
| Auth     | JWT + bcryptjs                |

## Project Structure

```
├── backend/          # Express API + Socket.io server
│   ├── src/
│   │   ├── config/   # MongoDB connection
│   │   ├── controller/
│   │   ├── middleware/
│   │   ├── model/
│   │   └── routes/
│   └── index.js
│
└── frontend/         # Next.js app
    └── src/
        ├── app/      # Pages (login, register, chat)
        ├── components/
        ├── context/  # Auth context
        └── lib/      # API client + Socket singleton
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas URI)

### Backend

```bash
cd backend
npm install
# Edit .env with your values (see .env.example)
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

### backend/.env
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/whatsapp-clone
JWT_SECRET=your_secret_key_here
CLIENT_URL=http://localhost:3000
```

### frontend/.env.local
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```
