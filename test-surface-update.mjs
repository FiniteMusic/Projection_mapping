
import { io } from "socket.io-client";

const serverUrl = "http://localhost:3000";

const sessionId = "6d1689e7-6c24-4a5f-8dd4-9549b4712399";
const surfaceId = "f1da47f2-9a2c-4bbe-9230-50975233bd3e";

const token = process.env.CONTROLLER_TOKEN;

if (!token) {
  console.error("Missing CONTROLLER_TOKEN");
  process.exit(1);
}

const originalCorners = [
  { x: 0.1, y: 0.1 },
  { x: 0.9, y: 0.15 },
  { x: 0.85, y: 0.9 },
  { x: 0.15, y: 0.85 }
];

const modifiedCorners = [
  { x: 0.25, y: 0.2 },
  { x: 0.9, y: 0.15 },
  { x: 0.85, y: 0.9 },
  { x: 0.15, y: 0.85 }
];

const socket = io(serverUrl, {
  autoConnect: false,
  reconnection: false,
  timeout: 5000,
  auth: {
    token,
    role: "controller",
    sessionId
  }
});

function updateSurface(corners) {
  return socket.timeout(5000).emitWithAck("surface:update", {
    sessionId,
    surfaceId,
    changes: {
      corners
    }
  });
}

const delay = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function runTest() {
  console.log("[TEST] Controller connected");

  try {
    console.log("[TEST] Updating surface coordinates...");

    const result = await updateSurface(modifiedCorners);

    if (!result?.ok) {
      throw new Error(
        `Surface update rejected: ${JSON.stringify(result)}`
      );
    }

    console.log("[TEST] Surface update accepted");

    await delay(5000);

    console.log("[TEST] Restoring original coordinates...");

    const restored = await updateSurface(originalCorners);

    if (!restored?.ok) {
      throw new Error(
        `Surface restoration rejected: ${JSON.stringify(restored)}`
      );
    }

    console.log("[TEST] Original coordinates restored");
  } catch (error) {
    console.error("[TEST] Error:", error);
  } finally {
    socket.disconnect();
  }
}

socket.on("connect", () => {
  void runTest();
});

socket.on("connect_error", (error) => {
  console.error("[TEST] Connection rejected:", error.message);
  socket.disconnect();
});

socket.connect();
