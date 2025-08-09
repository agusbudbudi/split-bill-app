/**
 * Gets the activity name from the input field. If the field is empty,
 * a default value of "Tanpa Nama Aktivitas" is returned.
 *
 * @return {string} The activity name.
 */
function getActivityName() {
  const input = document.getElementById("activityName");
  return input?.value.trim() || "Tanpa Nama Aktivitas";
}

/**
 * Generates a text summary of all expenses, including the item name, amount,
 * debtors, and the person who paid for the expense.
 *
 * @return {string} A string containing all the expense items, each on a new line.
 */
function getItemListText() {
  const expenseCards = document.querySelectorAll(".expense-card");
  const items = [];

  expenseCards.forEach((card) => {
    const itemName =
      card
        .querySelector(".expense-header span:first-child")
        ?.innerText.trim() || "Item Tidak Diketahui";
    const amount =
      card
        .querySelector(".expense-header span:last-child")
        ?.innerText.trim()
        .replace(/\s+/g, " ") || "-";

    // Ambil semua orang yang berhutang
    const debtors = Array.from(
      card.querySelectorAll(".label-row:first-of-type .avatar-name")
    ).map((el) => el.innerText.trim());

    // Ambil yang membayar
    const paidBy =
      card
        .querySelector(".label-row:last-of-type .avatar-name")
        ?.innerText.trim() || "Tidak Diketahui";

    const whoOwes = debtors.length > 0 ? debtors.join(", ") : "Tidak ada";

    items.push(
      `- ${itemName} (${amount}) | Hutang: ${whoOwes} | Dibayar oleh: ${paidBy}`
    );
  });

  return items.join("\n");
}

/**
 * Generates a summary text of transfers for each user.
 *
 * This function iterates over user cards and extracts the user's name
 * and their transfer information. If a user has no debt or the balance
 * is even, their information is excluded from the summary. The resulting
 * summary is a newline-separated string containing each user's name
 * followed by their transfer details.
 *
 * @return {string} A formatted string summarizing user transfer details,
 *                  excluding those with no debt or balanced accounts.
 */

function getTransferSummaryText() {
  const cards = document.querySelectorAll(".user-card");
  return Array.from(cards)
    .map((card) => {
      const name = card.querySelector("h2")?.innerText.trim() || "";
      const info =
        card.querySelector(".user-transfers p")?.innerText.trim() || "";
      if (
        !info ||
        info.toLowerCase().includes("tidak punya hutang") ||
        info.toLowerCase().includes("seimbang")
      )
        return null;
      return `- *${name}*: ${info}`;
    })
    .filter(Boolean)
    .join("\n");
}

/**
 * Generates a formatted text summary of selected payment methods.
 *
 * This function iterates over all selected payment cards on the page, extracts
 * their payment method information, and returns a summary string. The summary
 * includes the payment method name, and additional details such as bank name
 * and account number for bank transfers, or other identifying information.
 *
 * Duplicate entries are avoided in the summary.
 *
 * @return {string} A string representation of the selected payment methods,
 *                  each on a new line. If no payment methods are selected,
 *                  returns "Tidak ada".
 */

function getPaymentMethodsText() {
  const selectedCards = document.querySelectorAll(".payment-card.selected");
  if (!selectedCards.length) return "Tidak ada";

  const seen = new Set(); // Untuk menghindari duplikat
  const lines = [];

  selectedCards.forEach((card) => {
    const imgSrc = card.querySelector("img")?.getAttribute("src") || "";
    const methodMatch = imgSrc.match(/\/?([^\/]+)\.png$/);
    let method = methodMatch ? methodMatch[1] : "tidak diketahui";

    // Bersihkan prefix logo- jika ada
    method = method.replace(/^logo-/, "");

    const methodFormatted = method.charAt(0).toUpperCase() + method.slice(1);

    const name = card.querySelector("p:nth-of-type(1)")?.innerText || "";
    const secondLine = card.querySelector("p:nth-of-type(2)")?.innerText || "";
    const thirdLine = card.querySelector("p:nth-of-type(3)")?.innerText || "";

    let textLine = "";

    if (method === "banktransfer") {
      const accountNumber = secondLine.replace("Rek: ", "");
      const bankName = thirdLine.replace("Bank: ", "");
      textLine = `- ${name} (${methodFormatted} - ${bankName}, No Rek: *${accountNumber}*)`;
    } else {
      textLine = `- ${name} (${methodFormatted}, *${secondLine}*)`;
    }

    // Cek apakah sudah pernah dimasukkan
    if (!seen.has(textLine)) {
      seen.add(textLine);
      lines.push(textLine);
    }
  });

  return lines.join("\n");
}

/**
 * Opens a new window to share a given message to WhatsApp.
 * @param {string} message The message to share, will be encoded to a URL.
 * MAIN FUNCTION
 */
function shareToWhatsAppMessage(message) {
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    message
  )}`;
  window.open(url, "_blank");
}

/**
 * Generate a WhatsApp message for the split bill summary.
 *
 * The message will contain the following information:
 * - activity name
 * - date
 * - item list
 * - transfer summary
 * - payment methods
 * - link to app
 *
 * @return {string} The generated message
 */
function generateSplitBillMessage() {
  const activityName = getActivityName();
  const date = new Date().toLocaleDateString("id-ID");
  const itemList = getItemListText();
  const transferSummary = getTransferSummaryText();
  const paymentText = getPaymentMethodsText();

  return `*🧾 Split Bill - Simplified*

Hai guys! Ini bill untuk *${activityName}*
📅 Tanggal: *${date}*

🛍️ *Daftar Item:*
${itemList}

📊 *Ringkasan Pembayaran:*
${transferSummary}

📥 *Metode Pembayaran:*
${paymentText}

🔗 https://splitbill-alpha.vercel.app
_Dibuat dengan Split Bill App_`;
}

/**
 * Generates a message for collect money summary, given as follows:
 *
 * *Collect Money - Simplified*
 * Hai guys! Ini laporan *Collect Money*
 *  Tanggal: *{date}*
 *
 *  Daftar Item:
 * {itemList}
 *  Total Amount:
 * *{totalAmount}*
 *
 *  Metode Pembayaran:
 * {paymentText}
 *
 *  https://splitbill-alpha.vercel.app
 * _Dibuat dengan Split Bill App_
 *
 * @return {string} the generated message
 */
function generateCollectMoneyMessage() {
  const date = new Date().toLocaleDateString("id-ID");

  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

  // Ambil item dan total dari collectMoneyTable
  const itemRows = document.querySelectorAll("#collectMoneyTable tbody tr");
  let itemList = "";
  let totalAmount = 0;

  itemRows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    const itemName = cells[1]?.innerText.trim() || "-";
    const amountText = cells[2]?.innerText.trim() || "0";
    const method = cells[3]?.innerText.trim() || "-";

    const amount = parseFloat(amountText.replace(/[^\d]/g, "")) || 0;
    totalAmount += amount;

    itemList += `- ${itemName} (${formatter.format(
      amount
    )}) | Metode: ${method}\n`;
  });

  // Ambil ringkasan metode pembayaran
  let paymentText = "Tidak ada";
  const methodCards = document.querySelectorAll(
    "#methodSummaryCards .method-card"
  );

  if (methodCards.length > 0) {
    const paymentMethods = Array.from(methodCards).map((card) => {
      const methodName =
        card.querySelector(".method-name")?.innerText.trim() ||
        "Tidak diketahui";
      const methodTotalText =
        card.querySelector(".method-total")?.innerText.trim() || "Rp 0";
      const methodTotal =
        parseFloat(methodTotalText.replace(/[^\d]/g, "")) || 0;
      return `- ${methodName}: *${formatter.format(methodTotal)}*`;
    });
    paymentText = paymentMethods.join("\n");
  }

  return `*🧾 Collect Money - Simplified*

Hai guys! Ini laporan *Collect Money*
📅 Tanggal: *${date}*

💸 *Daftar Item:*
${itemList}
💰 *Total Amount:*
*${formatter.format(totalAmount)}*

📥 *Metode Pembayaran:*
${paymentText}

🔗 https://splitbill-alpha.vercel.app
_Dibuat dengan Split Bill App_`;
}

/**
 * Generates a WhatsApp message to share the app to friends.
 *
 * The message will contain a brief introduction, a list of features, and a link to the app.
 *
 * @return {string} The generated message
 */
function generateShareAppMessage() {
  return (
    `🚀 *Cobain Aplikasi Split Bill!*\n\n` +
    `💸 *Fitur lengkap:*\n` +
    `- Split Bill\n` +
    `- Tabungan Personal\n` +
    `- Invoice Praktis\n` +
    `- Dompet Digital\n\n` +
    `📲 Yuk pakai sekarang:\nhttps://splitbill-alpha.vercel.app`
  );
}

/**
 * Opens a new window to share a given message to WhatsApp.
 *
 * The message is generated by `generateSplitBillDetailMessage`.
 *
 * @see generateSplitBillDetailMessage
 */
function shareToWhatsAppSplitBillDetail() {
  const message = generateSplitBillDetailMessage();
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    message
  )}`;
  window.open(url, "_blank");
}

/**
 * Generates a detailed WhatsApp message for the most recent split bill.
 *
 * This function retrieves the latest split bill data from localStorage and
 * formats it into a message string containing the activity name, date, list
 * of expenses, payment summary, and selected payment methods. The message is
 * designed for sharing via WhatsApp and includes a link to the Split Bill app.
 *
 * The message includes:
 * - Activity name and date of the bill.
 * - List of items with their costs, debtors, and payers.
 * - Payment summary indicating balances due or received by each user.
 * - Selected payment methods with corresponding details.
 *
 * @return {string} The formatted message ready for sharing, or a default
 * message if no split bill data is found.
 */

function generateSplitBillDetailMessage() {
  const splitBillHistoryList = JSON.parse(
    localStorage.getItem("splitBillHistoryList") || "[]"
  );
  if (!splitBillHistoryList.length) return "Data split bill tidak ditemukan.";

  const splitBillData = splitBillHistoryList[splitBillHistoryList.length - 1];
  const activityName = splitBillData.activityName || "Tanpa Nama Aktivitas";
  const date = new Date(splitBillData.date).toLocaleDateString("id-ID");

  // Daftar item (versi lama formatnya)
  const itemList = splitBillData.expenses
    .map((exp) => {
      const hutangList = exp.who.join(", ");
      return `•⁠  ⁠${exp.item} (Rp ${formatNumber(
        exp.amount
      )}) | Hutang: ${hutangList} | Dibayar oleh: ${exp.paidBy}`;
    })
    .join("\n");

  // Ringkasan pembayaran (versi lama formatnya)
  const transferSummary = Object.entries(splitBillData.variance)
    .map(([user, variance]) => {
      const userName = user.toLowerCase();
      const target = Object.keys(splitBillData.userPayments)[0] || "-";
      if (variance < 0) {
        return `•⁠  ⁠${userName}: 💸 Bayar Rp ${formatNumber(
          Math.abs(variance)
        )} ke ${target}`;
      } else if (variance > 0) {
        return `•⁠  ⁠${userName}: 💰 Terima Rp ${formatNumber(
          variance
        )} dari ${target}`;
      } else {
        return `•⁠  ⁠${userName}: ✅ Lunas`;
      }
    })
    .join("\n");

  // Metode pembayaran (versi lama formatnya)
  const paymentText = splitBillData.selectedPaymentMethods
    .map(
      (pm) =>
        `•⁠  ⁠${pm.name} (${pm.bankCode}, ${pm.accountNumber.replace(
          "No HP: ",
          ""
        )})`
    )
    .join("\n");

  return `*🧾 Split Bill - Simplified*

Hai guys! Ini bill untuk *${activityName}*
📅 Tanggal: ${date}

🛍️ Daftar Item:
${itemList}

📊 Ringkasan Pembayaran:
${transferSummary}

📥 Metode Pembayaran:
${paymentText}

🔗 https://splitbill-alpha.vercel.app
_Dibuat dengan Split Bill App_`;
}

/**
 * Format a number to a string with Indonesian locale.
 *
 * @param {number} num The number to format.
 * @return {string} The formatted string.
 */
function formatNumber(num) {
  return new Intl.NumberFormat("id-ID").format(num);
}
