
const connectedClient = new Map();  // socketId -> {joinedAt, ip, userName, room};

export const addClient = (socketId, clientInfo) => connectedClient.set(socketId, clientInfo);

export const removeClient = (socketId) => connectedClient.delete(socketId);

export const getClient = (socketId) => connectedClient.get(socketId);

export const getAllClients = () => Array.from(connectedClient.values());




let allSockets = [];

export const addSocket = (socket) => allSockets.push(socket);

export const removeSocket = (id) => allSockets = allSockets.filter((s) => s.id !== id);


let allRooms = new Map(); // roomName -> {clients: Array of clients in that room, stackForUndo: Array of {x, y} positions, stackForRedo: Array of {x, y} positions}

export const addRoom = (roomName, clientId) => {
    if(allRooms.has(roomName)) {
        allRooms.get(roomName).clients.push(clientId);
    } else {
        allRooms.set(roomName, { clients: [clientId], stackForUndo: [], stackForRedo: [] });
    }
};

export const removeRoom = (roomName, clientId) => {
    if(allRooms.has(roomName)) {
        allRooms.get(roomName).clients = allRooms.get(roomName).clients.filter(id => id !== clientId);
    }
    if(allRooms.get(roomName).clients.length === 0) allRooms.delete(roomName);
};

export const getRoom = (roomName) => allRooms.get(roomName);

export const getClientsInRoom = (roomName) => {
    if(allRooms.has(roomName)) {
        return allRooms.get(roomName).clients;
    }
    return [];
};
