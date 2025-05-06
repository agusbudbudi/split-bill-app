//Open bottom sheet reusable function
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
