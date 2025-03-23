import { initMultiStepForm } from "../multiStepForm";
import { initCaptcha } from "../captcha";

export const initKontakt = () => {
  console.log("📧 Kontakt Page - Initializing components");
  initMultiStepForm();
  initCaptcha();
};
