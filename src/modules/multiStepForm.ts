import { WFComponent, onReady } from "@xatom/core";

// Bot detection and rate limiting class
class BotDetector {
  private static submissionTimes: number[] = [];
  private static interactionEvents: number = 0;
  private static startTime: number = Date.now();
  private static mouseMovements: number = 0;

  static trackInteraction(): void {
    this.interactionEvents++;
  }

  static trackMouseMovement(): void {
    this.mouseMovements++;
  }

  static isLikelyBot(): boolean {
    const currentTime = Date.now();
    const timeSpent = currentTime - this.startTime;

    // Check if submission is too fast (less than 10 seconds)
    if (timeSpent < 10000) {
      console.warn("Bot detected: submission too fast");
      return true;
    }

    // Check for lack of mouse movement
    if (this.mouseMovements < 5) {
      console.warn("Bot detected: no mouse movement");
      return true;
    }

    // Check for lack of interactions
    if (this.interactionEvents < 10) {
      console.warn("Bot detected: insufficient interactions");
      return true;
    }

    // Rate limiting: check recent submissions
    this.submissionTimes = this.submissionTimes.filter(
      (time) => currentTime - time < 300000
    ); // 5 minutes

    if (this.submissionTimes.length >= 3) {
      console.warn("Bot detected: too many recent submissions");
      return true;
    }

    return false;
  }

  static recordSubmission(): void {
    this.submissionTimes.push(Date.now());
    localStorage.setItem("lastSubmission", Date.now().toString());
  }

  static checkRecentSubmissions(): boolean {
    const lastSubmission = localStorage.getItem("lastSubmission");
    if (lastSubmission) {
      const timeDiff = Date.now() - parseInt(lastSubmission);
      if (timeDiff < 60000) {
        // 1 minute cooldown
        return true;
      }
    }
    return false;
  }
}

// Multi-step form class
class MultiStepFormHandler {
  private form: HTMLFormElement | null;
  private steps: NodeListOf<Element>;
  private currentStepIndex: number = 0;

  constructor() {
    this.form = document.querySelector(
      "#wf-form-Kontaktformular"
    ) as HTMLFormElement;
    this.steps = document.querySelectorAll('[data-form="step"]');

    if (!this.form) {
      console.error("Form element not found");
      return;
    }

    if (this.steps.length === 0) {
      console.error("No form steps found");
      return;
    }

    this.init();
  }

  private init(): void {
    console.log("Initializing multi-step form");

    // Initialize bot detection
    this.initBotDetection();

    // Check for recent submissions on page load
    if (BotDetector.checkRecentSubmissions()) {
      this.showCooldownMessage();
      return;
    }

    // Add honeypot fields
    this.addHoneypotFields();

    // Setup form functionality
    this.setupEventListeners();
    this.setupRadioButtons();

    // Show first step
    this.showStep(0);

    // Add styles
    this.addStyles();
  }

  private initBotDetection(): void {
    document.addEventListener("mousemove", () =>
      BotDetector.trackMouseMovement()
    );
    document.addEventListener("click", () => BotDetector.trackInteraction());
    document.addEventListener("keypress", () => BotDetector.trackInteraction());
    document.addEventListener("scroll", () => BotDetector.trackInteraction());

    // Add input tracking
    const inputs = document.querySelectorAll("input, textarea, select");
    inputs.forEach((input) => {
      input.addEventListener("input", () => BotDetector.trackInteraction());
      input.addEventListener("focus", () => BotDetector.trackInteraction());
    });
  }

  private showCooldownMessage(): void {
    if (!this.form) return;

    const warning = document.createElement("div");
    warning.style.cssText =
      "background: #ffe6e6; border: 1px solid #ff9999; padding: 10px; margin: 10px 0; border-radius: 4px; color: #cc0000;";
    warning.textContent =
      "Bitte warten Sie mindestens 1 Minute zwischen Formularübermittlungen.";
    this.form.insertBefore(warning, this.form.firstChild);

    const submitButtons = this.form.querySelectorAll(
      "input[type=submit], button[type=submit]"
    );
    submitButtons.forEach(
      (btn) => ((btn as HTMLElement).style.display = "none")
    );
  }

  private addHoneypotFields(): void {
    if (!this.form || this.form.querySelector('input[name="website"]')) return;

    // Add invisible honeypot fields
    const honeypot1 = document.createElement("input");
    honeypot1.type = "text";
    honeypot1.name = "website";
    honeypot1.style.cssText =
      "position:absolute;left:-9999px;opacity:0;pointer-events:none;";
    honeypot1.tabIndex = -1;
    honeypot1.setAttribute("autocomplete", "off");

    const honeypot2 = document.createElement("input");
    honeypot2.type = "text";
    honeypot2.name = "url";
    honeypot2.style.cssText =
      "position:absolute;left:-9999px;opacity:0;pointer-events:none;";
    honeypot2.tabIndex = -1;
    honeypot2.setAttribute("autocomplete", "off");

    this.form.appendChild(honeypot1);
    this.form.appendChild(honeypot2);
  }

  private setupEventListeners(): void {
    // Handle next button clicks
    const nextButtons = document.querySelectorAll('[data-form="next-btn"]');
    nextButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        BotDetector.trackInteraction();

        if (this.validateStep(this.currentStepIndex)) {
          this.currentStepIndex++;
          if (this.currentStepIndex < this.steps.length) {
            this.showStep(this.currentStepIndex);
          }
        }
      });
    });

    // Handle back button clicks
    const backButtons = document.querySelectorAll('[data-form="back-btn"]');
    backButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        BotDetector.trackInteraction();

        if (this.currentStepIndex > 0) {
          this.currentStepIndex--;
          this.showStep(this.currentStepIndex);
        }
      });
    });

    // Handle form submission
    if (this.form) {
      this.form.addEventListener("submit", (event) => this.handleSubmit(event));
    }
  }

  private handleSubmit(event: Event): void {
    // Check for bot behavior
    if (BotDetector.isLikelyBot()) {
      event.preventDefault();
      alert(
        "Verdächtige Aktivität erkannt. Bitte kontaktieren Sie uns direkt."
      );
      return;
    }

    // Validate the final step before submission
    if (!this.validateStep(this.currentStepIndex)) {
      event.preventDefault();
      return;
    }

    // Check captcha if present
    const captchaInput = this.form?.querySelector(
      "#captchainput"
    ) as HTMLInputElement;
    const captchaToken = this.form?.querySelector(
      "#captcha-token"
    ) as HTMLInputElement;

    if (
      captchaInput &&
      captchaToken &&
      !captchaToken.value.includes("-validated")
    ) {
      event.preventDefault();
      alert("Bitte lösen Sie das Captcha.");
      return;
    }

    // Record submission
    BotDetector.recordSubmission();

    console.log("Form submitted successfully");
  }

  private validateStep(stepIndex: number): boolean {
    const step = this.steps[stepIndex];
    const requiredFields = step.querySelectorAll(
      "input[required], select[required]"
    );
    let isValid = true;

    // Check for honeypot fields
    const honeypots = step.querySelectorAll(
      'input[name="website"], input[name="url"], input[style*="display:none"]'
    );
    honeypots.forEach((honeypot) => {
      const input = honeypot as HTMLInputElement;
      if (input.value.trim() !== "") {
        console.warn("Bot detected: honeypot field filled");
        isValid = false;
      }
    });

    // Reset error states
    requiredFields.forEach((field) => {
      const inputElement = field as HTMLInputElement | HTMLSelectElement;
      inputElement.classList.remove("error-field");

      const existingErrorMsg = inputElement.parentElement?.nextElementSibling;
      if (
        existingErrorMsg &&
        existingErrorMsg.classList.contains("field-error-message")
      ) {
        existingErrorMsg.remove();
      }
    });

    // Validate each required field
    requiredFields.forEach((field) => {
      const inputElement = field as HTMLInputElement | HTMLSelectElement;
      const value = inputElement.value.trim();

      if (!value) {
        isValid = false;
        inputElement.classList.add("error-field");
        this.createErrorMessage(inputElement, "Pflichtfeld");
      } else {
        // Email validation
        if (inputElement.type === "email") {
          if (!this.isValidEmail(value)) {
            isValid = false;
            inputElement.classList.add("error-field");
            this.createErrorMessage(
              inputElement,
              "Gültige E-Mail-Adresse erforderlich"
            );
          }
        }

        // Phone validation
        if (
          inputElement.type === "tel" ||
          inputElement.name?.toLowerCase().includes("telefon")
        ) {
          if (!this.isValidPhone(value)) {
            isValid = false;
            inputElement.classList.add("error-field");
            this.createErrorMessage(
              inputElement,
              "Gültige Telefonnummer erforderlich"
            );
          }
        }

        // Content validation
        if (this.containsSuspiciousContent(value)) {
          isValid = false;
          inputElement.classList.add("error-field");
          this.createErrorMessage(inputElement, "Verdächtiger Inhalt erkannt");
        }
      }
    });

    return isValid;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /^\d+@/, // starts with numbers
      /@(temp|tempmail|10minutemail|guerrillamail)/i, // temporary email services
      /^.{1,2}@/, // very short local part
    ];

    return !suspiciousPatterns.some((pattern) => pattern.test(email));
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\d\s\+\-\(\)]{6,}$/;
    return phoneRegex.test(phone);
  }

  private containsSuspiciousContent(content: string): boolean {
    const suspiciousContent = [
      /https?:\/\//i, // URLs
      /bitcoin|crypto|investment|loan/i, // common spam keywords
      /click here|earn money|make money/i, // spam phrases
    ];

    return suspiciousContent.some((pattern) => pattern.test(content));
  }

  private createErrorMessage(inputElement: HTMLElement, message: string): void {
    const errorMsg = document.createElement("div");
    errorMsg.className = "field-error-message";
    errorMsg.textContent = message;

    const fieldWrapper = inputElement.closest(".multi-form13_field-wrapper");
    if (fieldWrapper) {
      const inputContainer = inputElement.parentElement;
      if (inputContainer && inputContainer !== fieldWrapper) {
        inputContainer.after(errorMsg);
      } else {
        inputElement.after(errorMsg);
      }
    } else {
      inputElement.after(errorMsg);
    }
  }

  private showStep(stepIndex: number): void {
    this.steps.forEach((step, index) => {
      const stepElement = step as HTMLElement;
      stepElement.style.display = index === stepIndex ? "block" : "none";
    });

    this.updateProgressIndicators(stepIndex);
  }

  private updateProgressIndicators(currentStep: number): void {
    const progressIndicators = document.querySelectorAll(
      '[data-form="custom-progress-indicator"]'
    );

    progressIndicators.forEach((indicator, index) => {
      indicator.classList.remove("progress-current", "completed");

      if (index < currentStep) {
        indicator.classList.add("completed");
      } else if (index === currentStep) {
        indicator.classList.add("progress-current");
      }
    });
  }

  private setupRadioButtons(): void {
    const radioButtons = document.querySelectorAll('input[type="radio"]');

    radioButtons.forEach((radio) => {
      const radioInput = radio as HTMLInputElement;

      // Initial setup
      if (radioInput.checked) {
        this.styleRadioButton(radioInput, true);
      }

      // Add click event listener
      radioInput.addEventListener("click", () => {
        BotDetector.trackInteraction();

        const name = radioInput.getAttribute("name");
        if (name) {
          const groupRadios = document.querySelectorAll(
            `input[name="${name}"]`
          );

          // Reset all radio buttons in the group
          groupRadios.forEach((groupRadio) => {
            this.styleRadioButton(groupRadio as HTMLInputElement, false);
          });

          // Style the selected radio button
          this.styleRadioButton(radioInput, true);
        }
      });
    });
  }

  private styleRadioButton(
    radioInput: HTMLInputElement,
    isActive: boolean
  ): void {
    const label = radioInput.closest(".multi-form13_radio") as HTMLElement;
    if (!label) return;

    if (isActive) {
      label.classList.add("is-active-inputactive");
    } else {
      label.classList.remove("is-active-inputactive");
    }

    // Style the letter element
    const letterElement = label.querySelector(".multi-form13_radio-letter");
    if (letterElement) {
      if (isActive) {
        letterElement.classList.add("active");
      } else {
        letterElement.classList.remove("active");
      }
    }

    // Style the label text
    const labelText = label.querySelector(".multi-form13_radio-label");
    if (labelText) {
      if (isActive) {
        labelText.classList.add("active");
      } else {
        labelText.classList.remove("active");
      }
    }
  }

  private addStyles(): void {
    if (document.querySelector("#multi-step-form-styles")) return;

    const style = document.createElement("style");
    style.id = "multi-step-form-styles";
    style.textContent = `
      .error-field {
        border-color: #ff3b30 !important;
      }
      
      .field-error-message {
        color: #ff3b30;
        font-size: 12px;
        margin-top: 4px;
        margin-bottom: 8px;
        display: block;
      }
      
      /* Radio button styling */
      .multi-form13_radio.is-active-inputactive {
        border-color: #000 !important;
        background-color: #fff !important;
      }
      
      .multi-form13_radio.is-active-inputactive .multi-form13_radio-label {
        color: #000 !important;
        font-weight: 500;
      }
      
      .multi-form13_radio-letter.active {
        background-color: #fff !important;
        color: #000 !important;
      }
      
      .multi-form13_radio-icon.w-radio-input.w--redirected-checked {
        background-color: #fff !important;
        border-color: #000 !important;
      }
      
      /* Bot warning styles */
      .bot-warning {
        background: #ffe6e6;
        border: 1px solid #ff9999;
        padding: 15px;
        margin: 10px 0;
        border-radius: 4px;
        color: #cc0000;
        font-weight: 600;
        text-align: center;
      }
    `;

    document.head.appendChild(style);
  }
}

// Export the initialization function
export const initMultiStepForm = (): void => {
  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      new MultiStepFormHandler();
    });
  } else {
    new MultiStepFormHandler();
  }
};
