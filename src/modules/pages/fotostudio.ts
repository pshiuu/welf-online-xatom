import { initMotionHeader } from "../animations/motion-header";
import { initFotostudioMotion } from "../animations/fotostudio-motion";

export const initFotostudio = () => {
  console.log("📸 Fotostudio Page - Initializing components");
  initMotionHeader();
  initFotostudioMotion();
};
