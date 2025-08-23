// Set Theme Function (Global)
function setTheme(isDark) {
  document.body.classList.toggle("dark-mode", isDark);
}

// Global variable to track popup status in current session
let merchandisingPopupShown = false;

// Merchandising Popup Functions
function showMerchandisingPopup() {
  // Check if popup has been seen in current session
  if (merchandisingPopupShown) {
    console.log("Popup already shown in this session"); // Debug log
    return;
  }

  // Check if popup has been seen before in localStorage or sessionStorage
  const hasSeenLocalStorage =
    localStorage.getItem("merchandisingPopupSeen") === "true";
  const hasSeenSessionStorage =
    sessionStorage.getItem("merchandisingPopupSeen") === "true";
  const hasSeenPopup = hasSeenLocalStorage || hasSeenSessionStorage;

  console.log(
    "Checking popup status - localStorage:",
    hasSeenLocalStorage,
    "sessionStorage:",
    hasSeenSessionStorage
  ); // Debug log

  if (hasSeenPopup) {
    console.log("Popup already seen, not showing"); // Debug log
    merchandisingPopupShown = true;
    return; // Don't show popup if already seen
  }

  const popup = document.getElementById("merchandisingPopup");
  const popupContent = popup?.querySelector(".popup-content");

  if (popup && popupContent) {
    console.log("Showing merchandising popup"); // Debug log
    merchandisingPopupShown = true;
    popup.style.display = "flex";
    // Small delay to ensure display is set before adding animation class
    setTimeout(() => {
      popup.classList.add("show");
      popupContent.classList.add("show");
    }, 10);
  }
}

function closeMerchandisingPopup() {
  const popup = document.getElementById("merchandisingPopup");
  const popupContent = popup?.querySelector(".popup-content");

  if (popup && popupContent) {
    popup.classList.remove("show");
    popup.classList.add("hide");
    popupContent.classList.remove("show");

    // Mark popup as seen in both localStorage and sessionStorage
    try {
      localStorage.setItem("merchandisingPopupSeen", "true");
      console.log("Popup marked as seen in localStorage"); // Debug log
    } catch (e) {
      console.log("localStorage not available, using sessionStorage only"); // Debug log
    }

    sessionStorage.setItem("merchandisingPopupSeen", "true");
    console.log("Popup marked as seen in sessionStorage"); // Debug log

    merchandisingPopupShown = true;

    // Wait for animation to complete before hiding
    setTimeout(() => {
      popup.style.display = "none";
      popup.classList.remove("hide");
    }, 300);
  }
}

// Single DOMContentLoaded event listener to handle all initialization
document.addEventListener("DOMContentLoaded", () => {
  // Theme initialization
  const toggle = document.getElementById("themeSwitch");
  const savedMode = localStorage.getItem("darkMode") === "enabled";

  // Apply theme to all pages
  setTheme(savedMode);

  // If toggle exists (e.g., only on profile.html), activate it
  if (toggle) {
    toggle.checked = savedMode;
    toggle.addEventListener("change", function () {
      const isDark = this.checked;
      setTheme(isDark);
      localStorage.setItem("darkMode", isDark ? "enabled" : "disabled");
    });
  }

  // Section management
  const savedSection = localStorage.getItem("activeSection");
  if (savedSection && typeof showSection === "function") {
    showSection(savedSection);
    localStorage.removeItem("activeSection");
  } else if (typeof showSection === "function") {
    showSection("split");
  }

  // Initialize other components
  if (typeof renderInvoiceCards === "function") {
    renderInvoiceCards();
  }
  if (typeof initSplitBillNumber === "function") {
    initSplitBillNumber();
  }
  updateHeaderAvatar();
  initCopyButtons();

  // Show merchandising popup only if not seen before
  const hasSeenPopup =
    localStorage.getItem("merchandisingPopupSeen") === "true";
  if (!hasSeenPopup) {
    setTimeout(() => {
      showMerchandisingPopup();
      popupShown = true;
    }, 800); // Reduced from 1000ms to 800ms
  }
});

// Auto slider banner
const slides = document.querySelectorAll(".banner-slide");
let currentSlide = 0;
const totalSlides = slides.length;

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === index);
  });
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % totalSlides;
  showSlide(currentSlide);
}

setInterval(nextSlide, 6000);

function showTab(
  tabId,
  sectionSelector = ".tab-section",
  tabGroupSelector = ".tab-container"
) {
  // Hide all sections
  document.querySelectorAll(sectionSelector).forEach((section) => {
    section.style.display = "none";
  });

  // Show selected section
  const target = document.getElementById(tabId);
  if (target) target.style.display = "block";

  // Update active tab button
  const buttons = document.querySelectorAll(`${tabGroupSelector} .tab-button`);
  buttons.forEach((btn) => {
    if (btn.dataset.tab === tabId) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  showUnderConstruction();
}

window.addEventListener("load", function () {
  // Get tab from URL if exists
  const params = new URLSearchParams(window.location.search);
  const urlTab = params.get("tab");

  // Get default tab from body data attribute
  const defaultTab = document.body.dataset.defaultTab || "default-tab-id";

  // Determine which tab to show
  const activeTab = urlTab ? `transaction-${urlTab}` : defaultTab;

  // Show tab
  showTab(activeTab);

  // If active tab is ai-scan, run generateInvoiceNumber
  if (activeTab === "ai-scan") {
    generateInvoiceNumber();
  }

  // Set dark mode
  const savedMode = localStorage.getItem("darkMode") === "enabled";
  setTheme(savedMode);

  // Show invoice cards if any
  if (typeof renderInvoiceCards === "function") {
    renderInvoiceCards();
  }

  // Update header avatar on window load to ensure it's updated after login redirect
  updateHeaderAvatar();
});

function showUnderConstruction(
  message = "📅 Halaman ini masih dalam pengembangan. Coming Soon!"
) {
  const container = document.getElementById("showUnderConstruction");
  if (!container) return;

  container.innerHTML = `
    <img
      src="img/under-construction.png"
      alt="Under Construction"
      class="under-construction"
    />
    <p class="coming-soon">${message}</p>
  `;
}

function hidePreviewContainerIfNoData() {
  const previewContainer = document.querySelector(".preview-container");
  const noDataMessage = previewContainer.querySelector(".no-data-message");

  if (noDataMessage) {
    previewContainer.style.display = "none";
  }
}

function updateHeaderAvatar() {
  try {
    const currentUser = localStorage.getItem("currentUser");
    const token = localStorage.getItem("accessToken");
    const headerAvatar = document.getElementById("headerAvatar");

    console.log("Updating header avatar:", {
      hasCurrentUser: !!currentUser,
      hasToken: !!token,
      hasHeaderAvatar: !!headerAvatar,
    });

    if (currentUser && token && headerAvatar) {
      const user = JSON.parse(currentUser);
      const avatarSeed = user.name || user.email || "default";
      const avatarUrl = `https://api.dicebear.com/9.x/personas/svg?backgroundColor=b6e3f4&scale=100&seed=${encodeURIComponent(
        avatarSeed
      )}`;
      headerAvatar.src = avatarUrl;
      console.log("Header avatar updated successfully for:", avatarSeed);
    } else if (currentUser && token && !headerAvatar) {
      // If avatar element is not found, try again after a short delay
      setTimeout(() => {
        const retryAvatar = document.getElementById("headerAvatar");
        if (retryAvatar) {
          const user = JSON.parse(currentUser);
          const avatarSeed = user.name || user.email || "default";
          const avatarUrl = `https://api.dicebear.com/9.x/personas/svg?backgroundColor=b6e3f4&scale=100&seed=${encodeURIComponent(
            avatarSeed
          )}`;
          retryAvatar.src = avatarUrl;
          console.log("Header avatar updated on retry for:", avatarSeed);
        }
      }, 100);
    }
  } catch (error) {
    console.error("Error updating header avatar:", error);
  }
}

/**
 * Inits copy buttons on the page.
 *
 * Copy buttons are used to copy numbers of payment methods. This function
 * queries all elements with class `copy-btn`, and adds a click event listener
 * to each of them.
 *
 * When a button is clicked, it gets the text content of the element's parent
 * element and trims it. Then it writes the trimmed string to the clipboard
 * using the `navigator.clipboard` API.
 *
 * If the copying is successful, it shows a success toast with the message
 * "Nomor <number> berhasil disalin". If the copying fails, it shows an error
 * toast with the message "Nomor <number> gagal disalin".
 */
function initCopyButtons() {
  const copyButtons = document.querySelectorAll(".copy-btn");

  copyButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      // Find the payment method container in the same parent
      const paymentMethodContainer = btn.parentElement.querySelector(
        ".payment-method-donate"
      );

      if (paymentMethodContainer) {
        // Get the last paragraph which contains the number
        const paragraphs = paymentMethodContainer.querySelectorAll("p");
        const lastParagraph = paragraphs[paragraphs.length - 1];

        if (lastParagraph) {
          const number = lastParagraph.textContent.trim();

          navigator.clipboard
            .writeText(number)
            .then(() => {
              const icon = btn.querySelector("i");
              const oldClass = icon.className;
              icon.className = "uil uil-check-circle";

              setTimeout(() => {
                icon.className = oldClass;
              }, 1500);
              showToast(`Nomor ${number} berhasil disalin`, "success", 5000);
            })
            .catch((err) => {
              console.error("Gagal menyalin: ", err);
              showToast(`Nomor ${number} gagal disalin`, "error", 5000);
            });
        }
      }
    });
  });
}

// Update avatar when user data changes
window.addEventListener("storage", function (e) {
  if (e.key === "currentUser" || e.key === "accessToken") {
    updateHeaderAvatar();
  }
});

// Additional check for avatar update after login redirect
// This ensures avatar gets updated even if storage event doesn't fire properly
let avatarUpdateInterval;

function startAvatarUpdateCheck() {
  // Clear any existing interval
  if (avatarUpdateInterval) {
    clearInterval(avatarUpdateInterval);
  }

  // Check for avatar update every 500ms for the first 5 seconds after page load
  let checkCount = 0;
  avatarUpdateInterval = setInterval(() => {
    checkCount++;

    const currentUser = localStorage.getItem("currentUser");
    const token = localStorage.getItem("accessToken");
    const headerAvatar = document.getElementById("headerAvatar");

    if (currentUser && token && headerAvatar) {
      const user = JSON.parse(currentUser);
      const avatarSeed = user.name || user.email || "default";
      const expectedUrl = `https://api.dicebear.com/9.x/personas/svg?backgroundColor=b6e3f4&scale=100&seed=${encodeURIComponent(
        avatarSeed
      )}`;

      // If avatar is still showing default, update it
      if (
        headerAvatar.src.includes("seed=default") &&
        !expectedUrl.includes("seed=default")
      ) {
        console.log("Updating avatar from interval check");
        updateHeaderAvatar();
      }
    }

    // Stop checking after 10 attempts (5 seconds)
    if (checkCount >= 10) {
      clearInterval(avatarUpdateInterval);
    }
  }, 500);
}

// Start the avatar update check when page loads
document.addEventListener("DOMContentLoaded", () => {
  startAvatarUpdateCheck();
});

window.addEventListener("load", () => {
  startAvatarUpdateCheck();
});

// Optimized popup trigger - only show if not seen before
let popupShown = false;

document.addEventListener("visibilitychange", function () {
  const hasSeenPopup =
    localStorage.getItem("merchandisingPopupSeen") === "true";
  if (!document.hidden && !hasSeenPopup && !popupShown) {
    setTimeout(() => {
      showMerchandisingPopup();
      popupShown = true;
    }, 300); // Reduced delay
  }
});

// Fallback: Show popup on window load if it hasn't been shown yet
window.addEventListener("load", function () {
  const popup = document.getElementById("merchandisingPopup");
  const hasSeenPopup =
    localStorage.getItem("merchandisingPopupSeen") === "true";
  if (popup && popup.style.display !== "flex" && !popupShown && !hasSeenPopup) {
    setTimeout(() => {
      showMerchandisingPopup();
      popupShown = true;
    }, 1000);
  }
});
