import { initMotionHeader } from "../animations/motion-header";
import { initBilderSlider } from "../slider/bilder-slider";
import { initFotoBeispielSlider } from "../slider/foto-beispiel-slider";
import { initFotoproduktionMotion } from "../animations/fotoproduktion-motion";

export const initFotoproduktion = () => {
  console.log("📷 Fotoproduktion Subpage - Initializing components");
  initMotionHeader();
  initBilderSlider();
  initFotoBeispielSlider();
  initFotoproduktionMotion();
};
