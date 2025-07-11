// Open bottom sheet reusable function
function openBottomSheet(sheetId) {
  const sheet = document.getElementById(sheetId);
  if (!sheet) return;

  sheet.classList.remove("hidden");
  setTimeout(() => {
    sheet.classList.add("show");
  }, 10); // Sedikit delay untuk animasi CSS (jika pakai)

  const overlay = document.getElementById("overlay");
  if (overlay) overlay.classList.remove("hidden");
}

//close bottomsheet reusable function
function closeBottomSheet(sheetId) {
  const sheet = document.getElementById(sheetId);
  if (!sheet) return;

  sheet.classList.remove("show");
  setTimeout(() => {
    sheet.classList.add("hidden");
  }, 300);

  const overlay = document.getElementById("overlay");
  if (overlay) overlay.classList.add("hidden");
}

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
