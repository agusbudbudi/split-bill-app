function showSection(sectionName, element = null) {
  // Sembunyikan semua section
  document.querySelectorAll(".section-content").forEach((sec) => {
    sec.style.display = "none";
  });

  // Tampilkan section yang dipilih
  const target = document.getElementById("section-" + sectionName);
  if (target) {
    target.style.display = "block";
    localStorage.setItem("activeSection", sectionName); // ← Tambah ini kalau mau simpan tiap klik menu
  }

  // Highlight menu aktif (opsional)
  document.querySelectorAll(".menu-circle").forEach((el) => {
    el.classList.remove("active");
  });
  if (element) {
    element.classList.add("active");
  }
}
