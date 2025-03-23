import { initMotionHeader } from "../animations/motion-header";
import { initBtsSlider } from "../slider/bts-slider";
import { initFotoBeispielSlider } from "../slider/foto-beispiel-slider";
import { initVideoPlayer } from "../videos/video-player";

export const initTeam = () => {
  console.log("👥 Team Page - Initializing components");
  initMotionHeader();
  initBtsSlider();
  initFotoBeispielSlider();
  initVideoPlayer();
};
