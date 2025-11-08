const connectedClient = new Map(); // socketId -> {joinedAt, ip, userName, room};
export let addClient;
export let removeClient;
export let getClient;
export let getAllClients;
addClient = (socketId, clientInfo) => connectedClient.set(socketId, clientInfo);
removeClient = (socketId) => connectedClient.delete(socketId);
getClient = (socketId) => connectedClient.get(socketId);
getAllClients = () => Array.from(connectedClient.values());
export let addSocket;
export let removeSocket;
let allSockets = [];
addSocket = (socket) => allSockets.push(socket);
removeSocket = (id) => allSockets = allSockets.filter((s) => s.id !== id);
let allRooms = new Map();
export let addRoom;
export let removeRoom;
export let getRoom;
export let getClientsInRoom;
addRoom = (roomName, clientId) => {
    const existing = allRooms.get(roomName);
    if (existing) {
        existing.clients.push(clientId);
    }
    else {
        allRooms.set(roomName, { clients: [clientId], stackForUndo: [], stackForRedo: [] });
    }
};
removeRoom = (roomName, clientId) => {
    const room = allRooms.get(roomName);
    if (room) {
        room.clients = room.clients.filter(id => id !== clientId);
        if (room.clients.length === 0)
            allRooms.delete(roomName);
    }
};
getClientsInRoom = (roomName) => {
    const room = allRooms.get(roomName);
    if (room) {
        return room.clients;
    }
    return [];
};
//# sourceMappingURL=room.js.map