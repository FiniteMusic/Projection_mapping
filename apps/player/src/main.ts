
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

import { ProjectionRenderer } from "./rendering/renderer";
import { createTestScene, type TestScene } from "./rendering/scenes/test.scene";
import {
  createSurfaceScene,
  type SurfaceScene
} from "./rendering/scenes/surface.scene";


import type {
  SurfaceUpdatedPayload,
  SurfaceMediaUpdatePayload,
  SceneLoadPayload,
  MediaAsset
} from "@projection/shared";


import { fetchMediaBlob } from "./services/media.service";
import { createVideoResource } from "./services/video.service";

import * as THREE from "three";



const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Application root element not found");
}

app.innerHTML = `
  <main class="player">
  <section class="pairing" id="pairing-screen">
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
    <section
      class="projection"
      id="projection-screen"
      hidden
    >
      <div
        class="projection__canvas"
        id="projection-canvas"
      ></div>
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

const pairingScreen = document.querySelector<HTMLElement>(
  "#pairing-screen"
);

const projectionScreen = document.querySelector<HTMLElement>(
  "#projection-screen"
);

const projectionCanvas = document.querySelector<HTMLElement>(
  "#projection-canvas"
);

type RenderMode = "diagnostic" | "surface";

const RENDER_MODE: RenderMode = "surface";

let projectionRenderer: ProjectionRenderer | null = null;
let testScene: TestScene | null = null;
let surfaceScene: SurfaceScene | null = null;
let sceneGeneration = 0;



const surfaceMediaGenerations = new Map<string, number>();

function nextSurfaceMediaGeneration(
  surfaceId: string
): number {
  const generation =
    (surfaceMediaGenerations.get(surfaceId) ?? 0) + 1;

  surfaceMediaGenerations.set(surfaceId, generation);

  return generation;
}

function isSurfaceMediaCurrent(
  surfaceId: string,
  mediaGeneration: number,
  currentSceneGeneration: number
): boolean {
  return (
    sceneGeneration === currentSceneGeneration &&
    surfaceMediaGenerations.get(surfaceId) === mediaGeneration
  );
}



async function applySurfaceMedia(
  surfaceId: string,
  media: MediaAsset,
  mediaGeneration: number,
  currentSceneGeneration: number
): Promise<void> {
  const isCurrent = (): boolean =>
    isSurfaceMediaCurrent(
      surfaceId,
      mediaGeneration,
      currentSceneGeneration
    );

  try {
    const blob = await fetchMediaBlob(media);

    if (!isCurrent() || !surfaceScene) {
      return;
    }

    if (media.type === "image") {
      const bitmap = await createImageBitmap(blob, {
        imageOrientation: "flipY"
      });

      if (!isCurrent() || !surfaceScene) {
        bitmap.close();
        return;
      }

      const texture = new THREE.Texture(bitmap);

      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;

      const applied = surfaceScene.setSurfaceTexture(
        surfaceId,
        texture
      );

      if (!applied) {
        texture.dispose();
        bitmap.close();
        return;
      }

      console.log("[Player] Image texture applied:", {
        surfaceId,
        mediaId: media.id
      });

      return;
    }

    if (media.type === "video") {
      const resource = await createVideoResource(blob);

      if (!isCurrent() || !surfaceScene) {
        resource.dispose();
        return;
      }

      const applied = surfaceScene.setSurfaceTexture(
        surfaceId,
        resource.texture,
        resource.dispose
      );

      if (!applied) {
        resource.dispose();
        return;
      }

      console.log("[Player] Video texture applied:", {
        surfaceId,
        mediaId: media.id
      });
    }
  } catch (error) {
    if (!isCurrent()) {
      return;
    }

    console.error(
      "[Player] Surface media loading failed:",
      surfaceId,
      error
    );
  }
}






function handleSurfaceUpdated(
  payload: SurfaceUpdatedPayload
): void {
  const updated = surfaceScene?.updateSurface(
    payload.surfaceId,
    payload.changes.corners
  );

  if (!updated) {
    console.warn(
      "[Player] Surface not found:",
      payload.surfaceId
    );
    return;
  }

  console.log(
    "[Player] Surface updated:",
    payload.surfaceId,
    payload.changes.corners
  );
}



function handleSurfaceMediaUpdated(
  payload: SurfaceMediaUpdatePayload
): void {
  if (!surfaceScene) {
    console.warn(
      "[Player] Surface scene is not initialized."
    );
    return;
  }

  const mediaGeneration = nextSurfaceMediaGeneration(
    payload.surfaceId
  );

  const currentSceneGeneration = sceneGeneration;

  if (!payload.mediaId) {
    const cleared = surfaceScene.setSurfaceTexture(
      payload.surfaceId,
      null
    );

    if (!cleared) {
      console.warn(
        "[Player] Surface not found:",
        payload.surfaceId
      );
      return;
    }

    console.log(
      "[Player] Surface media removed:",
      payload.surfaceId
    );

    return;
  }

  const media = payload.media;

  if (
    !media ||
    media.id !== payload.mediaId ||
    media.status !== "ready" ||
    (media.type !== "image" && media.type !== "video")
  ) {
    console.warn(
      "[Player] Surface media unavailable:",
      payload.mediaId
    );
    return;
  }

  void applySurfaceMedia(
    payload.surfaceId,
    media,
    mediaGeneration,
    currentSceneGeneration
  );
}





function handleSceneLoaded(
  payload: SceneLoadPayload
): void {
  const currentSceneGeneration = ++sceneGeneration;

  surfaceMediaGenerations.clear();

  console.log("[Player] Scene loaded:", {
    projectId: payload.project.id,
    projectName: payload.project.name,
    surfaces: payload.surfaces.length,
    media: payload.media.length
  });

  if (!surfaceScene) {
    console.warn(
      "[Player] Surface scene is not initialized."
    );
    return;
  }

  surfaceScene.loadSurfaces(payload.surfaces);

  console.log(
    `[Player] ${payload.surfaces.length} surfaces rendered.`
  );

  for (const surface of payload.surfaces) {
    if (!surface.mediaId) {
      continue;
    }

    const media = payload.media.find(
      item =>
        item.id === surface.mediaId &&
        item.status === "ready" &&
        (item.type === "image" || item.type === "video")
    );

    if (!media) {
      console.warn(
        "[Player] Assigned media not available:",
        surface.mediaId
      );
      continue;
    }

    const mediaGeneration = nextSurfaceMediaGeneration(
      surface.id
    );

    void applySurfaceMedia(
      surface.id,
      media,
      mediaGeneration,
      currentSceneGeneration
    );
  }
}





let pairingGeneration = 0;
let pollingTimeout: ReturnType<typeof setTimeout> | undefined;

const POLLING_INTERVAL_MS = 2000;

function startProjection(): void {
  if (
    projectionRenderer ||
    !projectionCanvas ||
    !projectionScreen ||
    !pairingScreen
  ) {
    return;
  }

  pairingScreen.hidden = true;
  projectionScreen.hidden = false;

  try {
    const renderer = new ProjectionRenderer(projectionCanvas);
    projectionRenderer = renderer;

    if (RENDER_MODE === "surface") {
      renderer.useOrthographicCamera();

      surfaceScene = createSurfaceScene(
        renderer.getScene()
      );
    } else {  
      testScene = createTestScene(
        renderer.getScene()
      );
    }

   renderer.start((deltaTime) => {
  testScene?.update(deltaTime);
});

    console.log(
      `[Player] Three.js renderer started (${RENDER_MODE})`
    );
  } catch (error) {
    console.error("[Player] Renderer initialization failed:", error);

    stopProjection();
    throw error;
  }
}


function stopProjection(): void {
  ++sceneGeneration;


  surfaceMediaGenerations.clear();


  testScene?.dispose();
  testScene = null;

  surfaceScene?.dispose();
  surfaceScene = null;

  projectionRenderer?.dispose();
  projectionRenderer = null;

  if (projectionScreen) {
    projectionScreen.hidden = true;
  }

  if (pairingScreen) {
    pairingScreen.hidden = false;
  }
}



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

  startProjection();
  },
 () => {
  stopProjection();

  statusElement.textContent =
    "Conexión perdida. Intentando reconectar...";
},
  (message) => {
  stopProjection();

  statusElement.textContent =
    "Error de conexión con el servidor.";

  console.error("[Player] Connection error:", message); 
  },
  () => {
    console.warn(
      "[Player] Authentication rejected. Resetting session."
    );

    stopProjection();
    disconnectPlayer();
    clearPlayerSession();

    void initializePairing();
  },
  () => {
    console.log(
      "[Player] Session ended. Resetting pairing."
    );

    stopProjection();
    disconnectPlayer();
    clearPlayerSession();

    void initializePairing();
    },
  
  handleSurfaceUpdated,
  handleSceneLoaded,
  handleSurfaceMediaUpdated
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
