import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import { inspect } from "util";
import { addClient, removeClient, getClientsInRoom, addSocket, addRoom, getClient, removeRoom, removeSocket } from "./room.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const httpServer = http.createServer(app);
const io: Server = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// ESM doesn't define __dirname, derive it from import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "../../src/client")));

io.on("connection", (socket: Socket) => {
  console.log(`🟢 Socket connected: ${socket.id}`);
  addSocket(socket);

  socket.on("ping", (payload) => {
    console.log("Received ping:", inspect(payload));
    socket.emit("pong", { message: "Pong!", timestamp: new Date() });
  });

  // Join Room
  socket.on("joinRoom", ({ room }: { room: string }) => {
    socket.join(room);
    addRoom(room, socket.id);

    const ip = socket.handshake.address || "unknown";
    const color = `#${Math.floor(Math.random() * 16777216).toString(16)}`;

    addClient(socket.id, {
      joinedAt: new Date(),
      ip,
      userName: `User_${socket.id.substring(0, 5)}`,
      room,
      color,
    });

    const users = getClientsInRoom(room);

    socket.to(room).emit("changeInUsers", {
      userId: socket.id,
      message: `A new user has joined the room: ${room}`,
      users: users.map((userId) => ({
        userId,
        color: getClient(userId)?.color,
      })),
    });

    socket.emit("changeInUsers", {
      userId: socket.id,
      message: `You joined the room: ${room}`,
      users: users.map((userId) => ({
        userId,
        color: getClient(userId)?.color,
      })),
    });
  });

  // Stroke broadcasting
  socket.on("stroke", (data) => {
    socket.to(data.room).emit("stroke", data);
  });

  // Clear broadcasting
  socket.on("clear", (data) => {
    socket.to(data.room).emit("clear");
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log(`🔴 Socket disconnected: ${socket.id}`);
    const room = getClient(socket.id)?.room;

    if (room) {
      removeRoom(room, socket.id);
      const users = getClientsInRoom(room);
      socket.to(room).emit("changeInUsers", {
        userId: socket.id,
        message: `User has disconnected: ${socket.id}`,
        users: users.map((userId) => ({
          userId,
          color: getClient(userId)?.color,
        })),
      });
    }

    removeSocket(socket.id);
    removeClient(socket.id);
    if (room) socket.leave(room);
  });
});

httpServer.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
