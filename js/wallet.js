// Data storage (using variables instead of localStorage for Claude.ai compatibility)
let bankData = [];
let ewalletData = [];

// Bank and e-wallet logos/colors
const bankLogos = {
  BCA: { color: "#0066cc", logo: "🏦" },
  Mandiri: { color: "#ffcc00", logo: "🏛️" },
  BNI: { color: "#ff6600", logo: "🏢" },
  BRI: { color: "#003d7a", logo: "🏪" },
  "CIMB Niaga": { color: "#dc143c", logo: "🏬" },
  Danamon: { color: "#4169e1", logo: "🏭" },
  Permata: { color: "#228b22", logo: "💎" },
  BTN: { color: "#ff4500", logo: "🏠" },
};

const ewalletLogos = {
  GoPay: { color: "#00aa13", logo: "🛵" },
  OVO: { color: "#4c2c92", logo: "💜" },
  DANA: { color: "#118eea", logo: "💙" },
  ShopeePay: { color: "#ee4d2d", logo: "🛍️" },
  LinkAja: { color: "#e31e24", logo: "🔗" },
  Jenius: { color: "#00d4ff", logo: "⚡" },
};

// Tab switching
function switchTab(tab) {
  const tabs = document.querySelectorAll(".tab");
  const contents = document.querySelectorAll(".tab-content");

  tabs.forEach((t) => t.classList.remove("active"));
  contents.forEach((c) => c.classList.remove("active"));

  document
    .querySelector(`[onclick="switchTab('${tab}')"]`)
    .classList.add("active");
  document.getElementById(`${tab}-content`).classList.add("active");
}

// Show notification
function showNotification(message) {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.classList.add("show");
  setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
}

// Add bank
document.getElementById("bank-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const bank = {
    id: Date.now(),
    name: document.getElementById("bank-name").value,
    owner: document.getElementById("account-owner").value,
    number: document.getElementById("account-number").value,
    type: "bank",
  };

  bankData.push(bank);
  renderBankList();
  this.reset();
  showNotification("Bank berhasil ditambahkan! 🎉");
});

// Add e-wallet
document
  .getElementById("ewallet-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const ewallet = {
      id: Date.now(),
      name: document.getElementById("ewallet-name").value,
      owner: document.getElementById("ewallet-owner").value,
      phone: document.getElementById("phone-number").value,
      type: "ewallet",
    };

    ewalletData.push(ewallet);
    renderEwalletList();
    this.reset();
    showNotification("E-Wallet berhasil ditambahkan! 🎉");
  });

// Render bank list
function renderBankList() {
  const container = document.getElementById("bank-list");

  if (bankData.length === 0) {
    container.innerHTML = `
              <div class="empty-state">
                  <span>🏦</span>
                  <p>Belum ada data bank</p>
              </div>
          `;
    return;
  }

  container.innerHTML = bankData
    .map((bank) => {
      const bankInfo = bankLogos[bank.name] || {
        color: "#666",
        logo: "🏦",
      };
      return `
              <div class="wallet-item">
                  <div class="wallet-header">
                      <div class="wallet-logo" style="background: ${bankInfo.color}">
                          ${bankInfo.logo}
                      </div>
                      <div class="wallet-info">
                          <h3>${bank.name}</h3>
                          <p>Bank Account</p>
                      </div>
                  </div>
                  <div class="wallet-details">
                      <div class="wallet-detail">
                          <span>Pemilik:</span>
                          <span>${bank.owner}</span>
                      </div>
                      <div class="wallet-detail">
                          <span>No. Rekening:</span>
                          <span>${bank.number}</span>
                      </div>
                  </div>
                  <div class="wallet-actions">
                      <button class="btn-small btn-copy" onclick="copyBankData(${bank.id})">📋 Copy</button>
                      <button class="btn-small btn-share" onclick="shareBankData(${bank.id})">📤 Share</button>
                      <button class="btn-small btn-delete" onclick="deleteBank(${bank.id})">🗑️ Hapus</button>
                  </div>
              </div>
          `;
    })
    .join("");
}

// Render e-wallet list
function renderEwalletList() {
  const container = document.getElementById("ewallet-list");

  if (ewalletData.length === 0) {
    container.innerHTML = `
              <div class="empty-state">
                  <span>📱</span>
                  <p>Belum ada data e-wallet</p>
              </div>
          `;
    return;
  }

  container.innerHTML = ewalletData
    .map((ewallet) => {
      const ewalletInfo = ewalletLogos[ewallet.name] || {
        color: "#666",
        logo: "📱",
      };
      return `
              <div class="wallet-item">
                  <div class="wallet-header">
                      <div class="wallet-logo" style="background: ${ewalletInfo.color}">
                          ${ewalletInfo.logo}
                      </div>
                      <div class="wallet-info">
                          <h3>${ewallet.name}</h3>
                          <p>E-Wallet</p>
                      </div>
                  </div>
                  <div class="wallet-details">
                      <div class="wallet-detail">
                          <span>Pemilik:</span>
                          <span>${ewallet.owner}</span>
                      </div>
                      <div class="wallet-detail">
                          <span>No. HP:</span>
                          <span>${ewallet.phone}</span>
                      </div>
                  </div>
                  <div class="wallet-actions">
                      <button class="btn-small btn-copy" onclick="copyEwalletData(${ewallet.id})">📋 Copy</button>
                      <button class="btn-small btn-share" onclick="shareEwalletData(${ewallet.id})">📤 Share</button>
                      <button class="btn-small btn-delete" onclick="deleteEwallet(${ewallet.id})">🗑️ Hapus</button>
                  </div>
              </div>
          `;
    })
    .join("");
}

// Copy bank data
function copyBankData(id) {
  const bank = bankData.find((b) => b.id === id);
  const text = `🏦 ${bank.name}\n👤 ${bank.owner}\n💳 ${bank.number}`;

  navigator.clipboard.writeText(text).then(() => {
    showNotification("Data bank berhasil disalin! 📋");
  });
}

// Copy e-wallet data
function copyEwalletData(id) {
  const ewallet = ewalletData.find((e) => e.id === id);
  const text = `📱 ${ewallet.name}\n👤 ${ewallet.owner}\n📞 ${ewallet.phone}`;

  navigator.clipboard.writeText(text).then(() => {
    showNotification("Data e-wallet berhasil disalin! 📋");
  });
}

// Share bank data to WhatsApp
function shareBankData(id) {
  const bank = bankData.find((b) => b.id === id);
  const message =
    `🏦 *Info Bank*\n\n` +
    `Bank: ${bank.name}\n` +
    `Pemilik: ${bank.owner}\n` +
    `No. Rekening: ${bank.number}`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank");
}

// Share e-wallet data to WhatsApp
function shareEwalletData(id) {
  const ewallet = ewalletData.find((e) => e.id === id);
  const message =
    `📱 *Info E-Wallet*\n\n` +
    `E-Wallet: ${ewallet.name}\n` +
    `Pemilik: ${ewallet.owner}\n` +
    `No. HP: ${ewallet.phone}`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank");
}

// Share all e-wallets to WhatsApp
function shareAllEwallets() {
  if (ewalletData.length === 0) {
    showNotification("Belum ada data e-wallet untuk dibagikan! 😅");
    return;
  }

  let message = `💰 *Koleksi E-Wallet Saya* 💰\n\n`;
  message += `Hey! Ini semua e-wallet yang bisa dipake buat transfer ke aku ya~ 💖\n\n`;

  ewalletData.forEach((ewallet, index) => {
    message += `${index + 1}. 📱 *${ewallet.name}*\n`;
    message += `   👤 ${ewallet.owner}\n`;
    message += `   📞 ${ewallet.phone}\n\n`;
  });

  message += `Pilih yang paling gampang aja! Thanks ya~ 🥰✨`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank");
}

// Delete bank
function deleteBank(id) {
  if (confirm("Yakin ingin menghapus data bank ini?")) {
    bankData = bankData.filter((b) => b.id !== id);
    renderBankList();
    showNotification("Data bank berhasil dihapus! 🗑️");
  }
}

// Delete e-wallet
function deleteEwallet(id) {
  if (confirm("Yakin ingin menghapus data e-wallet ini?")) {
    ewalletData = ewalletData.filter((e) => e.id !== id);
    renderEwalletList();
    showNotification("Data e-wallet berhasil dihapus! 🗑️");
  }
}

// Initialize app
renderBankList();
renderEwalletList();

// Sample data (biasanya dari localStorage)
const sampleData = [
  {
    method: "ovo",
    name: "Agus Budiman",
    accountNumber: "",
    bankName: "",
    phoneNumber: "085559496900",
  },
  {
    method: "gopay",
    name: "Agus Budiman",
    accountNumber: "",
    bankName: "",
    phoneNumber: "085559496968",
  },
  {
    method: "banktransfer",
    name: "Agus Budiman",
    accountNumber: "12345432",
    bankName: "BCA",
    phoneNumber: "",
  },
];

// Inisialisasi data (dalam aplikasi nyata, ambil dari localStorage)
let paymentMethods = sampleData;

// Logo mapping
const logoMapping = {
  bca: "BCA",
  mandiri: "MANDIRI",
  bri: "BRI",
  bni: "BNI",
  ovo: "OVO",
  gopay: "GOPAY",
  dana: "DANA",
};

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function copyToClipboard(text, label) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      showToast(`${label} berhasil disalin!`);
    })
    .catch(() => {
      showToast("Gagal menyalin ke clipboard");
    });
}

function shareToWhatsApp(method) {
  let message = `*Detail Pembayaran*\n\n`;
  message += `📋 *Nama:* ${method.name}\n`;

  if (method.method === "banktransfer") {
    message += `🏦 *Bank:* ${method.bankName}\n`;
    message += `💳 *No. Rekening:* ${method.accountNumber}`;
  } else {
    message += `📱 *E-Wallet:* ${method.method.toUpperCase()}\n`;
    message += `📞 *No. HP:* ${method.phoneNumber}`;
  }

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank");
}

function deletePaymentMethod(index, type) {
  if (confirm("Apakah Anda yakin ingin menghapus metode pembayaran ini?")) {
    const filteredData = paymentMethods.filter((method, i) => {
      if (type === "bank") {
        return !(
          method.method === "banktransfer" &&
          method.bankName &&
          method.accountNumber
        );
      } else {
        return !(method.method !== "banktransfer" && method.phoneNumber);
      }
    });

    // Dalam aplikasi nyata, update localStorage di sini
    // localStorage.setItem('paymentMethods', JSON.stringify(filteredData));

    showToast("Metode pembayaran berhasil dihapus!");
    renderCards(); // Re-render cards
  }
}

function createCard(method, index, type) {
  const isBank = method.method === "banktransfer";
  const logoClass = isBank
    ? `${method.bankName.toLowerCase()}-logo`
    : `${method.method}-logo`;
  const logoText = isBank
    ? method.bankName
    : logoMapping[method.method] || method.method.toUpperCase();

  return `
        <div class="wallet-item">
            <div class="wallet-header">
                <div class="bank-logo ${logoClass}">
                    ${logoText}
                </div>
                  <div class="wallet-info">
                 <div class="bank-name">${
                   isBank ? method.bankName : method.method.toUpperCase()
                 }</div>
                <div class="account-type">${
                  isBank ? "Bank Account" : "E-Wallet"
                }</div>
                </div>
            </div>
              <div class="wallet-details">
                    <div class="detail-row">
                        <span class="detail-label">Nama Pemilik:</span>
                        <span class="detail-value">${method.name}</span>
                    </div>
                    ${
                      isBank
                        ? `
                        <div class="detail-row">
                            <span class="detail-label">No. Rekening:</span>
                            <span class="detail-value">${method.accountNumber}</span>
                        </div>
                    `
                        : `
                        <div class="detail-row">
                            <span class="detail-label">No. HP:</span>
                            <span class="detail-value">${method.phoneNumber}</span>
                        </div>
                    `
                    }
            </div>
              <div class="card-actions">
                    <button class="action-btn copy-btn" onclick="copyToClipboard('${
                      isBank ? method.accountNumber : method.phoneNumber
                    }', '${isBank ? "Nomor rekening" : "Nomor HP"}')">
                        📋
                    </button>
                    <button class="action-btn share-btn" onclick="shareToWhatsApp(${JSON.stringify(
                      method
                    ).replace(/"/g, "&quot;")})">
                        📤
                    </button>
                    <button class="action-btn delete-btn" onclick="deletePaymentMethod(${index}, '${type}')">
                        🗑️
                    </button>
                     <button onclick="removePayment(${index})" class="delete-top-right"><i class="uil uil-trash"></i></button>
                    
                </div>
        </div>
    `;
}

function renderCards() {
  const bankCards = document.getElementById("bank-cards");
  const ewalletCards = document.getElementById("ewallet-cards");

  // Clear existing cards
  bankCards.innerHTML = "";
  ewalletCards.innerHTML = "";

  // Filter and render bank accounts
  const bankMethods = paymentMethods.filter(
    (method) => method.method === "banktransfer"
  );
  bankMethods.forEach((method, index) => {
    bankCards.innerHTML += createCard(method, index, "bank");
  });

  // Filter and render e-wallets
  const ewalletMethods = paymentMethods.filter(
    (method) => method.method !== "banktransfer"
  );
  ewalletMethods.forEach((method, index) => {
    ewalletCards.innerHTML += createCard(method, index, "ewallet");
  });

  // Show message if no cards
  if (bankMethods.length === 0) {
    bankCards.innerHTML =
      '<div style="color: rgba(255,255,255,0.7); text-align: center; padding: 40px;">Belum ada rekening bank yang tersimpan</div>';
  }

  if (ewalletMethods.length === 0) {
    ewalletCards.innerHTML =
      '<div style="color: rgba(255,255,255,0.7); text-align: center; padding: 40px;">Belum ada e-wallet yang tersimpan</div>';
  }
}

// Initialize the app
document.addEventListener("DOMContentLoaded", function () {
  // Dalam aplikasi nyata, ambil data dari localStorage:
  const storedData = localStorage.getItem("paymentMethods");
  if (storedData) {
    paymentMethods = JSON.parse(storedData);
  }

  renderCards();
});
