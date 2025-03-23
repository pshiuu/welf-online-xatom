import { initTestimonialSlider } from "../slider/testimonial-slider";
import { initReferenceSlider } from "../slider/ref-slider";
import { initMotionHeader } from "../animations/motion-header";
import { initHomeMotion } from "../animations/home-motion";
import { initVideoPlayer } from "../videos/video-player";
import { initMarquee } from "../slider/marquees";

export const initHome = () => {
  console.log("🏠 Home Page - Initializing components");
  initTestimonialSlider();
  initReferenceSlider();
  initMotionHeader();
  initVideoPlayer();
  initMarquee();
  initHomeMotion();
};
