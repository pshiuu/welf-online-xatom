import { initMotionHeader } from "../animations/motion-header";
import { initVideoproduktionSubpageMotion } from "../animations/videoproduktion-motion";
import { initBeispiel } from "../beispiel-vid-slid";

export const initVideoproduktionSubpage = () => {
  console.log("🎥 Videoproduktion Subpage - Initializing components");
  initMotionHeader();
  initVideoproduktionSubpageMotion();
  initBeispiel();
};
