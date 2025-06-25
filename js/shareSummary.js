function shareToWhatsApp() {
  const activityName =
    document.getElementById("activityName").value || "Tanpa Nama Aktivitas";
  const date = new Date().toLocaleDateString("id-ID");

  // Ambil list item (lebih rapi)
  const itemRows = document.querySelectorAll("#itemTable tbody tr");
  let itemList = "";

  itemRows.forEach((row) => {
    const cells = row.querySelectorAll("td");

    const item = cells[0]?.innerText.trim() || "";
    const amount = cells[1]?.innerText.trim().replace(/\s+/g, " ") || "";
    const who = cells[2]?.innerText.trim().replace(/\s+/g, " ") || "";
    const paidBy = cells[3]?.innerText.trim().replace(/\s+/g, " ") || "";

    itemList += `- ${item} (${amount}) | Hutang: ${who} | Dibayar oleh: ${paidBy}\n`;
  });

  // Ambil transfer summary dari card versi baru
  const userCards = document.querySelectorAll(".user-card");
  let transferSummary = "";

  userCards.forEach((card) => {
    const name = card.querySelector("h2")?.innerText.trim() || "";
    const transferInfo =
      card.querySelector(".user-transfers p")?.innerText.trim() || "";

    // Hanya tambahkan jika info bermakna dan bukan default
    if (
      transferInfo &&
      !transferInfo.toLowerCase().includes("tidak punya hutang") &&
      !transferInfo.toLowerCase().includes("seimbang")
    ) {
      transferSummary += `- *${name}*: ${transferInfo}\n`;
    }
  });

  // Ambil semua kartu yang dipilih
  const selectedCards = document.querySelectorAll(".payment-card.selected");
  let paymentText = "Tidak ada";

  if (selectedCards.length > 0) {
    const texts = [];

    selectedCards.forEach((card) => {
      const imgSrc = card.querySelector("img")?.getAttribute("src") || "";
      const methodMatch = imgSrc.match(/\/?([^\/]+)\.png$/); // nama file dari logo
      const method = methodMatch ? methodMatch[1] : "Tidak diketahui";
      const methodFormatted = method.charAt(0).toUpperCase() + method.slice(1);

      const name = card.querySelector("p:nth-of-type(1)")?.innerText || "";
      const secondLine =
        card.querySelector("p:nth-of-type(2)")?.innerText || "";
      const thirdLine = card.querySelector("p:nth-of-type(3)")?.innerText || "";

      if (method === "banktransfer") {
        const accountNumber = secondLine.replace("Rek: ", "");
        const bankName = thirdLine.replace("Bank: ", "");
        texts.push(
          `- ${name} (${methodFormatted} - ${bankName}, No Rek: *${accountNumber}*)`
        );
      } else {
        texts.push(`- ${name} (${methodFormatted}, *${secondLine}*)`);
      }
    });

    paymentText = texts.join("\n");
  }

  const message = `*🧾 Split Bill - Simplified*

Hai guys! Ini bill untuk *${activityName}*
📅 Tanggal: *${date}*

🛍️ *Daftar Item:*
${itemList}
📊 *Ringkasan Pembayaran:*
${transferSummary}
📥 *Metode Pembayaran:*
${paymentText}

🔗 https://agusbudbudi.github.io/split-bill-app/
_Dibuat dengan Split Bill App_`;

  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    message
  )}`;
  window.open(url, "_blank");
}

// share collect money to whatsApp
function shareCollectMoneyToWhatsApp() {
  const date = new Date().toLocaleDateString("id-ID");

  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

  // Ambil list item dan hitung total amount dari tabel collectMoneyTable
  const itemRows = document.querySelectorAll("#collectMoneyTable tbody tr");
  let itemList = "";
  let totalAmount = 0;

  itemRows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    const itemName = cells[1].innerText;
    const amountText = cells[2].innerText;
    const method = cells[3].innerText;

    const amount = parseFloat(amountText.replace(/[^\d]/g, "")); // Bersihkan 'Rp', titik, dll
    totalAmount += amount;

    itemList += `- ${itemName} (${formatter.format(
      amount
    )}) | Metode: ${method}\n`;
  });

  // Ambil payment method summary
  let paymentText = "Tidak ada";
  const methodCards = document.querySelectorAll(
    "#methodSummaryCards .method-card"
  );

  if (methodCards.length > 0) {
    const paymentMethods = [];
    methodCards.forEach((card) => {
      const methodName =
        card.querySelector(".method-name")?.innerText || "Tidak diketahui";
      const methodTotalText =
        card.querySelector(".method-total")?.innerText || "Rp 0";
      const methodTotal = parseFloat(methodTotalText.replace(/[^\d]/g, ""));

      paymentMethods.push(
        `- ${methodName}: *${formatter.format(methodTotal)}*`
      );
    });
    paymentText = paymentMethods.join("\n");
  }

  // Format message untuk WhatsApp
  const message = `*🧾 Split Bill - Simplified*

Hai guys! Ini laporan Collect Money
📅 Tanggal: *${date}*

💸 *Daftar Item:*
${itemList}
💰 *Total Amount:*
*${formatter.format(totalAmount)}*

📥 *Metode Pembayaran:*
${paymentText}

🔗 https://agusbudbudi.github.io/split-bill-app/
_Dibuat dengan Split Bill App_`;

  // WhatsApp URL format untuk share pesan
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    message
  )}`;

  // Buka WhatsApp dengan pesan yang telah dipersiapkan
  window.open(url, "_blank");
}

function shareAppToWhatsApp() {
  const message =
    `🚀 *Cobain Aplikasi Split Bill!* \n\n` +
    `💸 *Fitur lengkap:*\n` +
    `- Split Bill\n` +
    `- Tabungan Personal\n` +
    `- Invoice Praktis\n` +
    `- Dompet Digital\n\n` +
    `📲 Yuk pakai sekarang:\n https://agusbudbudi.github.io/split-bill-app/`;

  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    message
  )}`;
  window.open(url, "_blank");
}
