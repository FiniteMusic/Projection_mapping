import { io } from "socket.io-client";

const baseUrl = "http://localhost:3000";

const [
  sessionId,
  controllerToken,
  playerToken
] = process.argv.slice(2);

if (!sessionId || !controllerToken || !playerToken) {
  console.error("Faltan credenciales de prueba");
  process.exit(1);
}

function connect(role, token) {
  return new Promise((resolve, reject) => {
    const socket = io(baseUrl, {
      autoConnect: false,
      reconnection: false,
      timeout: 5000,
      auth: { role, token, sessionId }
    });

    socket.once("connect", () => resolve(socket));

    socket.once("connect_error", (error) => {
      socket.disconnect();
      reject(error);
    });

    socket.connect();
  });
}

const sockets = [];

try {
  const controller = await connect(
    "controller",
    controllerToken
  );

  sockets.push(controller);

  const player = await connect(
    "player",
    playerToken
  );

  sockets.push(player);

  const received = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("MESSAGE_TIMEOUT"));
    }, 5000);

    player.once("session:test-message", (payload) => {
      clearTimeout(timeout);
      resolve(payload);
    });
  });

  controller.emit("session:test-message", {
    message: "Hello from Android"
  });

  const payload = await received;

  const messagePassed =
    payload.message === "Hello from Android";

  console.log(
    `[${messagePassed ? "PASS" : "FAIL"}] ` +
    "Controller -> Player"
  );

  const forbidden = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("FORBIDDEN_TIMEOUT"));
    }, 5000);

    player.once("session:test-error", (payload) => {
      clearTimeout(timeout);
      resolve(payload);
    });
  });

  player.emit("session:test-message", {
    message: "Unauthorized message"
  });

  const forbiddenResult = await forbidden;

  const forbiddenPassed =
    forbiddenResult.error === "FORBIDDEN";

  console.log(
    `[${forbiddenPassed ? "PASS" : "FAIL"}] ` +
    "Player cannot send controller messages"
  );

  if (!messagePassed || !forbiddenPassed) {
    process.exitCode = 1;
  }
} catch (error) {
  console.error("[FAIL]", error.message);
  process.exitCode = 1;
} finally {
  for (const socket of sockets) {
    socket.disconnect();
  }
}