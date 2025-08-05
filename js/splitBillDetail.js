let splitBillData = null;
let availableSplitBills = [];
let selectedSplitBillId = "SB-20250801-1212986";

/**
 * Loads the split bill data for the selected split bill ID.
 *
 * This function retrieves the list of split bills from localStorage, parses it,
 * and attempts to find the split bill that matches the given selectedSplitBillId.
 * If the split bill is found, it renders the split bill details and updates the UI
 * to hide the loading state and show the summary.
 */

function loadSplitBillData() {
  const storedData = localStorage.getItem("splitBillHistoryList");
  availableSplitBills = storedData ? JSON.parse(storedData) : [];

  // Find selected data
  splitBillData = availableSplitBills.find(
    (item) => item.splitBillNumber === selectedSplitBillId
  );

  if (splitBillData) {
    renderSplitBillDetail();
    document.getElementById("loadingState").style.display = "none";
    document.getElementById("summary").style.display = "block";
  }
}

/**
 * Renders the split bill details into the UI.
 *
 * This function takes the selected split bill data and renders it into the UI,
 * updating the header, activity info, payment methods, and user summaries.
 * It also formats the date and total expense values with the appropriate utility
 * functions.
 */
function renderSplitBillDetail() {
  // Update header
  document.getElementById("splitBillNumber").textContent =
    splitBillData.splitBillNumber;

  // Update activity info
  document.getElementById("activityName").textContent =
    splitBillData.activityName || "No Activity Name";
  document.getElementById("activityDate").textContent = formatDate(
    splitBillData.date
  );
  document.getElementById("peopleCount").textContent = `${
    Object.keys(splitBillData.userExpenses).length
  } People`;
  document.getElementById("totalExpense").textContent = formatToIDR(
    splitBillData.totalExpense
  );

  // Render payment methods
  renderPaymentMethods();

  // Render user summaries
  renderUserSummaries();
}

/**
 * Renders the selected payment methods into the UI.
 *
 * This function takes the selected payment methods from the split bill data and
 * renders them into the UI. It also formats the account number and bank name
 * values with the appropriate utility functions. If no selected payment methods
 * are found, it updates the UI to show a "No payment methods selected" message.
 */
function renderPaymentMethods() {
  const container = document.getElementById("paymentMethodsContainer");
  container.innerHTML = "";

  // Check if selectedPaymentMethods exists
  if (
    !splitBillData.selectedPaymentMethods ||
    splitBillData.selectedPaymentMethods.length === 0
  ) {
    container.innerHTML =
      '<p class="text-gray-500">Tidak ada metode pembayaran yang dipilih</p>';
    return;
  }

  splitBillData.selectedPaymentMethods.forEach((paymentMethod) => {
    const paymentDiv = document.createElement("div");
    const bankCode = paymentMethod.bankCode
      ? paymentMethod.bankCode.toLowerCase()
      : "default";

    paymentDiv.className = `payment-method-item ${bankCode}`;

    // Create payment info HTML
    let paymentInfo = `<p><strong>${paymentMethod.name}</strong></p>`;

    // Add account number or phone number
    if (paymentMethod.accountNumber) {
      if (paymentMethod.accountNumber.startsWith("No HP:")) {
        paymentInfo += `<p>${paymentMethod.accountNumber}</p>`;
      } else {
        paymentInfo += `<p>Rek: ${paymentMethod.accountNumber}</p>`;
      }
    }

    // Add bank info if available
    if (paymentMethod.bank) {
      paymentInfo += `<p>Bank: ${paymentMethod.bank}</p>`;
    }

    paymentDiv.innerHTML = `
                    <div class="payment-logo ${bankCode}">
                        ${
                          paymentMethod.logoUrl
                            ? `<img src="${paymentMethod.logoUrl}" alt="${paymentMethod.bankCode}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                             <span style="display: none;">${paymentMethod.bankCode}</span>`
                            : `<span>${paymentMethod.bankCode}</span>`
                        }
                    </div>
                    <div class="payment-info">
                        ${paymentInfo}
                    </div>
                `;

    container.appendChild(paymentDiv);
  });
}

/**
 * Renders the user summaries for a split bill.
 *
 * This function iterates over all users involved in the split bill, calculates
 * their expenses, payments, and variances, and generates an HTML representation
 * for each user. It also calculates the breakdown of expenses per user and
 * displays transfer details, indicating how much each user owes or is owed.
 * The function updates the UI with user summary cards, including avatars,
 * expense breakdowns, and transfer information.
 *
 * It utilizes existing functions to generate and adjust transaction maps,
 * ensuring mutual payments are accounted for. The function also handles cases
 * where a user has no expenses or transfers, displaying appropriate messages.
 */

function renderUserSummaries() {
  const container = document.getElementById("userSummaryContainer");
  container.innerHTML = "";

  // Gabungkan semua user dari userExpenses dan variance
  const allUsers = new Set([
    ...Object.keys(splitBillData.userExpenses || {}),
    ...Object.keys(splitBillData.variance || {}),
  ]);

  // Generate transaction map menggunakan fungsi yang sudah ada
  const { transactionMap, transferSummaryMap } = generateTransactionMap(
    splitBillData.expenses
  );
  adjustForMutualPayments(transactionMap, transferSummaryMap);

  allUsers.forEach((user) => {
    const userExpense = splitBillData.userExpenses[user] || 0;
    const userPayment = splitBillData.userPayments[user] || 0;
    const userVariance = splitBillData.variance[user] || 0;

    // Calculate user's share of each expense
    const userExpenseBreakdown = splitBillData.expenses
      .filter((expense) => expense.who.includes(user))
      .map((expense) => ({
        ...expense,
        userShare: expense.amount / expense.who.length,
      }));

    const userDiv = document.createElement("div");
    userDiv.className = "user-summary-card";

    // Breakdown item HTML
    let breakdownHTML = "";
    if (userExpenseBreakdown.length > 0) {
      userExpenseBreakdown.forEach((expense) => {
        const discountLabel =
          expense.amount < 0
            ? '<span class="discount-label">Diskon</span>'
            : "";
        breakdownHTML += `
          <li ${expense.amount < 0 ? "negative" : ""}>
            <div class="breakdown-row">
              <span class="item-name">
                ${expense.item}
                ${discountLabel}
              </span>
              <span class="item-amount">${
                expense.amount < 0 ? "- " : ""
              }${formatToIDR(Math.abs(expense.userShare))}</span>
            </div>
          </li>
        `;
      });
    } else {
      // Jika user tidak memiliki expense breakdown
      breakdownHTML =
        '<li><div class="breakdown-row"><span class="item-name">Tidak ada pengeluaran langsung</span><span class="item-amount">Rp 0</span></div></li>';
    }

    // Transfer info - menggunakan transactionMap yang sudah di-adjust
    let transferHTML = "";

    // Cari transfer yang harus dilakukan user ini (debt) - menggunakan transactionMap
    let transfers = Object.entries(transactionMap)
      .filter(([key]) => key.startsWith(`${user}->`))
      .map(([key, amount]) => {
        const creditor = key.split("->")[1];
        const creditorName =
          creditor.charAt(0).toUpperCase() + creditor.slice(1);
        return `<p class="transfer-detail">💸 Bayar <strong>${formatToIDR(
          amount
        )}</strong> ke <strong>${creditorName}</strong></p>`;
      })
      .join("");

    // Cari transfer yang akan diterima user ini (credit) - menggunakan transactionMap
    let receivables = Object.entries(transactionMap)
      .filter(([key]) => key.endsWith(`->${user}`))
      .map(([key, amount]) => {
        const debtor = key.split("->")[0];
        const debtorName = debtor.charAt(0).toUpperCase() + debtor.slice(1);
        return `<p class="transfer-detail">💰 Terima <strong>${formatToIDR(
          amount
        )}</strong> dari <strong>${debtorName}</strong></p>`;
      })
      .join("");

    // Kombinasi transfer dan receivables
    transferHTML = transfers + receivables;

    // Jika tidak ada transfer dan variance = 0
    if (!transferHTML && userVariance === 0) {
      transferHTML = `<p class="no-debt">✅ Kamu tidak punya hutang</p>`;
    }
    // Jika tidak ada transfer tapi ada variance positif (harusnya dapat uang)
    else if (!transferHTML && userVariance > 0) {
      transferHTML = `<p class="no-debt">💰 Kamu akan menerima <strong>${formatToIDR(
        userVariance
      )}</strong></p>`;
    }
    // Jika tidak ada transfer tapi ada variance negatif (harusnya bayar)
    else if (!transferHTML && userVariance < 0) {
      // Cari user yang memiliki variance positif (yang akan menerima uang)
      const creditors = Object.entries(splitBillData.variance)
        .filter(([userName, variance]) => variance > 0)
        .sort(([, a], [, b]) => b - a); // Urutkan dari yang terbesar

      if (creditors.length > 0) {
        // Tampilkan semua creditor
        const creditorList = creditors
          .map(([creditorName, amount]) => {
            const creditorDisplayName =
              creditorName.charAt(0).toUpperCase() + creditorName.slice(1);
            return `<strong>${creditorDisplayName}</strong> (${formatToIDR(
              amount
            )})`;
          })
          .join(", ");

        transferHTML = `<p class="transfer-detail">💸 Kamu harus bayar <strong>${formatToIDR(
          Math.abs(userVariance)
        )}</strong> ke ${creditorList}</p>`;
      } else {
        transferHTML = `<p class="transfer-detail">💸 Kamu harus bayar <strong>${formatToIDR(
          Math.abs(userVariance)
        )}</strong></p>`;
      }
    }

    userDiv.innerHTML = `
      <div class="user-header">
        <div class="avatar">
          <img src="https://api.dicebear.com/9.x/personas/svg?backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&scale=100&seed=${user}" alt="${user}" class="summary-avatar">
        </div>
        <div class="user-details">
          <h2>${user}</h2>
          <p>Total Membayar: <strong>${formatToIDR(userPayment)}</strong></p>
        </div>
        <div class="user-expense">
          <p>Total Pengeluaran</p>
          <h3>${formatToIDR(userExpense)}</h3>
        </div>
      </div>
      <div class="breakdown-section">
        <ul class="item-breakdown">
          ${breakdownHTML}
        </ul>
      </div>
      <div class="user-transfers">
        ${transferHTML}
      </div>
    `;

    container.appendChild(userDiv);
  });

  // Simpan transactionMap ke splitBillData untuk referensi
  splitBillData.transactionMap = transactionMap;
}

function generateTransactionMap(items) {
  const transactionMap = {};
  const transferSummaryMap = {};

  items.forEach(({ amount, who, paidBy }) => {
    if (!paidBy || !who || who.length === 0) return;

    const share = amount / who.length;

    who.forEach((debtor) => {
      if (debtor === paidBy) return; // paidBy tidak perlu bayar ke dirinya sendiri

      const key = `${debtor}->${paidBy}`;
      if (!transactionMap[key]) transactionMap[key] = 0;
      transactionMap[key] += share;

      // Simpan juga untuk transfer summary
      if (!transferSummaryMap[debtor]) transferSummaryMap[debtor] = {};
      if (!transferSummaryMap[debtor][paidBy])
        transferSummaryMap[debtor][paidBy] = 0;
      transferSummaryMap[debtor][paidBy] += share;
    });
  });

  return { transactionMap, transferSummaryMap };
}

/**
 * Adjusts the transaction map to account for mutual payments between users.
 * This function checks for transactions where two users owe each other money
 * and reduces or eliminates the amounts accordingly. The transaction map is
 * updated to reflect the minimized transactions.
 *
 * @param {Object} transactionMap - An object mapping transactions in the form
 * of "debtor->creditor" as keys and the amount owed as values.
 * @param {Object} transferSummaryMap - An object mapping each user's payment
 * summary to others, not used in this function but included for compatibility.
 */
function adjustForMutualPayments(transactionMap, transferSummaryMap) {
  for (const key in transactionMap) {
    const [from, to] = key.split("->");
    const reverseKey = `${to}->${from}`;

    if (transactionMap[reverseKey]) {
      const forward = transactionMap[key];
      const reverse = transactionMap[reverseKey];

      if (forward > reverse) {
        transactionMap[key] = forward - reverse;
        delete transactionMap[reverseKey];
      } else if (reverse > forward) {
        transactionMap[reverseKey] = reverse - forward;
        delete transactionMap[key];
      } else {
        delete transactionMap[key];
        delete transactionMap[reverseKey];
      }
    }
  }
}

function shareToWhatsApp() {
  const message = generateWhatsAppMessage();
  const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

function generateWhatsAppMessage() {
  let message = `🧾 *Split Bill Detail*\n`;
  message += `📋 ${splitBillData.splitBillNumber}\n`;
  message += `🎯 ${splitBillData.activityName || "No Activity Name"}\n`;
  message += `📅 ${formatDate(splitBillData.date)}\n`;
  message += `💰 Total: ${formatToIDR(splitBillData.totalExpense)}\n\n`;

  message += `📊 *Ringkasan Pembayaran:*\n`;
  Object.entries(splitBillData.variance).forEach(([user, variance]) => {
    const userName = user.charAt(0).toUpperCase() + user.slice(1);
    if (variance > 0) {
      message += `💰 ${userName}: Akan menerima ${formatToIDR(variance)}\n`;
    } else if (variance < 0) {
      message += `💸 ${userName}: Harus bayar ${formatToIDR(
        Math.abs(variance)
      )}\n`;
    } else {
      message += `✅ ${userName}: Sudah lunas\n`;
    }
  });

  message += `\n💳 *Metode Pembayaran:*\n`;
  message += `🟠 OVO: 085559496968 (Agus Budiman)\n`;
  message += `🔵 BCA: 123456 (Agus Budiman)\n`;

  return message;
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", function () {
  // Get splitBillId from URL params if available
  const urlParams = new URLSearchParams(window.location.search);
  const urlSplitBillId = urlParams.get("id");
  if (urlSplitBillId) {
    selectedSplitBillId = urlSplitBillId;
  }

  loadSplitBillData();
});

// Handle URL parameter changes
window.addEventListener("popstate", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const urlSplitBillId = urlParams.get("id");
  if (urlSplitBillId && urlSplitBillId !== selectedSplitBillId) {
    selectedSplitBillId = urlSplitBillId;
    loadSplitBillData();
  }
});
