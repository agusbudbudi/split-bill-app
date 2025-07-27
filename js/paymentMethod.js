let paymentMethods = JSON.parse(localStorage.getItem("paymentMethods")) || [];
let selectedPaymentMethod = null;

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

  showToast("Metode pembayaran berhasil ditambahkan", "success", 3000);
}

/**
 * Render payment cards di semua container yang memiliki class "paymentCardsContainer".
 * Membuatkan kartu dari yang terbaru.
 * Pasang ulang event listener ke semua kartu.
 */
function renderPaymentCards() {
  const containers = document.querySelectorAll(".paymentCardsContainer");

  // Kosongkan semua container
  containers.forEach((container) => {
    container.innerHTML = "";
  });

  // Tampilkan dari yang terbaru
  [...paymentMethods].reverse().forEach((data, reversedIndex) => {
    // Dapatkan index asli dari data
    const index = paymentMethods.length - 1 - reversedIndex;
    const logo = getPaymentLogo(data.method);

    const cardHTML = `
      <div class="payment-card ${
        selectedPaymentIndexes.includes(index) ? "selected" : ""
      }" data-index="${index}">

        <div class="check-icon">
          <i class="fa-solid fa-check-circle"></i>
        </div>

        <div class="payment-card-header">
          <img src="${logo}" alt="${data.method}" class="payment-logo"/>
        </div>
        <div class="payment-card-content">
          <p>${data.name}</p>
          ${
            data.method === "banktransfer"
              ? `<p class="account-number">${data.accountNumber}</p><p>${data.bankName}</p>`
              : `<p class="account-number">${data.phoneNumber}</p>`
          }

          <button onclick="removePayment(${index})" class="delete-top-right"><i class="uil uil-trash"></i></button>
        </div>
      </div>
    `;

    // Tambahkan ke semua container
    containers.forEach((container) => {
      container.insertAdjacentHTML("beforeend", cardHTML);
    });
  });

  // Pasang ulang event listener ke semua kartu
  initCardSelection();
  updateCardSelection();
}

function getPaymentLogo(method) {
  const key = method.toLowerCase().replace(/\s/g, ""); // amanin dari spasi & kapital
  switch (key) {
    case "banktransfer":
      return "img/banktransfer.png";
    case "ovo":
      return "img/logo-ovo.png";
    case "gopay":
      return "img/logo-gopay.png";
    case "dana":
      return "img/logo-dana.png";
    case "shopeepay":
      return "img/logo-shopeepay.png";
    case "linkaja":
      return "img/logo-linkaja.png";
    default:
      return "img/default.png";
  }
}

let selectedPaymentIndexes = [];

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
    const logo = getPaymentLogo(selected.method);
    const name = selected.name;
    const details =
      selected.method === "banktransfer"
        ? `Rek: ${selected.accountNumber}<br>Bank: ${selected.bankName}`
        : `No HP: ${selected.phoneNumber}`;

    selectedDiv.innerHTML += `
      <div class="selected-payment-summary">
        <img src="${logo}" alt="${selected.method}" class="payment-logo"/>
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
