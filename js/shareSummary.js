function shareToWhatsApp() {
  const activityName =
    document.getElementById("activityName").value || "Tanpa Nama Aktivitas";
  const date = new Date().toLocaleDateString("id-ID");

  // Ambil list item
  const itemRows = document.querySelectorAll("#itemTable tbody tr");
  let itemList = "";
  itemRows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    const item = cells[0].innerText;
    const amount = cells[1].innerText;
    const who = cells[2].innerText;
    const paidBy = cells[3].innerText;
    itemList += `- ${item} (${amount}) | Hutang: ${who} | Dibayar oleh: ${paidBy}\n`;
  });

  // Ambil transfer summary
  const summaryRows = document.querySelectorAll("#summaryTable tbody tr");
  let transferSummary = "";
  summaryRows.forEach((row) => {
    const name = row.children[0].innerText.trim();
    const ringkasan = row.children[4].innerText.trim();

    // Hanya tambahkan jika ringkasan tidak kosong dan bukan default
    if (ringkasan && ringkasan !== "Kamu tidak punya hutang") {
      transferSummary += `- *${name}*: ${ringkasan}\n`;
    }
  });

  // Ambil selected payment method
  const selectedCard = document.querySelector(".payment-card.selected");
  let paymentText = "Tidak ada";

  if (selectedCard) {
    const imgSrc = selectedCard.querySelector("img")?.getAttribute("src") || "";
    const methodMatch = imgSrc.match(/\/?([^\/]+)\.png$/); // ambil nama file tanpa .png
    const method = methodMatch ? methodMatch[1] : "Tidak diketahui";
    const methodFormatted = method.charAt(0).toUpperCase() + method.slice(1); // Kapitalisasi

    const name =
      selectedCard.querySelector("p:nth-of-type(1)")?.innerText || "";
    const secondLine =
      selectedCard.querySelector("p:nth-of-type(2)")?.innerText || "";
    const thirdLine =
      selectedCard.querySelector("p:nth-of-type(3)")?.innerText || "";

    if (method === "banktransfer") {
      const accountNumber = secondLine.replace("Rek: ", "");
      const bankName = thirdLine.replace("Bank: ", "");
      paymentText = `- ${name} (${methodFormatted} - ${bankName}, No Rek: *${accountNumber}*)`;
    } else {
      paymentText = `- ${name} (${methodFormatted}, *${secondLine}*)`;
    }
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
