// Toast Message System
function showToast(message, type = "info", duration = 5000) {
  console.log("Showing toast:", message, type);

  // Buat elemen toast
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  // Buat konten toast
  toast.innerHTML = `
      ${type === "success" ? '<i class="fa-solid fa-circle-check"></i>' : ""}
      ${type === "error" ? '<i class="fa-solid fa-circle-xmark"></i>' : ""}
      ${type === "info" ? '<i class="fa-solid fa-circle-info"></i>' : ""}
      <span class="toast-content">${message}</span>
      <button class="toast-close" onclick="closeToast(this.parentElement)">×</button>
    `;

  // Tambahkan toast ke container
  const toastContainer = document.getElementById("toastContainer");
  toastContainer.appendChild(toast);

  // Paksa reflow agar animasi masuk bisa bekerja (trik penting)
  void toast.offsetHeight;

  // Tambahkan animasi masuk
  toast.style.opacity = "1";
  toast.style.transform = "translateY(0)";

  // Set timeout untuk menghapus toast setelah durasi tertentu
  const autoRemove = setTimeout(() => {
    closeToast(toast);
  }, duration);

  // Simpan ID timeout agar bisa dibatalkan kalau ditutup manual
  toast.dataset.timeoutId = autoRemove;

  return toast;
}

function closeToast(toast) {
  if (toast && toast.parentElement) {
    // Batalkan timeout jika masih aktif
    const timeoutId = toast.dataset.timeoutId;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Animasi keluar
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-20px)";

    // Hapus setelah animasi selesai (500ms)
    setTimeout(() => {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
    }, 100);
  }
}
