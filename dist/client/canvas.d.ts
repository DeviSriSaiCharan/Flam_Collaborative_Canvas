import type { Socket } from "socket.io-client";
export declare const initCanvas: (canvas: HTMLCanvasElement, socket: Socket, room: string, colorPickerEl: HTMLInputElement, widthSliderEl: HTMLInputElement, usersListEl: HTMLUListElement) => {
    clearCanvas: () => void;
    handleRemoteStroke: (data: any) => void;
    onUserChange: (users: {
        userId: string;
        color: string;
    }[]) => void;
};
//# sourceMappingURL=canvas.d.ts.map