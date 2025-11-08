
import express from "express";
import { Server } from "socket.io";
import http, { get } from "http";
import { inspect } from "util";
import { addSocket, removeSocket, addClient, addRoom, removeRoom, getRoom, getClient, removeClient, getClientsInRoom} from "./socket.io.js";

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("Socket connected: " + socket.id);

  addSocket(socket);

  socket.on("ping", (payload) => {
    console.log("Received ping from " + socket.id + ": " + inspect(payload));
    socket.emit("pong", { message: "Pong!", timestamp: new Date() });
  })

  // Join Room
  socket.on("joinRoom", ({ room }) => {
    socket.join(room);

    addRoom(room, socket.id);

    const ip = socket.handshake.address || "unknown";
    const color = `#${Math.floor(Math.random()*16777216).toString(16)}`;

    addClient(socket.id, { joinedAt: new Date(), ip, userName: `User_${socket.id.substring(0, 5)}`, room, color });

    const users = Array.from(getClientsInRoom(room) || []);

    socket.to(room).emit("changeInUsers", { 
      userId: socket.id, 
      message: `A new user has joined the room: ${room}`, 
      users: users.map(user => ({
        user,
        color: getClient(user)?.color
      }))
    });

    socket.emit("changeInUsers", { 
      userId: socket.id, 
      message: `You joined the room: ${room}`, 
      users: users.map(user => ({
        user,
        color: getClient(user)?.color
      }))
    });

  });

  // Stroke broadcasting in the room
  socket.on("stroke", (data) => {
    console.log("Received stroke from " + socket.id + ": " + JSON.stringify(data));
    socket.to(data.room).emit("stroke", data);
  })

  // Clear broadcasting in the room
  socket.on("clear", (data) => {
    socket.to(data.room).emit("clear");
  })

  socket.on("disconnect", () => {
    console.log("Socket disconnected: " + socket.id);

    const room = getClient(socket.id)?.room;
    
    if(room) {
      removeRoom(room, socket.id);
      const users = Array.from(getClientsInRoom(room) || []);
      socket.to(room)
      .emit("changeInUsers", { 
        userId: socket.id, 
        message: `User has disconnected: ${socket.id}`, 
        users:  users.map(user => ({
          user,
          color: getClient(user)?.color
        }))
      });
    }
  
    removeSocket(socket.id);
    removeClient(socket.id);

    socket.leave(room);

  });

});

httpServer.listen(3000, () => {
  console.log("Server is running on port 3000");
});