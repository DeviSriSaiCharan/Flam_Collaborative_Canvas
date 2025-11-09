import express from "express";
import http from "http";
import { Server } from "socket.io";
import { onDraw, onJoinRoom, type UserInfo, onClear, onDrawComplete, onUndo, onRedo, leaveRoom } from "./rooms.js";
import geoip from "geoip-lite";

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {origin: "*"}
});

app.use(express.static("public"));

io.on("connection", (socket) => {
    const forwarded = socket.handshake.headers["x-forwarded-for"];
    const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded || socket.handshake.address;

    const geo = geoip.lookup(ip!);

    console.log("--------------------------------------------------");
    console.log(`🗺️  New user connected: ${socket.id}`);
    console.log(`🌍  IP: ${ip}`);
    console.log(`📍  Location: ${geo?.city}, ${geo?.region}, ${geo?.country}`);

    // Handle join room
    socket.on('joinRoom', ({room}) => (onJoinRoom(room, socket)) );

    socket.on('stroke', (data) => (onDraw(socket, data)) );

    socket.on('clear', ({room}) => (onClear(room, socket)));

    socket.on('drawComplete', (data) => (onDrawComplete(data.room, socket, {points: data.points}, data.color, data.lineWidth)));

    socket.on('undo', ({room}) => (onUndo(room, socket)));

    socket.on('redo', ({room}) => (onRedo(room, socket)));    

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        leaveRoom(socket);
    });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});