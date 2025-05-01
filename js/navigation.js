function showSection(section, element) {
  const sections = ["split", "collect", "daily", "invoice"];

  // Tampilkan section sesuai menu
  sections.forEach((sec) => {
    document.getElementById(`section-${sec}`).style.display =
      sec === section ? "block" : "none";
  });

  // Update menu aktif
  const menuCircles = document.querySelectorAll(".menu-circle");
  menuCircles.forEach((menu) => menu.classList.remove("active"));
  element.classList.add("active");
}
