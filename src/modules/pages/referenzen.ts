import { initMotionHeader } from "../animations/motion-header";
import { initVideoPlayer } from "../videos/video-player";

export const initReferenzen = () => {
  console.log("🔍 Referenzen Page - Initializing components");
  initMotionHeader();
  initVideoPlayer();
};
