export type clientInfoType = {
    joinedAt: Date;
    ip: string;
    userName: string;
    room: string;
    color: string;
};
export type roomInfoType = {
    clients: string[];
    stackForUndo: {
        x: number;
        y: number;
    }[];
    stackForRedo: {
        x: number;
        y: number;
    }[];
};
//# sourceMappingURL=types.d.ts.map