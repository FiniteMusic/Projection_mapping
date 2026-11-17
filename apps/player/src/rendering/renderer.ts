
import * as THREE from "three";

export class ProjectionRenderer {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private camera:
  | THREE.PerspectiveCamera
  | THREE.OrthographicCamera;

  private animationFrameId: number | null = null;
  private lastFrameTime = 0;
  private fpsFrameCount = 0;
  private fpsElapsedTime = 0;
  private fpsElement: HTMLElement | null = null;

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    this.camera = new THREE.PerspectiveCamera(
      60,
      1,
      0.1,
      1000
    );

    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance"
    });

    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );

    container.appendChild(this.renderer.domElement);

    this.fpsElement = document.createElement("div");
    this.fpsElement.className = "projection__fps";
    this.fpsElement.textContent = "FPS: --";

    container.appendChild(this.fpsElement);

    this.resize(container);
  }

  public getScene(): THREE.Scene {
    return this.scene;
  }

public getCamera():
  | THREE.PerspectiveCamera
  | THREE.OrthographicCamera {
  return this.camera;
}
  public resize(container: HTMLElement): void {
    const width = container.clientWidth;
    const height = container.clientHeight;

    if (width === 0 || height === 0) return;

    if (this.camera instanceof THREE.PerspectiveCamera) {
  this.camera.aspect = width / height;
}

this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  public start(
    update?: (deltaTime: number) => void
  ): void {
    if (this.animationFrameId !== null) return;

    this.lastFrameTime = performance.now();

    const animate = (time: number): void => {
      const deltaTime = Math.min(
        (time - this.lastFrameTime) / 1000,
        0.1
      );

      this.lastFrameTime = time;

      update?.(deltaTime);

        this.renderer.render(this.scene, this.camera);

        this.fpsFrameCount++;
        this.fpsElapsedTime += deltaTime;

        if (this.fpsElapsedTime >= 1) {
        const fps = Math.round(
            this.fpsFrameCount / this.fpsElapsedTime
        );

        if (this.fpsElement) {
            this.fpsElement.textContent = `FPS: ${fps}`;
        }

        this.fpsFrameCount = 0;
        this.fpsElapsedTime = 0;
        }
    
      this.animationFrameId =
        requestAnimationFrame(animate);
    };

    this.animationFrameId =
      requestAnimationFrame(animate);
  }

  public stop(): void {
    if (this.animationFrameId === null) return;

    cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = null;
  }

  public dispose(): void {
    this.stop();
    this.renderer.dispose();
    this.renderer.domElement.remove();
    this.fpsElement?.remove();
    this.fpsElement = null;
  }


  public useOrthographicCamera(): void {
  this.camera = new THREE.OrthographicCamera(
    0,
    1,
    1,
    0,
    -10,
    10
  );

  this.camera.position.z = 5;
}
}


