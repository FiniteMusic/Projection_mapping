
import * as THREE from "three";

export interface VideoResource {
  texture: THREE.VideoTexture;
  video: HTMLVideoElement;
  dispose: () => void;
}

export async function createVideoResource(
  blob: Blob
): Promise<VideoResource> {
  const url = URL.createObjectURL(blob);

  const video = document.createElement("video");

  video.loop = true;
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.autoplay = false;

  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");

  video.src = url;

  const texture = new THREE.VideoTexture(video);

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = false;

  let disposed = false;

  function dispose(): void {
    if (disposed) return;

    disposed = true;

    video.pause();
    video.removeAttribute("src");
    video.load();

    texture.dispose();
    URL.revokeObjectURL(url);
  }

  async function startPlayback(): Promise<void> {
    if (disposed) return;

    try {
      await video.play();
    } catch (error) {
      if (disposed) return;

      console.warn(
        "[Player] Video playback deferred:",
        error
      );
    }
  }

  void startPlayback();

  return {
    texture,
    video,
    dispose
  };
}
