/**
 * Membuka bottom sheet dengan id yang diberikan.
 *
 * @param {string} sheetId - id dari bottom sheet yang akan dibuka.
 */
function openBottomSheet(sheetId) {
  const sheet = document.getElementById(sheetId);
  if (!sheet) return;

  sheet.classList.remove("hidden");
  setTimeout(() => {
    sheet.classList.add("show");
  }, 10);

  //show overlay
  showOverlay();
}

/**
 * Menutup bottom sheet dengan id yang diberikan.
 *
 * @param {string} sheetId - id dari bottom sheet yang akan ditutup.
 */
function closeBottomSheet(sheetId) {
  const sheet = document.getElementById(sheetId);
  if (!sheet) return;

  sheet.classList.remove("show");
  setTimeout(() => {
    sheet.classList.add("hidden");
  }, 300);

  //hide overlay
  hideOverlay();
}

/**
 * Displays a popup with the specified ID.
 *
 * @param {string} popupId - The ID of the popup element to display.
 */

function openPopup(popupId) {
  const popup = document.getElementById(popupId);
  if (popup) {
    popup.style.display = "flex";

    // Jalankan animasi setelah elemen ditampilkan
    requestAnimationFrame(() => {
      popup.querySelector(".popup-content").classList.add("show");
    });
  }
}

/**
 * Closes a popup with the specified ID.
 *
 * @param {string} popupId - The ID of the popup element to close.
 */
function closePopup(popupId) {
  const popup = document.getElementById(popupId);
  if (popup) {
    const popupContent = popup.querySelector(".popup-content");
    if (popupContent) {
      popupContent.classList.remove("show");
    }

    // Tunggu animasi selesai baru disembunyikan
    setTimeout(() => {
      popup.style.display = "none";
    }, 300); // sama dengan durasi animasi di CSS
  }
}

/**
 * Displays the overlay element.
 *
 * The overlay is a full-page dark background that is used to blur the main content
 * of the page when a popup is displayed. This function removes the "hidden"
 * class from the overlay element, making it visible.
 */
function showOverlay() {
  document.getElementById("overlay").classList.remove("hidden");
}

/**
 * Hides the overlay element.
 *
 * This function adds the "hidden" class to the overlay element, effectively
 * hiding it from view. It is typically used to remove the overlay when a
 * popup or bottom sheet is closed.
 */

function hideOverlay() {
  document.getElementById("overlay").classList.add("hidden");
}
