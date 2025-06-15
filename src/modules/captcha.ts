// Declare jQuery for TypeScript
declare var $: any;
declare var jQuery: any;

interface CaptchaChallenge {
  question: string;
  answer: string;
  type: "math" | "visual" | "logic";
}

class AdvancedCaptcha {
  private element: HTMLFormElement;
  private input: HTMLInputElement;
  private label: HTMLElement;
  private submitButton: HTMLButtonElement | HTMLInputElement;
  private currentChallenge: CaptchaChallenge;
  private sessionToken: string;
  private startTime: number;

  constructor(formSelector: string) {
    this.element = document.querySelector(formSelector) as HTMLFormElement;
    if (!this.element) {
      console.error(`Form with selector "${formSelector}" not found`);
      return;
    }

    this.input = this.element.querySelector(
      "#captchainput"
    ) as HTMLInputElement;
    this.label = this.element.querySelector("#captchatext") as HTMLElement;
    this.submitButton = this.element.querySelector(
      "input[type=submit], button[type=submit]"
    ) as HTMLButtonElement | HTMLInputElement;

    if (!this.input || !this.label) {
      console.error(
        'Captcha input or label not found. Make sure elements with IDs "captchainput" and "captchatext" exist.'
      );
      return;
    }

    this.sessionToken = this.generateSessionToken();
    this.startTime = Date.now();

    this.init();
  }

  private init(): void {
    // Disable submit button initially
    if (this.submitButton) {
      this.submitButton.disabled = true;
    }

    // Add hidden fields for server validation
    this.addHiddenFields();

    // Generate and display initial challenge
    this.refreshChallenge();

    // Add styling classes
    this.label.classList.add("captcha-question");
    this.input.classList.add("captcha-input");

    // Setup event listeners
    this.setupEventListeners();

    // Add refresh button
    this.addRefreshButton();

    // Add bot prevention measures
    this.preventBotSubmission();

    // Add styles
    this.addStyles();
  }

  private addHiddenFields(): void {
    if (!this.element.querySelector("#captcha-token")) {
      const tokenField = document.createElement("input");
      tokenField.type = "hidden";
      tokenField.id = "captcha-token";
      tokenField.name = "captcha-token";
      tokenField.value = this.sessionToken;
      this.element.appendChild(tokenField);

      const timestampField = document.createElement("input");
      timestampField.type = "hidden";
      timestampField.id = "captcha-timestamp";
      timestampField.name = "captcha-timestamp";
      timestampField.value = this.startTime.toString();
      this.element.appendChild(timestampField);

      const answerField = document.createElement("input");
      answerField.type = "hidden";
      answerField.id = "captcha-answer";
      answerField.name = "captcha-answer";
      this.element.appendChild(answerField);
    }
  }

  private setupEventListeners(): void {
    // Input validation on input events
    ["input", "keyup", "paste"].forEach((eventType) => {
      this.input.addEventListener(eventType, () => this.validateInput());
    });

    // Form submission validation
    this.element.addEventListener("submit", (e) => this.handleSubmit(e));
  }

  private validateInput(): void {
    const userAnswer = this.input.value.toString().toLowerCase().trim();
    const correctAnswer = this.currentChallenge.answer.toLowerCase().trim();

    if (userAnswer === correctAnswer) {
      this.input.classList.remove("captcha-error");
      this.input.classList.add("captcha-success");

      if (this.submitButton) {
        this.submitButton.disabled = false;
      }

      // Update token to show validation
      const tokenField = this.element.querySelector(
        "#captcha-token"
      ) as HTMLInputElement;
      if (tokenField) {
        tokenField.value = this.sessionToken + "-validated";
      }
    } else {
      this.input.classList.remove("captcha-success");
      this.input.classList.add("captcha-error");

      if (this.submitButton) {
        this.submitButton.disabled = true;
      }
    }
  }

  private handleSubmit(event: Event): void {
    const userAnswer = this.input.value.toString().toLowerCase().trim();
    const correctAnswer = this.currentChallenge.answer.toLowerCase().trim();

    if (userAnswer !== correctAnswer) {
      event.preventDefault();
      alert("Bitte lösen Sie das Captcha korrekt.");
      return;
    }

    // Update final timestamp
    const timestampField = this.element.querySelector(
      "#captcha-timestamp"
    ) as HTMLInputElement;
    if (timestampField) {
      timestampField.value = Date.now().toString();
    }
  }

  private addRefreshButton(): void {
    if (this.element.querySelector(".captcha-refresh")) return;

    const refreshButton = document.createElement("button");
    refreshButton.type = "button";
    refreshButton.className = "captcha-refresh button";
    refreshButton.innerHTML = "↻ Neu laden";

    refreshButton.addEventListener("click", (e) => {
      e.preventDefault();
      this.refreshChallenge();
      this.input.value = "";
      this.input.classList.remove("captcha-success", "captcha-error");
      if (this.submitButton) {
        this.submitButton.disabled = true;
      }
    });

    // Create a wrapper for the label and button to position them inline
    const labelWrapper = document.createElement("div");
    labelWrapper.className = "captcha-label-wrapper";

    // Move the label into the wrapper
    const labelParent = this.label.parentNode;
    if (labelParent) {
      labelParent.insertBefore(labelWrapper, this.label);
      labelWrapper.appendChild(this.label);
      labelWrapper.appendChild(refreshButton);
    }
  }

  private refreshChallenge(): void {
    this.currentChallenge = this.generateChallenge();
    this.label.innerHTML = this.currentChallenge.question;

    const answerField = this.element.querySelector(
      "#captcha-answer"
    ) as HTMLInputElement;
    if (answerField) {
      answerField.value = btoa(this.currentChallenge.answer); // Base64 encode for basic obfuscation
    }
  }

  private generateChallenge(): CaptchaChallenge {
    const challengeTypes: Array<"math" | "visual" | "logic"> = [
      "math",
      "visual",
      "logic",
    ];
    const type =
      challengeTypes[Math.floor(Math.random() * challengeTypes.length)];

    switch (type) {
      case "math":
        return this.generateMathChallenge();
      case "visual":
        return this.generateVisualChallenge();
      case "logic":
        return this.generateLogicChallenge();
      default:
        return this.generateMathChallenge();
    }
  }

  private generateMathChallenge(): CaptchaChallenge {
    const operations = ["+", "-", "×"];
    const op = operations[Math.floor(Math.random() * operations.length)];
    let num1: number, num2: number, answer: number;

    switch (op) {
      case "+":
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
        answer = num1 + num2;
        break;
      case "-":
        num1 = Math.floor(Math.random() * 30) + 10;
        num2 = Math.floor(Math.random() * (num1 - 1)) + 1;
        answer = num1 - num2;
        break;
      case "×":
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
        answer = num1 * num2;
        break;
      default:
        num1 = 1;
        num2 = 1;
        answer = 2;
    }

    return {
      question: `Was ist ${num1} ${op} ${num2}?`,
      answer: answer.toString(),
      type: "math",
    };
  }

  private generateVisualChallenge(): CaptchaChallenge {
    const shapes = ["●", "■", "▲", "♦"];
    const colors = ["rot", "blau", "grün", "gelb"];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const count = Math.floor(Math.random() * 5) + 3;

    let visualDisplay = "";
    for (let i = 0; i < count; i++) {
      visualDisplay += shape + " ";
    }

    const colorMap: { [key: string]: string } = {
      rot: "red",
      blau: "blue",
      grün: "green",
      gelb: "orange",
    };

    return {
      question: `Wie viele ${color}e Symbole sehen Sie? <br><span style="color: ${colorMap[color]}; font-size: 20px;">${visualDisplay}</span>`,
      answer: count.toString(),
      type: "visual",
    };
  }

  private generateLogicChallenge(): CaptchaChallenge {
    const challenges = [
      { q: "Wie viele Tage hat eine Woche?", a: "7" },
      { q: "Wie viele Monate hat ein Jahr?", a: "12" },
      { q: "Welche Farbe entsteht aus Rot + Gelb?", a: "orange" },
      { q: "Wie viele Beine hat eine Katze?", a: "4" },
      { q: "Was kommt nach Montag?", a: "dienstag" },
      { q: "Wie viele Stunden hat ein Tag?", a: "24" },
      { q: "Welcher Monat kommt nach Januar?", a: "februar" },
      { q: "Wie viele Finger hat eine Hand?", a: "5" },
    ];

    const challenge = challenges[Math.floor(Math.random() * challenges.length)];
    return {
      question: challenge.q,
      answer: challenge.a,
      type: "logic",
    };
  }

  private generateSessionToken(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  private preventBotSubmission(): void {
    let interactionCount = 0;
    const startTime = Date.now();

    // Track user interactions
    ["mousemove", "keypress", "click"].forEach((eventType) => {
      this.element.addEventListener(eventType, () => {
        interactionCount++;
      });
    });

    // Additional form submission validation
    this.element.addEventListener("submit", (e) => {
      const timeSpent = Date.now() - startTime;

      if (timeSpent < 3000) {
        // Less than 3 seconds
        e.preventDefault();
        alert("Bitte nehmen Sie sich Zeit zum Ausfüllen des Formulars.");
        return;
      }

      if (interactionCount < 5) {
        // Very little interaction
        e.preventDefault();
        alert("Verdächtige Aktivität erkannt.");
        return;
      }
    });
  }

  private addStyles(): void {
    if (document.querySelector("#captcha-styles")) return;

    const style = document.createElement("style");
    style.id = "captcha-styles";
    style.textContent = `
      /* Captcha label wrapper for inline layout */
      .captcha-label-wrapper {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 8px;
      }
      
      /* Captcha question styling - matches form labels */
      .captcha-question {
        font-weight: 400;
        margin-bottom: 0;
        color: #ffffff;
        font-size: 14px;
        line-height: 1.4;
        display: block;
        flex: 1;
      }
      
      /* Captcha input styling - matches form inputs */
      .captcha-input {
        width: 100px !important;
        max-width: 100px !important;
        padding: 16px 12px !important;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
        border-radius: 8px !important;
        font-size: 16px !important;
        text-align: center !important;
        transition: all 0.3s ease !important;
        background-color: rgba(255, 255, 255, 0.05) !important;
        color: #ffffff !important;
        margin-top: 8px !important;
      }
      
      .captcha-input::placeholder {
        color: rgba(255, 255, 255, 0.5) !important;
      }
      
      .captcha-input:focus {
        outline: none !important;
        border-color: rgba(255, 255, 255, 0.3) !important;
        box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1) !important;
        background-color: rgba(255, 255, 255, 0.08) !important;
      }
      
      .captcha-input.captcha-success {
        border-color: #4CAF50 !important;
        background-color: rgba(76, 175, 80, 0.1) !important;
        box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2) !important;
      }
      
      .captcha-input.captcha-error {
        border-color: #f44336 !important;
        background-color: rgba(244, 67, 54, 0.1) !important;
        box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.2) !important;
      }
      
      /* Refresh button styling - smaller version of form buttons */
      .captcha-refresh {
        background-color: #e4e4e4 !important;
        color: #292929 !important;
        border: none !important;
        border-radius: 6px !important;
        cursor: pointer !important;
        transition: all 0.3s ease !important;
        padding: 6px 12px !important;
        font-size: 12px !important;
        font-weight: 500 !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        min-height: 32px !important;
        text-decoration: none !important;
        white-space: nowrap !important;
        flex-shrink: 0 !important;
      }
      
      .captcha-refresh:hover {
        background-color: #e4e4e4 !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 2px 6px rgba(0, 124, 186, 0.3) !important;
      }
      
      .captcha-refresh:active {
        transform: translateY(0) !important;
        box-shadow: 0 1px 3px rgba(0, 124, 186, 0.3) !important;
      }
      
      .captcha-refresh:focus {
        outline: none !important;
        box-shadow: 0 0 0 2px rgba(0, 124, 186, 0.4) !important;
      }
      
      /* Responsive adjustments */
      @media screen and (max-width: 767px) {
        .captcha-label-wrapper {
          gap: 8px;
        }
        
        .captcha-input {
          width: 80px !important;
          max-width: 80px !important;
          padding: 12px 8px !important;
          font-size: 14px !important;
        }
        
        .captcha-refresh {
          padding: 5px 10px !important;
          font-size: 11px !important;
          min-height: 28px !important;
        }
        
        .captcha-question {
          font-size: 13px !important;
        }
      }
      
      @media screen and (max-width: 479px) {
        .captcha-label-wrapper {
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
        }
        
        .captcha-refresh {
          align-self: flex-end;
          padding: 4px 8px !important;
          font-size: 10px !important;
          min-height: 24px !important;
        }
        
        .captcha-input {
          width: 70px !important;
          max-width: 70px !important;
          padding: 10px 6px !important;
          font-size: 14px !important;
        }
        
        .captcha-question {
          font-size: 12px !important;
          line-height: 1.3 !important;
        }
      }
      
      /* Dark theme compatibility */
      @media (prefers-color-scheme: dark) {
        .captcha-question {
          color: #ffffff;
        }
        
        .captcha-input {
          background-color: rgba(255, 255, 255, 0.05) !important;
          border-color: rgba(255, 255, 255, 0.15) !important;
          color: #ffffff !important;
        }
        
        .captcha-input::placeholder {
          color: rgba(255, 255, 255, 0.5) !important;
        }
      }
      
      /* Integration with existing form field wrapper */
      .multi-form13_field-wrapper .captcha-label-wrapper {
        margin-bottom: 8px;
      }
      
      .multi-form13_field-wrapper .captcha-question {
        margin-bottom: 0;
      }
      
      .multi-form13_field-wrapper .captcha-input {
        margin-top: 0 !important;
      }
      
      /* Ensure proper spacing in multi-form context */
      .multi-form13_input-field .captcha-input {
        width: 100px !important;
        max-width: 100px !important;
      }
      
      /* Visual challenge styling improvements */
      .captcha-question span {
        display: inline-block;
        margin: 8px 0;
        padding: 8px 12px;
        background-color: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      @media screen and (max-width: 479px) {
        .captcha-question span {
          padding: 6px 8px;
          margin: 6px 0;
          font-size: 16px !important;
        }
      }
    `;

    document.head.appendChild(style);
  }
}

// Export the initialization function
export const initCaptcha = (): void => {
  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      new AdvancedCaptcha("#email-form");
    });
  } else {
    new AdvancedCaptcha("#email-form");
  }
};
