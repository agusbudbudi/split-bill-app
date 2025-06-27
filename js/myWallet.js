// Shared utility class untuk menghindari konflik dengan paymentMethod.js
class WalletRenderer {
  constructor() {
    this.paymentMethods = this.loadPaymentMethods();
    this.init();
  }

  loadPaymentMethods() {
    // Coba ambil dari localStorage
    const stored = localStorage.getItem("paymentMethods");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.warn("Gagal parse paymentMethods dari localStorage:", e);
        return [];
      }
    }
    // Kembalikan array kosong jika tidak ada data
    return [];
  }

  init() {
    this.renderWalletCards();
    this.updateStats();
  }

  //Get Paymeny Logo on the Card
  getPaymentLogo(method, bankName = "") {
    const key = method.toLowerCase().replace(/\s/g, "");
    const isBank = key === "banktransfer";
    const bankKey = bankName.toLowerCase().replace(/\s/g, "");

    const logoMap = {
      bca: { text: "BCA", image: "img/bca.png" },
      mandiri: { text: "Mandiri", image: "img/mandiri.png" },
      bni: { text: "BNI", image: "img/bni.png" },
      bri: { text: "BRI", image: "img/bri.png" },
      gopay: { text: "Gopay", image: "img/gopay.png" },
      ovo: { text: "OVO", image: "img/ovo.png" },
      dana: { text: "Dana", image: "img/dana.png" },
      shopeepay: { text: "ShpeePay", image: "img/shopeepay.png" },
      linkaja: { text: "LinkAja", image: "img/linkaja.png" },
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

  //Create Wallet Card
  // createWalletCard(data, index) {
  //   const isBank = data.method === "banktransfer";
  //   const logo = this.getPaymentLogo(data.method, data.bankName); // returns { text, image, class }

  //   return `
  //     <div data-index="${index}">
  //       <div class="wallet-card ${isBank ? "bank-card" : "ewallet-card"}">
  //         <div class="card-header">
  //           <div class=" chip-icon">
  //             <img src="img/chip-icon.png" alt="chip-icon" class="chip-icon" />
  //           </div>
  //           <div class="payment-info">
  //             <h3>${logo.text}</h3>
  //             <div class="payment-type">${
  //               isBank ? "Bank Account" : "E-Wallet"
  //             }</div>
  //           </div>
  //         </div>

  //         <div class="card-details">
  //           ${
  //             isBank
  //               ? `<div class="detail-row">
  //                   <span class="detail-value account-number">${data.accountNumber}</span>
  //                 </div>`
  //               : `<div class="detail-row">
  //                   <span class="detail-value account-number">${data.phoneNumber}</span>
  //                 </div>`
  //           }

  //         </div>

  //        <div class="card-footer-logo">
  //         <div class="detail-row">
  //             <span class="detail-label">Nama Pemilik:</span>
  //             <span class="detail-value account-holder">${data.name}</span>
  //           </div>
  //           <div class="payment-logo ${logo.class}">
  //             <img src="${logo.image}" alt="${logo.text}" class="logo-img" />
  //           </div>
  //        </div>
  //       </div>

  //       <div class="card-actions">
  //         <button class="action-btn copy-btn" onclick="walletApp.copyToClipboard('${
  //           isBank ? data.accountNumber : data.phoneNumber
  //         }', '${isBank ? "Nomor rekening" : "Nomor HP"}')">
  //           <i class="uil uil-copy"></i>
  //         </button>
  //         <button class="action-btn share-btn" onclick="walletApp.shareToWhatsApp(${index})">
  //           <i class="uil uil-whatsapp"></i>
  //         </button>
  //         <button class="action-btn delete-btn" onclick="walletApp.deletePaymentMethod(${index})">
  //           <i class="uil uil-trash"></i>
  //         </button>
  //       </div>
  //     </div>
  //   `;
  // }

  createWalletCard(data, index) {
    const isBank = data.method === "banktransfer";
    const logo = this.getPaymentLogo(data.method, data.bankName); // returns { text, image, class }

    // Jika e-wallet, tampilkan versi e-wallet simple card
    if (!isBank) {
      return `
        <div data-index="${index}">
          <div class="wallet-card ewallet-simple-card">
            <div class="ewallet-logo">
              <img src="${logo.image}" alt="${logo.text}" class="logo-img" />
            </div>
            <div class="ewallet-details">
              <div class="detail-row">
                <span class="detail-value phone-number">${data.phoneNumber}</span>
              </div>
              <div class="detail-row">
                <span class="detail-value account-holder">${data.name}</span>
              </div>
            </div>
          </div>
  
          <div class="card-actions">
            <button class="action-btn copy-btn" onclick="walletApp.copyToClipboard('${data.phoneNumber}', 'Nomor HP')">
              <i class="uil uil-copy"></i>
            </button>
            <button class="action-btn share-btn" onclick="walletApp.shareToWhatsApp(${index})">
              <i class="uil uil-whatsapp"></i>
            </button>
            <button class="action-btn delete-btn" onclick="walletApp.deletePaymentMethod(${index})">
              <i class="uil uil-trash"></i>
            </button>
          </div>
        </div>
      `;
    }

    // Jika bank, gunakan desain lama
    return `
      <div data-index="${index}">
        <div class="wallet-card bank-card">
          <div class="card-header">
            <div class="chip-icon">
              <img src="img/chip-icon.png" alt="chip-icon" class="chip-icon" />
            </div>
            <div class="payment-info">
              <h3>${logo.text}</h3>
              <div class="payment-type">Bank Account</div>
            </div>
          </div>
          
          <div class="card-details">
            <div class="detail-row">
              <span class="detail-value account-number">${data.accountNumber}</span>
            </div>
          </div>
  
          <div class="card-footer-logo">
            <div class="detail-row">
              <span class="detail-label">Nama Pemilik:</span>
              <span class="detail-value account-holder">${data.name}</span>
            </div>
            <div class="payment-logo ${logo.class}">
              <img src="${logo.image}" alt="${logo.text}" class="logo-img" />
            </div>
          </div>
        </div>
        
        <div class="card-actions">
          <button class="action-btn copy-btn" onclick="walletApp.copyToClipboard('${data.accountNumber}', 'Nomor rekening')">
            <i class="uil uil-copy"></i>
          </button>
          <button class="action-btn share-btn" onclick="walletApp.shareToWhatsApp(${index})">
            <i class="uil uil-whatsapp"></i>
          </button>
          <button class="action-btn delete-btn" onclick="walletApp.deletePaymentMethod(${index})">
            <i class="uil uil-trash"></i>
          </button>
        </div>
      </div>
    `;
  }

  //Render Wallet Cards
  renderWalletCards() {
    const bankContainer = document.getElementById("bankCards");
    const ewalletContainer = document.getElementById("ewalletCards");

    // Pisahkan bank dan e-wallet
    const banks = this.paymentMethods.filter(
      (method) => method.method === "banktransfer"
    );
    const ewallets = this.paymentMethods.filter(
      (method) => method.method !== "banktransfer"
    );

    // Render bank cards
    if (banks.length === 0) {
      bankContainer.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-university"></i>
          <h3>Belum ada rekening bank</h3>
          <p>Tambahkan rekening bank untuk memudahkan transaksi</p>
        </div>
      `;
    } else {
      const staticBankImage = `

        <div class="static-bank-card">
          <h3><i class="uil uil-building wallet-icon"></i> Rekening Bank</h3>
          <p>Manage rekeningmu dalam satu tempat</p>
          <button class="share-all-btn" onclick="shareAllBanks()">
            <i class="uil uil-share"></i> Share
          </button>
        </div>
     
      `;

      const cardsHTML = banks
        .map((bank, index) => {
          const originalIndex = this.paymentMethods.indexOf(bank);
          return this.createWalletCard(bank, originalIndex);
        })
        .join("");

      bankContainer.innerHTML = cardsHTML + staticBankImage;
    }

    // Render e-wallet cards
    if (ewallets.length === 0) {
      ewalletContainer.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-mobile-alt"></i>
                            <h3>Belum ada e-wallet</h3>
                            <p>Tambahkan e-wallet untuk pembayaran digital</p>
                        </div>
                    `;
    } else {
      const staticImage = `

        <div class="static-ewallet-card">
        <h3><i class="uil uil-wallet wallet-icon"></i> E-Wallets</h3>
        <p>simpan semua e-wallet dalam satu tempat</p>
          <button class="share-all-btn" onclick="shareAllEwallets()">
              <i class="uil uil-share"></i> Share
          </button>
        </div>
    `;

      const cardsHTML = ewallets
        .map((ewallet, index) => {
          const originalIndex = this.paymentMethods.indexOf(ewallet);
          return this.createWalletCard(ewallet, originalIndex);
        })
        .join("");

      ewalletContainer.innerHTML = staticImage + cardsHTML;
    }
  }

  // Update stats Currently unused but not deleted
  updateStats() {
    const banks = this.paymentMethods.filter(
      (method) => method.method === "banktransfer"
    );
    const ewallets = this.paymentMethods.filter(
      (method) => method.method !== "banktransfer"
    );

    document.getElementById("bankCount").textContent = banks.length;
    document.getElementById("ewalletCount").textContent = ewallets.length;
    document.getElementById("totalCount").textContent =
      this.paymentMethods.length;
  }

  copyToClipboard(text, label) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showToast(`${label} berhasil disalin! 📋`, "success", 5000);
      })
      .catch(() => {
        showToast("Gagal menyalin ke clipboard", "error", 5000);
      });
  }

  shareToWhatsApp(index) {
    const method = this.paymentMethods[index];
    const isBank = method.method === "banktransfer";

    let message = `🏦 *Detail Pembayaran*\n\n`;
    message += `👤 *Nama:* ${method.name}\n`;

    if (isBank) {
      message += `🏦 *Bank:* ${method.bankName}\n`;
      message += `💳 *No. Rekening:* ${method.accountNumber}`;
    } else {
      message += `📱 *E-Wallet:* ${method.method.toUpperCase()}\n`;
      message += `📞 *No. HP:* ${method.phoneNumber}`;
    }

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, "_blank");
  }

  shareAllBanks() {
    const banks = this.paymentMethods.filter(
      (method) => method.method === "banktransfer"
    );

    if (banks.length === 0) {
      showToast("Belum ada rekening bank untuk dibagikan! 😅", "info", 5000);
      return;
    }

    let message = `🏦 *Koleksi Rekening Bank*\n\n`;
    message += `Berikut adalah daftar rekening bank yang tersedia:\n\n`;

    banks.forEach((bank, index) => {
      message += `${index + 1}. 🏦 *${bank.bankName}*\n`;
      message += `   👤 ${bank.name}\n`;
      message += `   💳 ${bank.accountNumber}\n\n`;
    });

    message += `Silakan transfer ke salah satu rekening di atas. Terima kasih! 🙏`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, "_blank");
  }

  shareAllEwallets() {
    const ewallets = this.paymentMethods.filter(
      (method) => method.method !== "banktransfer"
    );

    if (ewallets.length === 0) {
      showToast("Belum ada e-wallet untuk dibagikan! 😅", "info", 5000);
      return;
    }

    let message = `📱 *Koleksi E-Wallet*\n\n`;
    message += `Berikut adalah daftar e-wallet yang tersedia:\n\n`;

    ewallets.forEach((ewallet, index) => {
      message += `${index + 1}. 📱 *${ewallet.method.toUpperCase()}*\n`;
      message += `   👤 ${ewallet.name}\n`;
      message += `   📞 ${ewallet.phoneNumber}\n\n`;
    });

    message += `Pilih yang paling mudah untuk Anda! Terima kasih! 🙏`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, "_blank");
  }

  deletePaymentMethod(index) {
    if (confirm("Apakah Anda yakin ingin menghapus metode pembayaran ini?")) {
      this.paymentMethods.splice(index, 1);

      // Update localStorage
      localStorage.setItem(
        "paymentMethods",
        JSON.stringify(this.paymentMethods)
      );

      // Re-render
      this.renderWalletCards();
      this.updateStats();
      showToast("Metode pembayaran berhasil dihapus!", "success", 5000);
    }
  }

  // Method untuk refresh data (bisa dipanggil dari luar)
  refresh() {
    this.paymentMethods = this.loadPaymentMethods();
    this.renderWalletCards();
    this.updateStats();
  }
}

// Global functions untuk onclick handlers
function shareAllBanks() {
  walletApp.shareAllBanks();
}

function shareAllEwallets() {
  walletApp.shareAllEwallets();
}

// Initialize wallet app
let walletApp;
document.addEventListener("DOMContentLoaded", function () {
  walletApp = new WalletRenderer();
});

// Listen untuk perubahan localStorage dari halaman lain
window.addEventListener("storage", function (e) {
  if (e.key === "paymentMethods" && walletApp) {
    walletApp.refresh();
  }
});

window.addEventListener("DOMContentLoaded", function () {
  const ewalletContainer = document.getElementById("ewalletCards");

  // Tambahkan data dinamis
  dataList.forEach((data, index) => {
    ewalletContainer.insertAdjacentHTML(
      "beforeend",
      walletApp.createWalletCard(data, index)
    );
  });
});
