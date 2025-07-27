//Remove Payment
function removePayment(index) {
  if (confirm("Yakin ingin menghapus metode ini?")) {
    paymentMethods.splice(index, 1);
    localStorage.setItem("paymentMethods", JSON.stringify(paymentMethods));

    try {
      renderCards(); // jika error, akan ditangkap
    } catch (e) {
      console.error("Gagal menjalankan renderCards:", e);
    }

    // ini tetap dijalankan meskipun renderCards error
    renderPaymentCards();

    showToast("Metode pembayaran berhasil dihapus", "success", 5000);
  }
}

//Back FUnction
function goBack() {
  // Redirect to main page or use history.back()
  window.history.back();
}

//Format to IDR
function formatToIDR(number) {
  // Ubah pengecekan ini
  if (number === null || number === undefined || number === "") {
    return "";
  }

  const isNegative = parseFloat(number) < 0;
  const absolute = Math.abs(parseFloat(number));

  // Pastikan 0 tetap diproses jika absolute menjadi NaN karena input non-angka
  // Tambahkan pengecekan jika after parseFloat, number menjadi NaN, kembalikan Rp0
  if (isNaN(absolute)) {
    return "Rp0";
  }

  const formatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(absolute);

  return isNegative ? `- ${formatted}` : formatted;
}

//Automatically format currency when user input
function setupCurrencyFormatter(formattedInputId, hiddenInputId) {
  const formattedInput = document.getElementById(formattedInputId);
  const hiddenInput = document.getElementById(hiddenInputId);

  if (!formattedInput || !hiddenInput) return;

  formattedInput.addEventListener("input", () => {
    let inputValue = formattedInput.value;

    if (inputValue === "-") {
      hiddenInput.value = "";
      return;
    }

    const isNegative = inputValue.trim().startsWith("-");
    let numericOnly = inputValue.replace(/[^0-9]/g, "");
    if (numericOnly === "") {
      hiddenInput.value = "";
      formattedInput.value = isNegative ? "-" : "";
      return;
    }

    if (isNegative) numericOnly = "-" + numericOnly;

    hiddenInput.value = numericOnly;
    formattedInput.value = formatToIDR(numericOnly);
    // <<< Tambahkan baris ini supaya calculateAmount terpanggil
    hiddenInput.dispatchEvent(new Event("change"));
  });
}

/**
 * Clean a price string by removing any non-numeric characters and converting
 * it to a number. If the input string is empty or null, return 0.
 *
 * @param {string} priceStr The price string to clean
 * @returns {number} The cleaned price number
 */
function cleanPriceString(priceStr) {
  if (!priceStr) return 0;
  // Remove currency symbols, commas, dots used as thousand separators
  // Handle formats like: 43,000 or 43.000 or Rp 43,000
  return parseInt(priceStr.toString().replace(/[^\d]/g, "")) || 0;
}
