import type { Socket } from "socket.io";
export declare function authenticateSocket(socket: Socket, next: (error?: Error) => void): Promise<void>;
