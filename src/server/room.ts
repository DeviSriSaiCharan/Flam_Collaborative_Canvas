import type { Socket } from "socket.io";
import type { clientInfoType, roomInfoType } from "../common/types.ts";


const connectedClient: Map<string, clientInfoType> = new Map();  // socketId -> {joinedAt, ip, userName, room};

export let addClient: (socketId: string, clientInfo: clientInfoType) => void
export let removeClient: (socketId: string) => void
export let getClient: (socketId: string) => clientInfoType | undefined
export let getAllClients: () => clientInfoType[]

addClient = (socketId: string, clientInfo: clientInfoType) => connectedClient.set(socketId, clientInfo);

removeClient = (socketId: string) => connectedClient.delete(socketId);

getClient = (socketId: string) => connectedClient.get(socketId);

getAllClients = () => Array.from(connectedClient.values());




export let addSocket: (socket: Socket) => void
export let removeSocket: (id: string) => void

let allSockets: Socket[] = [];

addSocket = (socket: Socket) => allSockets.push(socket);

removeSocket = (id: string) => allSockets = allSockets.filter((s) => s.id !== id);



let allRooms: Map<string, roomInfoType> = new Map();

export let addRoom: (roomName: string, clientid: string) => void
export let removeRoom: (roomName: string, clientId: string) => void
export let getRoom: (roomName: string) => roomInfoType | undefined
export let getClientsInRoom: (roomName: string) => string[]


addRoom = (roomName: string, clientId: string) => {
    const existing = allRooms.get(roomName);
    if(existing) {
        existing.clients.push(clientId);
    } else {
        allRooms.set(roomName, { clients: [clientId], stackForUndo: [], stackForRedo: [] });
    }
};

removeRoom = (roomName: string, clientId: string) => {
    const room = allRooms.get(roomName);
    if(room) {
        room.clients = room.clients.filter(id => id !== clientId);
        if(room.clients.length === 0) allRooms.delete(roomName);
    }
};


getClientsInRoom = (roomName: string) => {
    const room = allRooms.get(roomName);
    if(room) {
        return room.clients;
    }
    return [];
};

