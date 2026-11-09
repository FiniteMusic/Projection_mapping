
import "./style.css";
import {
  requestPairing,
  checkPairingStatus,
  type PlayerCredentials,
} from "./services/pairing.service";

import { connectPlayer,  disconnectPlayer } from "./services/socket.service";

import {
  savePlayerSession,
  loadPlayerSession,
  clearPlayerSession
} from "./services/session-storage.service";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Application root element not found");
}

app.innerHTML = `
  <main class="player">
    <section class="pairing">
      <span class="pairing__label">PROJECTION MAPPING</span>

      <h1>Vincular reproductor</h1>

      <p class="pairing__description">
        Introduce el siguiente código en tu controlador
        para vincular este dispositivo.
      </p>

      <div class="pairing__code" id="pairing-code">
        ------
      </div>

      <p class="pairing__status" id="pairing-status">
        Solicitando código de emparejamiento...
      </p>

      <button
        class="pairing__retry"
        id="pairing-retry"
        type="button"
        hidden
      >
        Reintentar
      </button>
    </section>
  </main>
`;

const codeElement = document.querySelector<HTMLElement>(
  "#pairing-code"
);

const statusElement = document.querySelector<HTMLElement>(
  "#pairing-status"
);

const retryButton = document.querySelector<HTMLButtonElement>(
  "#pairing-retry"
);


let pairingGeneration = 0;
let pollingTimeout: ReturnType<typeof setTimeout> | undefined;

const POLLING_INTERVAL_MS = 2000;

function stopPolling(): void {
  if (pollingTimeout !== undefined) {
    clearTimeout(pollingTimeout);
    pollingTimeout = undefined;
  }
}

function showPairingError(message: string): void {
  if (!statusElement || !retryButton) return;

  statusElement.textContent = message;
  retryButton.hidden = false;
}



function handlePairingConfirmed(
  credentials: PlayerCredentials,
  restored = false
): void {
  stopPolling();

  if (!statusElement || !codeElement) return;

  if (!restored) {
    savePlayerSession(credentials);
  }

  codeElement.textContent = "✓";
  statusElement.textContent = restored
    ? "Restaurando sesión del reproductor..."
    : "Emparejamiento confirmado. Conectando...";

  console.log("[Player] Session initialized", {
    sessionId: credentials.sessionId,
    restored
  });

 

connectPlayer(
  credentials,
  () => {
    statusElement.textContent =
      "Reproductor conectado al servidor.";
  },
  () => {
    statusElement.textContent =
      "Conexión perdida. Intentando reconectar...";
  },
  (message) => {
    statusElement.textContent =
      "Error de conexión con el servidor.";

    console.error("[Player] Connection error:", message);
  },
  () => {
    console.warn(
      "[Player] Authentication rejected. Resetting session."
    );

    disconnectPlayer();
    clearPlayerSession();

    void initializePairing();
  },
  () => {
    console.log(
      "[Player] Session ended. Resetting pairing."
    );

    disconnectPlayer();
    clearPlayerSession();

    void initializePairing();
  }
);


}



async function pollPairingStatus(
  pairingToken: string,
  generation: number
): Promise<void> {
  if (generation !== pairingGeneration) return;

  try {
    const result = await checkPairingStatus(pairingToken);

    if (generation !== pairingGeneration) return;

    if (result.status === "paired") {
      if (!result.credentials) {
        throw new Error("Missing player credentials");
      }

      handlePairingConfirmed(result.credentials);
      return;
    }

    if (result.status === "expired") {
      showPairingError(
        "El código ha expirado. Solicita uno nuevo."
      );
      return;
    }

    if (result.status !== "pending") {
      throw new Error("Unexpected pairing status");
    }

    pollingTimeout = setTimeout(() => {
      void pollPairingStatus(pairingToken, generation);
    }, POLLING_INTERVAL_MS);
  } catch (error) {
    if (generation !== pairingGeneration) return;

    console.error("[Player] Pairing status failed:", error);

    showPairingError(
      "No fue posible verificar el emparejamiento."
    );
  }
}

async function initializePairing(): Promise<void> {
  const generation = ++pairingGeneration;

  stopPolling();

  if (!codeElement || !statusElement || !retryButton) {
    return;
  }

  codeElement.textContent = "------";
  statusElement.textContent =
    "Solicitando código de emparejamiento...";

  retryButton.hidden = true;

  try {
    const pairing = await requestPairing();

    if (generation !== pairingGeneration) return;

    codeElement.textContent = pairing.pairingCode;
    statusElement.textContent =
      "Esperando confirmación del controlador...";

    void pollPairingStatus(
      pairing.pairingToken,
      generation
    );
  } catch (error) {
    if (generation !== pairingGeneration) return;

    console.error("[Player] Pairing request failed:", error);

    showPairingError(
      "No fue posible conectar con el servidor."
    );
  }
}

retryButton?.addEventListener("click", () => {
  void initializePairing();
});

const storedSession = loadPlayerSession();

if (storedSession) {
  handlePairingConfirmed(storedSession, true);
} else {
  void initializePairing();
}
