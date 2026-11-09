
import { io } from "socket.io-client";

const [sessionId, playerToken] = process.argv.slice(2);

if (!sessionId || !playerToken) {
  console.error("INVALID_TEST_ARGUMENTS");
  process.exit(1);
}

const socket = io("http://localhost:3000", {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  randomizationFactor: 0.5,
  timeout: 5000,
  auth: {
    role: "player",
    sessionId,
    token: playerToken
  }
});

socket.on("connect", () => {
  console.log("[CONNECTED] Player connected");
  console.log("Socket ID:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("[ERROR]", error.message);
  socket.disconnect();
  process.exitCode = 1;
});

socket.on("disconnect", (reason) => {
  console.log("[DISCONNECTED]", reason);
});

process.on("SIGINT", () => {
  console.log("\n[TEST] Disconnecting player...");
  socket.disconnect();
  process.exit(0);
});

socket.connect();
