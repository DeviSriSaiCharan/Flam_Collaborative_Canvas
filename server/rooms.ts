import type { Socket } from "socket.io";

export type DataPoint = {
  x: number;
  y: number;
};


export type Stroke = {
  color: string;
  lineWidth: number;
  points: DataPoint[];
};

export type UserInfo = {
  id: string;
  color: string;
  ip: string;
  undoStack: Stroke[];
  redoStack: Stroke[];
};

export type RoomInfo = {
  roomId: string;
  users: UserInfo[];
};


const allUsers: Map<string, string> = new Map<string, string>();
const allRooms: Map<string, RoomInfo> = new Map();

function addUser(roomID: string, userID: string) {
  allUsers.set(userID, roomID);
}

function removeUser(userID: string) {
  allUsers.delete(userID);
}

function getUserRoom(userID: string): string {
  return allUsers.get(userID)!;
}

export function joinRoom(roomId: string, user: UserInfo): void {
  const room = allRooms.get(roomId);
  if (!room) {
    allRooms.set(roomId, { roomId, users: [user] });
  } else {
    room.users.push(user);
  }

  const roomAfter = allRooms.get(roomId);
  addUser(roomId, user.id);
}

export function leaveRoom(socket: Socket): void {
  const roomId = getUserRoom(socket.id);
  const room = allRooms.get(roomId);
  if (room) {
    room.users = room.users.filter((user) => user.id !== socket.id);
    removeUser(socket.id);

    onUserChange(roomId, socket);
    if (room.users.length === 0) {
      allRooms.delete(roomId);
    }

    socket.leave(roomId);
  }

}

export function getRoomUsers(roomId: string): UserInfo[] {
  return allRooms.get(roomId)?.users || [];
}

/* ---------- Socket Event Handlers ---------- */

export function onUserChange(roomId: string, socket: Socket): void {
    const users: UserInfo[] = getRoomUsers(roomId);
    socket.to(roomId).emit('changeInUsers', {
        userId: socket.id,
        users: users.map((u) => ({
            user: u.id,
            color: u.color,
        })),
    });

    socket.emit('changeInUsers', {
        userId: socket.id,
        users: users.map((u) => ({
            user: u.id,
            color: u.color,
        })),
    });
};

export function onJoinRoom(roomId: string, socket: Socket): void {
  socket.join(roomId);

  const color: string = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  const ip: string = socket.handshake.address;

  const user: UserInfo = {
    id: socket.id,
    color,
    ip,
    undoStack: [],
    redoStack: [],
  };

  joinRoom(roomId, user);

  onUserChange(roomId, socket);

  const allStrokes: Stroke[] = [];
  const room = allRooms.get(roomId);
  if (room) {
    room.users.forEach((user) => {
      allStrokes.push(...user.undoStack);
    });
  }

  socket.emit("newStrokes", { allStrokes });
}

export function onDraw(socket: Socket, data: unknown): void {
  const {room: roomId} = data as  {room : string};
  socket.to(roomId).emit("stroke", data);
}

export function onClear(roomId: string, socket: Socket): void {
  socket.to(roomId).emit("clear");
}


export function onDrawComplete(roomId: string, socket: Socket, data: { points: DataPoint[] }, color: string, lineWidth: number): void {
  const room = allRooms.get(roomId);
  if (!room) return;

  const client = room.users.find((user) => user.id === socket.id);
  if (!client) return;

  if(data.points.length === 0) return;

  client.undoStack.push({ color: color, lineWidth: lineWidth, points: [...data.points] });
  client.redoStack = [];
}

export function onUndo(roomId: string, socket: Socket) {
    const room = allRooms.get(roomId);

    if (!room) return;

    const client = room.users.find((user) => user.id === socket.id);
    if (!client) return;

    if (client.undoStack.length === 0) return;

    const lastStroke = client.undoStack.pop()!;
    client.redoStack.push(lastStroke);

    const allStrokes: Stroke[] = [];

    room.users.forEach((user) => {
        allStrokes.push(...user.undoStack);
    });

    socket.to(roomId).emit("newStrokes", { allStrokes });
    socket.emit("newStrokes", { allStrokes });
}


export function onRedo(roomId: string, socket: Socket) {
    const room = allRooms.get(roomId)!;
    const client = room.users.find((user) => user.id === socket.id)!;

    if (client.redoStack.length === 0) return;

    const redoStroke = client.redoStack.pop()!;
    client.undoStack.push(redoStroke);

    const allStrokes: Stroke[] = [];

    room.users.forEach((user) => {
        allStrokes.push(...user.undoStack);
    });

    socket.to(roomId).emit("newStrokes", { allStrokes });
    socket.emit("newStrokes", { allStrokes });
}

