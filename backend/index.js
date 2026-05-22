require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const connectDB = require("./src/config/db");

const authRoutes = require("./src/routes/auth.routes");
const userRoutes = require("./src/routes/user.routes");
const conversationRoutes = require("./src/routes/conversation.routes");

connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://whatsapp-psi-five.vercel.app",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://whatsapp-psi-five.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationRoutes);

// Track online users: userId -> socketId
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // User comes online
  socket.on("user:online", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("users:online", Array.from(onlineUsers.keys()));
    console.log(`User ${userId} is online`);
  });

  // Join a conversation room
  socket.on("conversation:join", (conversationId) => {
    socket.join(conversationId);
  });

  // Leave a conversation room
  socket.on("conversation:leave", (conversationId) => {
    socket.leave(conversationId);
  });

  // New message event
  socket.on("message:send", (data) => {
    // Broadcast to everyone in the conversation room except sender
    socket.to(data.conversationId).emit("message:receive", data);
  });

  // Typing indicator
  socket.on("typing:start", (data) => {
    socket.to(data.conversationId).emit("typing:start", data);
  });

  socket.on("typing:stop", (data) => {
    socket.to(data.conversationId).emit("typing:stop", data);
  });

  // Disconnect
  socket.on("disconnect", () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        io.emit("users:online", Array.from(onlineUsers.keys()));
        console.log(`User ${userId} went offline`);
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
