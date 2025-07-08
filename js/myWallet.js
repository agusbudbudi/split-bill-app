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
    const bankSection = document.querySelector(".bank-section");
    const ewalletContainer = document.getElementById("ewalletCards");
    const ewalletSection = document.querySelector(".ewallet-section");
    const emptyState = document.querySelector(".no-data-message");

    // Pisahkan bank dan e-wallet
    const banks = this.paymentMethods.filter(
      (method) => method.method === "banktransfer"
    );
    const ewallets = this.paymentMethods.filter(
      (method) => method.method !== "banktransfer"
    );

    // Render bank cards
    if (banks.length === 0) {
      bankSection.classList.add("hidden");
      bankContainer.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-university"></i>
          <h3>Belum ada rekening bank</h3>
          <p>Tambahkan rekening bank untuk memudahkan transaksi</p>
        </div>
      `;
    } else {
      bankSection.classList.remove("hidden");
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
      ewalletSection.classList.add("hidden");
      ewalletContainer.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-mobile-alt"></i>
                            <h3>Belum ada e-wallet</h3>
                            <p>Tambahkan e-wallet untuk pembayaran digital</p>
                        </div>
                    `;
    } else {
      ewalletSection.classList.remove("hidden");
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
    // ✅ Tampilkan no-data-message hanya jika kedua-duanya kosong
    if (banks.length === 0 && ewallets.length === 0) {
      emptyState.classList.remove("hidden");
    } else {
      emptyState.classList.add("hidden");
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

    // Tambahkan URL halaman di akhir
    message += `\n\n🔗 Simpan metode pembayaran di sini:\nhttps://agusbudbudi.github.io/split-bill-app/myWallet.html`;

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

    let message = `🏦 *Daftar Rekening Bank*\n\n`;
    message += `Berikut adalah daftar rekening bank yang tersedia:\n\n`;

    banks.forEach((bank, index) => {
      message += `${index + 1}. 🏦 *${bank.bankName}*\n`;
      message += `   👤 ${bank.name}\n`;
      message += `   💳 ${bank.accountNumber}\n\n`;
    });

    message += `Silakan transfer ke salah satu rekening di atas. Terima kasih! 🙏`;
    // Tambahkan URL halaman di akhir
    message += `\n\n🔗 Simpan metode pembayaran di sini:\nhttps://agusbudbudi.github.io/split-bill-app/myWallet.html`;

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

    let message = `📱 *Daftar E-Wallet*\n\n`;
    message += `Berikut adalah daftar e-wallet yang tersedia:\n\n`;

    ewallets.forEach((ewallet, index) => {
      message += `${index + 1}. 📱 *${ewallet.method.toUpperCase()}*\n`;
      message += `   👤 ${ewallet.name}\n`;
      message += `   📞 ${ewallet.phoneNumber}\n\n`;
    });

    message += `Pilih yang paling mudah untuk Anda! Terima kasih! 🙏`;
    // Tambahkan URL halaman di akhir
    message += `\n\n🔗 Simpan metode pembayaran di sini:\nhttps://agusbudbudi.github.io/split-bill-app/myWallet.html`;

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
