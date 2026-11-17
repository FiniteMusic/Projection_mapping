declare module "ffprobe-static" {
  interface FFprobeStatic {
    path: string | null;
    version: string;
    url: string;
  }

  const ffprobe: FFprobeStatic;

  export default ffprobe;
}