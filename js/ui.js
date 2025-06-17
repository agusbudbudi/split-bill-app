const toggle = document.getElementById("themeSwitch");

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

// function setTheme(isDark) {
//   document.body.classList.toggle("dark-mode", isDark);
//   toggle.checked = isDark;
//   localStorage.setItem("darkMode", isDark ? "enabled" : "disabled");
// }

// // Toggle event
// toggle.addEventListener("change", function () {
//   setTheme(this.checked);
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

  // // Load saved preference on page load
  // window.addEventListener("DOMContentLoaded", () => {
  //   const savedMode = localStorage.getItem("darkMode") === "enabled";
  //   setTheme(savedMode);
  // });

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

function showTab(
  tabId,
  sectionSelector = ".tab-section",
  tabGroupSelector = ".tab-container"
) {
  // Sembunyikan semua section
  document.querySelectorAll(sectionSelector).forEach((section) => {
    section.style.display = "none";
  });

  // Tampilkan section yang dipilih
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
}

window.addEventListener("load", function () {
  // Ambil tab dari URL jika ada
  const params = new URLSearchParams(window.location.search);
  const urlTab = params.get("tab");

  // Ambil default tab dari data attribute body
  const defaultTab = document.body.dataset.defaultTab || "default-tab-id";

  // Tentukan tab yang akan ditampilkan
  const activeTab = urlTab ? `transaction-${urlTab}` : defaultTab;

  // Tampilkan tab
  showTab(activeTab);

  // Jika tab yang aktif adalah ai-scan, jalankan generateInvoiceNumber
  if (activeTab === "ai-scan") {
    generateInvoiceNumber();
  }

  // Atur dark mode
  const savedMode = localStorage.getItem("darkMode") === "enabled";
  setTheme(savedMode);

  // Tampilkan invoice cards jika ada
  renderInvoiceCards();
});

document.addEventListener("DOMContentLoaded", () => {
  renderInvoiceCards();
});
