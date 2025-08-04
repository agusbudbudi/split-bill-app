/**
 * Menghapus data metode pembayaran pada indeks yang ditentukan.
 * Jika user mengkonfirmasi, maka data akan dihapus, localStorage akan diupdate,
 * dan tabel metode pembayaran akan dirender ulang.
 * @param {number} index - indeks data yang ingin dihapus
 */
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

/**
 * Redirects to the main page by using the `history.back()` method.
 *
 * @since 1.0.0
 */
function goBack() {
  // Redirect to main page or use history.back()
  window.history.back();
}

/**
 * Formats a given number to Indonesian Rupiah (IDR) currency format.
 *
 * @param {number|string} number - The numeric value to format. Can be a number or a string representation of a number.
 * @returns {string} The formatted currency string in IDR. Returns "Rp0" for invalid inputs or zero, and an empty string for null or undefined inputs.
 *
 * The function handles negative numbers by prefixing them with "- ".
 * It ensures proper handling of non-numeric inputs and returns "Rp0" if parsing results in NaN.
 */

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

/**
 * Setup currency formatter for given input elements.
 *
 * This function sets up two input elements (a formatted input and a hidden input)
 * to work together. The formatted input shows the currency formatted value, and
 * the hidden input holds the actual numeric value. When the user types into the
 * formatted input, this function will convert the value to a numeric only value
 * and store it in the hidden input. The formatted input will then be updated
 * with the formatted currency value.
 *
 * @param {string} formattedInputId the id of the input element to show the
 *        formatted value
 * @param {string} hiddenInputId the id of the input element to store the
 *        actual numeric value
 */
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

/**
 * Format a date string into a short date string format suitable for display.
 *
 * The resulting format is "dd MMM yyyy", e.g. "12 Jan 2022".
 *
 * @param {string} dateString The date string to format
 * @returns {string} The formatted date string
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
