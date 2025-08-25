// PWA Install Banner functionality
let deferredPrompt;
const pwaInstallBanner = document.getElementById("pwaInstallBanner");

// Check if banner should be shown
function shouldShowPWABanner() {
  // Only show on index.html
  if (
    !window.location.pathname.endsWith("index.html") &&
    window.location.pathname !== "/"
  ) {
    return false;
  }

  // Check if user has dismissed the banner
  const bannerDismissed = localStorage.getItem("pwa-banner-dismissed");
  if (bannerDismissed === "true") {
    return false;
  }

  // Check if PWA is already installed
  if (window.matchMedia("(display-mode: standalone)").matches) {
    return false;
  }

  // Check if running in PWA mode
  if (window.navigator.standalone === true) {
    return false;
  }

  return true;
}

// Show PWA banner
function showPWABanner() {
  if (shouldShowPWABanner()) {
    pwaInstallBanner.classList.remove("hidden");
    document.body.classList.add("pwa-banner-visible");
  }
}

// Close PWA banner
function closePWABanner() {
  pwaInstallBanner.classList.add("hidden");
  document.body.classList.remove("pwa-banner-visible");
  localStorage.setItem("pwa-banner-dismissed", "true");
}

// Install PWA
async function installPWA() {
  try {
    if (deferredPrompt) {
      // Show the install prompt
      const result = await deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the PWA install prompt");
        closePWABanner();

        // Show success message
        showToast("Split Bill App berhasil diinstall! 🎉", "success");
      } else {
        console.log("User dismissed the PWA install prompt");
        showToast("Install dibatalkan", "info");
      }

      // Clear the deferredPrompt
      deferredPrompt = null;
    } else {
      // Fallback: Try to detect if PWA installation is available through other means
      if ("serviceWorker" in navigator && "PushManager" in window) {
        // Check if we're on mobile or desktop for better instructions
        const isMobile =
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          );

        let instructions;
        if (isMobile) {
          if (
            navigator.userAgent.includes("iPhone") ||
            navigator.userAgent.includes("iPad")
          ) {
            // iOS Safari instructions
            instructions =
              "Untuk menginstall Split Bill App di iOS:\n\n" +
              "1. Tap tombol Share (📤) di Safari\n" +
              '2. Scroll dan pilih "Add to Home Screen"\n' +
              '3. Tap "Add" di pojok kanan atas';
          } else {
            // Android Chrome instructions
            instructions =
              "Untuk menginstall Split Bill App:\n\n" +
              "1. Tap menu browser (⋮) di pojok kanan atas\n" +
              '2. Pilih "Add to Home Screen" atau "Install App"\n' +
              '3. Tap "Add" atau "Install"';
          }
        } else {
          // Desktop instructions
          instructions =
            "Untuk menginstall Split Bill App:\n\n" +
            "1. Klik menu browser (⋮) di pojok kanan atas\n" +
            '2. Pilih "Install Split Bill App"\n' +
            '3. Klik "Install"';
        }

        alert(instructions);
      } else {
        // Browser doesn't support PWA
        alert(
          "Browser Anda belum mendukung instalasi PWA. Silakan gunakan Chrome, Firefox, atau Safari terbaru."
        );
      }
    }
  } catch (error) {
    console.error("Error during PWA installation:", error);
    showToast("Terjadi kesalahan saat install. Coba lagi nanti.", "error");
  }
}

// Listen for beforeinstallprompt event
window.addEventListener("beforeinstallprompt", (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  // Show the PWA banner
  showPWABanner();
});

// Listen for appinstalled event
window.addEventListener("appinstalled", (evt) => {
  console.log("PWA was installed");
  closePWABanner();
});

// Check if we should show banner on page load
document.addEventListener("DOMContentLoaded", function () {
  // Delay showing banner to avoid conflicts with other page load events
  setTimeout(() => {
    if (deferredPrompt) {
      showPWABanner();
    } else {
      // For testing purposes, show banner even without beforeinstallprompt
      // In production, this should be removed and only rely on deferredPrompt
      if (shouldShowPWABanner()) {
        showPWABanner();
      }

      // For browsers that don't fire beforeinstallprompt immediately
      // Check again after a short delay
      setTimeout(() => {
        if (deferredPrompt) {
          showPWABanner();
        }
      }, 2000);
    }
  }, 1000);
});

// Make functions globally available
window.closePWABanner = closePWABanner;
window.installPWA = installPWA;
