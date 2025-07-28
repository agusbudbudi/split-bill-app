let paymentMethods = JSON.parse(localStorage.getItem("paymentMethods")) || [];
let selectedPaymentMethod = null;
let selectedPaymentIndexes = [];

/**
 * Render the payment form based on the selected payment method.
 *
 * @param {string} selected the selected payment method.
 *
 * The form will be rendered with the following fields:
 * - Nama (required)
 * - Nomor Rekening (required) if the selected payment method is banktransfer
 * - Bank (required) if the selected payment method is banktransfer
 * - Nomor Telepon (required) if the selected payment method is not banktransfer
 */
function renderPaymentForm() {
  const selected = document.getElementById("paymentMethod").value;
  const container = document.getElementById("paymentDetailsForm");
  container.innerHTML = ""; // clear form

  if (!selected) return;

  let html = `<label>Nama</label><input type="text" id="payerName" required />`;

  if (selected === "banktransfer") {
    html += `
      <label>Nomor Rekening</label><input type="text" id="accountNumber" required />
      <label>Bank</label><input type="text" id="bankName" required />
    `;
  } else {
    html += `
      <label>Nomor Telepon</label><input type="text" id="phoneNumber" required />
    `;
  }

  container.innerHTML = html;
}

/**
 * Menampilkan/hide form metode pembayaran berdasarkan pilihan dari select box
 * @param {string} method - Nilai dari select box metode pembayaran
 */
function handlePaymentMethodChange() {
  const method = document.getElementById("paymentMethod").value;
  const bankForm = document.getElementById("bankForm");
  const ewalletForm = document.getElementById("ewalletForm");
  const detailsContainer = document.getElementById("paymentDetails");

  // Tampilkan container form
  detailsContainer.style.display = method ? "block" : "none";

  if (method === "BankTransfer") {
    bankForm.style.display = "block";
    ewalletForm.style.display = "none";
  } else if (
    ["OVO", "GoPay", "DANA", "ShopeePay", "LinkAja"].includes(method)
  ) {
    bankForm.style.display = "none";
    ewalletForm.style.display = "block";
  } else {
    bankForm.style.display = "none";
    ewalletForm.style.display = "none";
  }
}

/**
 * Tambahkan metode pembayaran baru ke dalam array paymentMethods dan simpan di localStorage.
 * Jika walletApp tersedia, maka akan refresh.
 * Jika tidak ada error, maka akan render ulang kartu metode pembayaran,
 * reset form dan field input, serta tutup bottom sheet.
 *
 * @returns {void}
 */
function addPaymentMethod() {
  const method = document.getElementById("paymentMethod").value.toLowerCase(); // <-- supaya konsisten lowercase

  // Ambil nilai input berdasarkan metode
  const accountNumber = document.getElementById("bankAccountNumber")?.value;
  const bankName = document.getElementById("bankName")?.value;
  const bankAccountName = document.getElementById("bankAccountName")?.value;
  const ewalletName = document.getElementById("ewalletName")?.value;
  const phoneNumber = document.getElementById("ewalletPhone")?.value;

  // Validasi input
  if (!method) {
    showToast("Silakan pilih metode pembayaran.", "error", 5000);
    return;
  }

  if (method === "banktransfer") {
    if (!bankAccountName || !accountNumber || !bankName) {
      showToast("Mohon lengkapi semua data Bank Transfer.", "error", 5000);
      return;
    }
  } else {
    if (!ewalletName || !phoneNumber) {
      showToast("Mohon lengkapi semua data eWallet.", "error", 5000);
      return;
    }
  }

  // Susun data berdasarkan metode
  const data = {
    method,
    name: method === "banktransfer" ? bankAccountName : ewalletName,
    accountNumber: accountNumber || "",
    bankName: bankName || "",
    phoneNumber: phoneNumber || "",
  };

  // Simpan ke array & localStorage
  paymentMethods.push(data);
  localStorage.setItem("paymentMethods", JSON.stringify(paymentMethods));

  // ✅ Panggil refresh jika walletApp tersedia
  if (typeof walletApp !== "undefined") {
    walletApp.refresh();
  }

  // Reset form dan render ulang kartu
  renderPaymentCards();

  document.getElementById("paymentDetailsForm").innerHTML = "";
  document.getElementById("paymentMethod").value = "";

  // Reset field input
  document.getElementById("bankAccountNumber").value = "";
  document.getElementById("bankName").value = "";
  document.getElementById("bankAccountName").value = "";
  document.getElementById("ewalletName").value = "";
  document.getElementById("ewalletPhone").value = "";

  closeBottomSheet("addPaymentMethodBottomSheet");
  handlePaymentMethodChange();

  showToast("Metode pembayaran berhasil ditambahkan", "success", 3000);
}

/**
 * Renders payment cards for all payment methods stored in the application.
 * Clears existing card containers and populates them with cards representing
 * each payment method, including bank transfers and e-wallets.
 * Each card includes the payment method's logo, name, and relevant details
 * (account number and bank name for bank transfers, phone number for e-wallets).
 * Cards are marked as selected if they are part of the selected payment indexes.
 * Also initializes and updates card selection functionality.
 */

function renderPaymentCards() {
  const containers = document.querySelectorAll(".paymentCardsContainer");

  containers.forEach((container) => {
    container.innerHTML = "";
  });

  [...paymentMethods].reverse().forEach((data, reversedIndex) => {
    const index = paymentMethods.length - 1 - reversedIndex;
    const logoData = getPaymentLogo(data.method, data.bankName);

    const cardHTML = `
      <div class="payment-card ${
        selectedPaymentIndexes.includes(index) ? "selected" : ""
      }" data-index="${index}">
        <div class="check-icon">
          <i class="fa-solid fa-check-circle"></i>
        </div>

        <div class="payment-card-header">
          <img src="${logoData.image}" alt="${
      logoData.text
    }" class="payment-logo ${logoData.class}" />
        </div>
        
        <div class="payment-card-content">
          <p>${data.name}</p>
          ${
            data.method === "banktransfer"
              ? `<p class="account-number">${data.accountNumber}</p><p>${data.bankName}</p>`
              : `<p class="account-number">${data.phoneNumber}</p>`
          }

          <button onclick="removePayment(${index})" class="delete-top-right">
            <i class="uil uil-trash"></i>
          </button>
        </div>
      </div>
    `;

    containers.forEach((container) => {
      container.insertAdjacentHTML("beforeend", cardHTML);
    });
  });

  initCardSelection();
  updateCardSelection();
}

/**
 * Return an object containing the logo data for a given payment method and bank name
 * @param {string} method - The payment method (e.g. "Bank Transfer", "Gopay", etc.)
 * @param {string} [bankName=""] - The bank name (only required for "Bank Transfer")
 * @returns {Object} - An object containing the logo data: { text, image, class }
 */
function getPaymentLogo(method, bankName = "") {
  const key = method.toLowerCase().replace(/\s/g, "");
  const isBank = key === "banktransfer";
  const bankKey = bankName.toLowerCase().replace(/\s/g, "");

  const logoMap = {
    jenius: { text: "Jenius", image: "img/logo-jenius.png" },
    danamon: { text: "Danamon", image: "img/logo-danamon.png" },
    btn: { text: "BTN", image: "img/logo-btn.png" },
    permata: { text: "Permata", image: "img/logo-permata.png" },
    bca: { text: "BCA", image: "img/logo-bca.png" },
    mandiri: { text: "Mandiri", image: "img/logo-mandiri.png" },
    bni: { text: "BNI", image: "img/logo-bni.png" },
    bri: { text: "BRI", image: "img/logo-bri.png" },
    gopay: { text: "Gopay", image: "img/logo-gopay.png" },
    ovo: { text: "OVO", image: "img/logo-ovo.png" },
    dana: { text: "Dana", image: "img/logo-dana.png" },
    shopeepay: { text: "ShpeePay", image: "img/logo-shopeepay.png" },
    linkaja: { text: "LinkAja", image: "img/logo-linkaja.png" },
    bsi: { text: "BSI", image: "img/logo-bsi.png" },
  };

  let text, imagePath, logoClass;

  if (isBank) {
    const logoData = logoMap[bankKey];
    text = logoData?.text || bankName.toUpperCase() || "BANK";
    imagePath = logoData?.image || "img/banktransfer.png";
    logoClass = `logo-${bankKey || "bank"}`;
  } else {
    const logoData = logoMap[key];
    text = logoData?.text || method.toUpperCase();
    imagePath = logoData?.image || "img/default.png";
    logoClass = `logo-${key}`;
  }

  return {
    text,
    image: imagePath,
    class: logoClass,
  };
}

/**
 * Inits event listeners for payment cards, so that they can be selected/deselected
 * when clicked. Also updates the list of selected payment indexes and triggers
 * updates to the UI.
 */
function initCardSelection() {
  const cards = document.querySelectorAll(
    ".paymentCardsContainer .payment-card"
  );

  cards.forEach((card) => {
    const index = parseInt(card.getAttribute("data-index"));

    card.addEventListener("click", (e) => {
      // Hindari klik tombol hapus
      if (e.target.closest("button")) return;

      if (selectedPaymentIndexes.includes(index)) {
        selectedPaymentIndexes = selectedPaymentIndexes.filter(
          (i) => i !== index
        );
      } else {
        selectedPaymentIndexes.push(index);
      }

      updateCardSelection();
      showSelectedPayment();
      updateCalculateButton();
    });
  });
}

/**
 * Updates the UI for all payment cards by adding or removing the "selected" class
 * based on the current list of selected payment indexes.
 */
function updateCardSelection() {
  const cards = document.querySelectorAll(
    ".paymentCardsContainer .payment-card"
  );

  cards.forEach((card) => {
    const index = parseInt(card.getAttribute("data-index"));
    if (selectedPaymentIndexes.includes(index)) {
      card.classList.add("selected");
    } else {
      card.classList.remove("selected");
    }
  });
}

/**
 * Updates the "selected payment methods" section of the UI by populating it with
 * the currently selected payment methods. If no payment methods are selected,
 * the section is cleared.
 *
 * This function is called whenever a payment card is clicked, and also when the
 * app is initialized.
 */
function showSelectedPayment() {
  console.log(selectedPaymentIndexes);
  const selectedDiv = document.getElementById("selectedPaymentInfo");
  if (!selectedDiv) return;

  if (selectedPaymentIndexes.length === 0) {
    selectedDiv.innerHTML = "";
    return;
  }

  selectedDiv.innerHTML = `<h3>Metode Pembayaran</h3>`;

  selectedPaymentIndexes.forEach((index) => {
    const selected = paymentMethods[index];
    const logoData = getPaymentLogo(selected.method, selected.bankName);
    const name = selected.name;
    const details =
      selected.method === "banktransfer"
        ? `Rek: ${selected.accountNumber}<br>Bank: ${selected.bankName}`
        : `No HP: ${selected.phoneNumber}`;

    selectedDiv.innerHTML += `
      <div class="selected-payment-summary">
        <img src="${logoData.image}" alt="${logoData.text}" class="payment-logo ${logoData.class}"/>
        <p><strong>${name}</strong></p>
        <p>${details}</p>
      </div>
    `;
  });
}

// Load cards saat halaman dibuka
window.addEventListener("DOMContentLoaded", () => {
  renderPaymentCards();
});
