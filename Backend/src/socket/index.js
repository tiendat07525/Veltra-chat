import { Server } from "socket.io";
import http from "http";
import express from "express";
import { socketAuthMiddleware } from "../middlewares/socketMiddleware.js";
import { getUserConversationsForSocketIO } from "../controllers/conversationController.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

io.use(socketAuthMiddleware);

const onlineUsers = new Map();

const broadcastOnlineUsers = () => {
  const visibleUserIds = Array.from(onlineUsers.entries())
    .filter(([, session]) => session.showOnlineStatus)
    .map(([userId]) => userId);

  io.emit("online-users", visibleUserIds);
};

io.on("connection", async (socket) => {
  const user = socket.user;

  onlineUsers.set(user._id.toString(), {
    socketId: socket.id,
    showOnlineStatus: socket.handshake.auth?.showOnlineStatus !== false,
  });
  broadcastOnlineUsers();

  const conversationIds = await getUserConversationsForSocketIO(user._id);
  conversationIds.forEach((id) => {
    socket.join(id);
  });

  socket.on("join-conversation", (conversationId) => {
    socket.join(conversationId);
  });

  socket.on("online-visibility", (showOnlineStatus) => {
    const userId = user._id.toString();
    const session = onlineUsers.get(userId);

    if (!session) return;

    onlineUsers.set(userId, {
      ...session,
      showOnlineStatus: Boolean(showOnlineStatus),
    });
    broadcastOnlineUsers();
  });

  socket.join(user._id.toString());

  socket.on("disconnect", () => {
    onlineUsers.delete(user._id.toString());
    broadcastOnlineUsers();
  });
});

export { io, app, server };
