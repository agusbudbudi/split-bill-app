const toggle = document.getElementById("themeSwitch");

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
