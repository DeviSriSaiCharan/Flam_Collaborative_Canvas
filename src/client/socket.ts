import { io, Socket } from "socket.io-client";


export const initSocket = (room: string): Socket => {
    const socket: Socket = io();

    socket.on("connect", () => {
        console.log(`Connected to room: ${room} with id: ${socket.id}`);
        socket.emit("joinRoom", { room });
    });
    return socket;
}

