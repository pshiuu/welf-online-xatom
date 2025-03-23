import { WFRoute } from "@xatom/core";
import { initHome } from "../modules/pages/home";
import { initFotostudio } from "../modules/pages/fotostudio";
import { initFotoproduktion } from "../modules/pages/fotoproduktion";
import { initReferenzen } from "../modules/pages/referenzen";
import { initErklaerAnimationsvideos } from "../modules/pages/erklaer-animationsvideos";
import { initTeam } from "../modules/pages/team";
import { initKontakt } from "../modules/pages/kontakt";
import { initVideoproduktion } from "../modules/pages/videoproduktion";
import { initVideoproduktionSubpage } from "../modules/pages/videoproduktion-subpage";

// Initialize all routes
export const initRoutes = () => {
  // Home page route
  new WFRoute("/").execute(() => {
    initHome();
  });

  // Fotostudio page route
  new WFRoute("/fotostudio").execute(() => {
    initFotostudio();
  });

  // Fotoproduktion subpages
  new WFRoute("/fotoproduktion/(.*)").execute(() => {
    initFotoproduktion();
  });

  // Referenzen page route
  new WFRoute("/referenzen").execute(() => {
    initReferenzen();
  });

  // Erklaer Animationsvideos page route
  new WFRoute("/erklaer-animationsvideos").execute(() => {
    initErklaerAnimationsvideos();
  });

  // Team page route
  new WFRoute("/team").execute(() => {
    initTeam();
  });

  // Kontakt page route
  new WFRoute("/kontakt").execute(() => {
    initKontakt();
  });

  // Main Videoproduktion page
  new WFRoute("/videoproduktion").execute(() => {
    initVideoproduktion();
  });

  // All videoproduktion subpages - using regex pattern instead of wildcards
  new WFRoute("/videoproduktion/(.*)").execute(() => {
    initVideoproduktionSubpage();
  });
};
