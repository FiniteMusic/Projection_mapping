import { io } from "socket.io-client";

const baseUrl = "http://localhost:3000";

function testConnection(name, auth, shouldConnect) {
  return new Promise((resolve) => {
    const socket = io(baseUrl, {
      autoConnect: false,
      reconnection: false,
      timeout: 5000,
      auth
    });

    let finished = false;

    function finish(connected, detail) {
      if (finished) return;

      finished = true;
      socket.disconnect();

      const passed = connected === shouldConnect;

      console.log(
        `[${passed ? "PASS" : "FAIL"}] ${name}: ${detail}`
      );

      resolve(passed);
    }

    socket.on("connect", () => {
      finish(true, "Conexión autorizada");
    });

    socket.on("connect_error", (error) => {
      finish(false, error.message);
    });

    socket.connect();
  });
}

const [
  sessionId,
  controllerToken,
  playerToken
] = process.argv.slice(2);

if (!sessionId || !controllerToken || !playerToken) {
  console.error(
    "Uso: node test-socket-auth.mjs <sessionId> <controllerToken> <playerToken>"
  );

  process.exitCode = 1;
} else {
  const results = [];

  results.push(
    await testConnection(
      "Controlador autorizado",
      {
        role: "controller",
        sessionId,
        token: controllerToken
      },
      true
    )
  );

  results.push(
    await testConnection(
      "Reproductor autorizado",
      {
        role: "player",
        sessionId,
        token: playerToken
      },
      true
    )
  );

  results.push(
    await testConnection(
      "Token inválido",
      {
        role: "player",
        sessionId,
        token: "invalid-token"
      },
      false
    )
  );

  results.push(
    await testConnection(
      "Rol inválido",
      {
        role: "admin",
        sessionId,
        token: playerToken
      },
      false
    )
  );

  results.push(
    await testConnection(
      "Sesión incorrecta",
      {
        role: "player",
        sessionId: "00000000-0000-4000-8000-000000000000",
        token: playerToken
      },
      false
    )
  );

  console.log(
    `\nResultado: ${results.filter(Boolean).length}/${results.length} pruebas correctas`
  );

  if (results.some((result) => !result)) {
    process.exitCode = 1;
  }
}