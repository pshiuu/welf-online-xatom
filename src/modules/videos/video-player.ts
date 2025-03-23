import Plyr from "plyr";

export const initVideoPlayer = () => {
  const controls = [
    "play", // Play/pause playback
    "current-time", // The current time of playback
    "duration", // The full duration of the media
    "progress",
    "mute", // Toggle mute
    "volume", // Volume control
    "fullscreen", // Toggle fullscreen
  ];

  // Add CSS for loading spinner
  const addLoadingSpinnerStyles = () => {
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      .video-loading-spinner {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 50px;
        height: 50px;
        border: 5px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: #fff;
        animation: spin 1s ease-in-out infinite;
        z-index: 10;
        display: none;
      }
      
      @keyframes spin {
        to { transform: translate(-50%, -50%) rotate(360deg); }
      }
      
      .plyr__video-wrapper {
        position: relative;
      }
    `;
    document.head.appendChild(styleElement);
  };

  // Add loading spinner to all video wrappers
  const addLoadingSpinners = () => {
    const videoWrappers = document.querySelectorAll(".plyr__video-wrapper");
    videoWrappers.forEach((wrapper) => {
      const spinner = document.createElement("div");
      spinner.className = "video-loading-spinner";
      wrapper.appendChild(spinner);
    });
  };

  // Configure video elements to not preload
  const configureVideoElements = () => {
    const videoElements = document.querySelectorAll("video.js-player");
    videoElements.forEach((video) => {
      (video as HTMLVideoElement).preload = "none";
      (video as HTMLVideoElement).setAttribute("preload", "none");
    });
  };

  // Show loading spinner
  const showLoadingSpinner = (player: Plyr) => {
    // We know elements.wrapper exists, but TypeScript doesn't
    const wrapper = (player as any).elements?.wrapper;
    if (wrapper) {
      const videoWrapper = wrapper.querySelector(".plyr__video-wrapper");
      if (videoWrapper) {
        const spinner = videoWrapper.querySelector(".video-loading-spinner");
        if (spinner) {
          (spinner as HTMLElement).style.display = "block";
        }
      }
    }
  };

  // Hide loading spinner
  const hideLoadingSpinner = (player: Plyr) => {
    // We know elements.wrapper exists, but TypeScript doesn't
    const wrapper = (player as any).elements?.wrapper;
    if (wrapper) {
      const videoWrapper = wrapper.querySelector(".plyr__video-wrapper");
      if (videoWrapper) {
        const spinner = videoWrapper.querySelector(".video-loading-spinner");
        if (spinner) {
          (spinner as HTMLElement).style.display = "none";
        }
      }
    }
  };

  // Keep poster visible until video is ready
  const keepPosterVisible = (player: Plyr) => {
    // Make sure poster is visible
    const poster = (player as any).elements?.poster;
    if (poster) {
      poster.style.display = "block";
    }

    // Also keep any custom poster overlays visible
    const container = (player as any).elements?.container;
    if (container) {
      const parentContainer = container.closest(
        ".beispiel-video-wrap, .team-item-wrap"
      );
      if (parentContainer) {
        const overlays = parentContainer.querySelectorAll(".poster-overlay");
        overlays.forEach((overlay) => {
          (overlay as HTMLElement).style.display = "block";
        });
      }
    }
  };

  // Handle video events for each player
  const setupPlayerEvents = (player: Plyr) => {
    // When video is clicked to play, start loading it
    player.on("play", () => {
      // Show loading spinner while video loads
      showLoadingSpinner(player);

      // Change preload attribute to start loading video
      const media = (player as any).media;
      if (media && media.tagName?.toLowerCase() === "video") {
        media.preload = "auto";
      }
    });

    // When video is loaded and can play
    player.on("canplay", () => {
      hideLoadingSpinner(player);
    });

    // When video actually starts playing
    player.on("playing", () => {
      hideLoadingSpinner(player);

      // Only hide poster when video is actually playing
      const poster = (player as any).elements?.poster;
      if (poster) {
        poster.style.display = "none";
      }

      // Also hide any custom poster overlays
      const container = (player as any).elements?.container;
      if (container) {
        const parentContainer = container.closest(
          ".beispiel-video-wrap, .team-item-wrap"
        );
        if (parentContainer) {
          const overlays = parentContainer.querySelectorAll(".poster-overlay");
          overlays.forEach((overlay) => {
            (overlay as HTMLElement).style.display = "none";
          });
        }
      }
    });

    // Handle errors
    player.on("error", () => {
      hideLoadingSpinner(player);
    });

    // Make sure poster appears at first
    keepPosterVisible(player);

    // Reset the player when ended, which will show poster again
    player.on("ended", () => {
      const poster = (player as any).elements?.poster;
      if (poster) {
        poster.style.display = "block";
      }
    });
  };

  // Initialize everything when DOM is loaded
  const initOnDOMContentLoaded = () => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initializeAll);
    } else {
      initializeAll();
    }
  };

  // Main initialization function
  const initializeAll = () => {
    addLoadingSpinnerStyles();
    configureVideoElements();

    // Initialize all player instances with options to prevent autoloading
    const players = Plyr.setup(".js-player", {
      controls,
      autoplay: false,
      blankVideo: "https://cdn.plyr.io/static/blank.mp4",
      previewThumbnails: { enabled: false },
    });

    addLoadingSpinners();

    // Set up events for each player
    if (Array.isArray(players)) {
      players.forEach((player) => {
        setupPlayerEvents(player);
      });
    }

    // Handle video cover click events
    const handleCoverClick = () => {
      const coverElements = document.querySelectorAll(".plyr_cover");

      coverElements.forEach((cover) => {
        cover.addEventListener("click", (event) => {
          // Get the parent plyr_component
          const playerComponent = cover.closest(".plyr_component");

          if (playerComponent) {
            // Find the Plyr instance for this component
            const videoElement = playerComponent.querySelector(".js-player");
            const playerIndex = Array.from(
              document.querySelectorAll(".js-player")
            ).indexOf(videoElement);

            if (playerIndex !== -1 && players[playerIndex]) {
              // Hide the cover
              (cover as HTMLElement).style.display = "none";

              // Show loading spinner
              showLoadingSpinner(players[playerIndex]);

              // Start loading video
              const media = (players[playerIndex] as any).media;
              if (media && media.tagName?.toLowerCase() === "video") {
                media.preload = "auto";
                // Force a load of the video
                media.load();
              }

              // Play the video
              players[playerIndex].play();
            }
          }
        });
      });
    };

    // Initialize the cover click handlers
    handleCoverClick();

    return players;
  };

  // Start the initialization process
  return initOnDOMContentLoaded();
};
