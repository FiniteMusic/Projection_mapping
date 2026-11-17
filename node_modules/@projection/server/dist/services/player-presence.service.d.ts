import type { Server } from "socket.io";
export declare function synchronizePlayerPresence(io: Server, sessionId: string): Promise<void>;
