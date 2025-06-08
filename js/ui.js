const toggle = document.getElementById("themeSwitch");

//show popup informasi
function openInfoPopup() {
  document.getElementById("infoPopup").style.display = "flex";
}

function closeInfoPopup() {
  document.getElementById("infoPopup").style.display = "none";
}

function setTheme(isDark) {
  document.body.classList.toggle("dark-mode", isDark);
  toggle.checked = isDark;
  localStorage.setItem("darkMode", isDark ? "enabled" : "disabled");
}

// Toggle event
toggle.addEventListener("change", function () {
  setTheme(this.checked);
});

// Load saved preference on page load
window.addEventListener("DOMContentLoaded", () => {
  const savedMode = localStorage.getItem("darkMode") === "enabled";
  setTheme(savedMode);
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
