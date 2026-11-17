
import { io } from "socket.io-client";

const baseUrl = "http://localhost:3000";

const [
  sessionId1,
  controllerToken,
  playerToken1,
  sessionId2,
  playerToken2
] = process.argv.slice(2);

if (
  !sessionId1 ||
  !controllerToken ||
  !playerToken1 ||
  !sessionId2 ||
  !playerToken2 ||
  sessionId1 === sessionId2
) {
  console.error("[FAIL] INVALID_TEST_ARGUMENTS");
  process.exit(1);
}

function connect(role, sessionId, token) {
  return new Promise((resolve, reject) => {
    const socket = io(baseUrl, {
      autoConnect: false,
      reconnection: false,
      timeout: 5000,
      auth: { role, sessionId, token }
    });

    const timer = setTimeout(() => {
      socket.disconnect();
      reject(new Error(`${role}: CONNECTION_TIMEOUT`));
    }, 7000);

    socket.once("connect", () => {
      clearTimeout(timer);
      resolve(socket);
    });

    socket.once("connect_error", (error) => {
      clearTimeout(timer);
      socket.disconnect();
      reject(error);
    });

    socket.connect();
  });
}

const sockets = [];

console.log("[TEST] Iniciando prueba de aislamiento");

try {
  console.log("[TEST] Conectando controlador...");

  const controller = await connect(
    "controller",
    sessionId1,
    controllerToken
  );
  sockets.push(controller);

  console.log("[TEST] Conectando reproductor 1...");

  const player1 = await connect(
    "player",
    sessionId1,
    playerToken1
  );
  sockets.push(player1);

  console.log("[TEST] Conectando reproductor 2...");

  const player2 = await connect(
    "player",
    sessionId2,
    playerToken2
  );
  sockets.push(player2);

  console.log("[TEST] Conexiones establecidas");

  const message = `isolation-test-${Date.now()}`;

  let receivedByPlayer1 = false;
  let receivedByPlayer2 = false;

  player1.on("session:test-message", (payload) => {
    if (payload?.message === message) {
      receivedByPlayer1 = true;
    }
  });

  player2.on("session:test-message", (payload) => {
    if (payload?.message === message) {
      receivedByPlayer2 = true;
    }
  });

  console.log("[TEST] Enviando mensaje...");

  controller.emit("session:test-message", { message });

  await new Promise((resolve) => setTimeout(resolve, 1500));

  const deliveryPassed = receivedByPlayer1;
  const isolationPassed = !receivedByPlayer2;

  console.log(
    `[${deliveryPassed ? "PASS" : "FAIL"}] ` +
    "Player 1 receives its session message"
  );

  console.log(
    `[${isolationPassed ? "PASS" : "FAIL"}] ` +
    "Player 2 does not receive another session message"
  );

  if (!deliveryPassed || !isolationPassed) {
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
