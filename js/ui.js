const toggle = document.getElementById("themeSwitch");

//show popup informasi
function openInfoPopup() {
  document.getElementById("infoPopup").style.display = "flex";
}

function closeInfoPopup() {
  document.getElementById("infoPopup").style.display = "none";
}

// function setTheme(isDark) {
//   document.body.classList.toggle("dark-mode", isDark);
//   toggle.checked = isDark;
//   localStorage.setItem("darkMode", isDark ? "enabled" : "disabled");
// }

// // Toggle event
// toggle.addEventListener("change", function () {
//   setTheme(this.checked);
// });

// // Load saved preference on page load
// window.addEventListener("DOMContentLoaded", () => {
//   const savedMode = localStorage.getItem("darkMode") === "enabled";
//   setTheme(savedMode);
// });

//Set Theme
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("themeSwitch");
  const savedMode = localStorage.getItem("darkMode") === "enabled";

  // Terapkan theme di semua halaman
  setTheme(savedMode);

  // Jika toggle ada (misalnya hanya di profile.html), aktifkan
  if (toggle) {
    toggle.checked = savedMode;

    toggle.addEventListener("change", function () {
      const isDark = this.checked;
      setTheme(isDark);
      localStorage.setItem("darkMode", isDark ? "enabled" : "disabled");
    });
  }

  function setTheme(isDark) {
    document.body.classList.toggle("dark-mode", isDark);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const savedSection = localStorage.getItem("activeSection");
  if (savedSection) {
    showSection(savedSection); // aktifkan section yang disimpan
    localStorage.removeItem("activeSection"); // hapus agar tidak terbuka terus
  } else {
    showSection("split"); // section default
  }
});

//Auto slider banner
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

function showTab(tabId) {
  // Sembunyikan semua section
  document.getElementById("ai-scan").style.display = "none";
  document.getElementById("manual-input").style.display = "none";
  document.getElementById("ocr-scan").style.display = "none";

  // Tampilkan section yang dipilih
  document.getElementById(tabId).style.display = "block";

  // Update active tab button
  const buttons = document.querySelectorAll(".tab-container .tab-button");
  buttons.forEach((btn) => {
    if (btn.dataset.tab === tabId) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

// // Default aktif (jika ingin aktif saat page load)
// window.onload = function () {
//   //set default show section in ai-scan in split bill page
//   showTab("ai-scan");

//   //set default invoice number when opened invoice menu
//   generateInvoiceNumber();
// };

window.addEventListener("load", function () {
  showTab("ai-scan");
  generateInvoiceNumber();
});
