import type { Socket } from "socket.io";
import type { clientInfoType, roomInfoType } from "../common/types.ts";
export declare let addClient: (socketId: string, clientInfo: clientInfoType) => void;
export declare let removeClient: (socketId: string) => void;
export declare let getClient: (socketId: string) => clientInfoType | undefined;
export declare let getAllClients: () => clientInfoType[];
export declare let addSocket: (socket: Socket) => void;
export declare let removeSocket: (id: string) => void;
export declare let addRoom: (roomName: string, clientid: string) => void;
export declare let removeRoom: (roomName: string, clientId: string) => void;
export declare let getRoom: (roomName: string) => roomInfoType | undefined;
export declare let getClientsInRoom: (roomName: string) => string[];
//# sourceMappingURL=room.d.ts.map