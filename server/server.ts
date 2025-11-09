import express from "express";
import http from "http";
import { Server } from "socket.io";
import { onDraw, onJoinRoom, type UserInfo, onClear, onDrawComplete, onUndo, onRedo, leaveRoom } from "./rooms.js";

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {origin: "*"}
});

app.use(express.static("public"));

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

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


httpServer.listen(3000, () => {
    console.log("Server is running on port 3000");
});