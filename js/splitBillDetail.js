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

  // Generate transaction map using variance-based calculation (like in summary.js)
  const { transactionMap, transferSummaryMap } =
    generateTransactionMapFromVariance(
      splitBillData.userExpenses,
      splitBillData.userPayments,
      splitBillData.variance
    );

  allUsers.forEach((user) => {
    const userExpense = splitBillData.userExpenses[user] || 0;
    const userPayment = splitBillData.userPayments[user] || 0;
    const userVariance = splitBillData.variance[user] || 0;

    // Calculate user's breakdown including both main expenses and additional items
    const breakdown = calculateUserItemBreakdown(
      splitBillData.expenses,
      splitBillData.additionalItems || []
    );
    const userBreakdown = breakdown[user] || [];

    const userDiv = document.createElement("div");
    userDiv.className = "user-summary-card";

    // Breakdown item HTML
    let breakdownHTML = "";
    if (userBreakdown.length > 0) {
      userBreakdown.forEach((item) => {
        const discountLabel =
          item.amount < 0 ? '<span class="discount-label">Diskon</span>' : "";
        const additionalLabel = item.isAdditional
          ? '<span class="proportional-label">Split Proporsional</span>'
          : "";

        breakdownHTML += `
          <li ${item.amount < 0 ? "negative" : ""}>
            <div class="breakdown-row">
              <span class="item-name">
                ${item.item}
                ${discountLabel}
                ${additionalLabel}
              </span>
              <span class="item-amount">${
                item.amount < 0 ? "- " : ""
              }${formatToIDR(Math.abs(item.amount))}</span>
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
        return `<p class="transfer-detail no-debt">💰 Terima <strong>${formatToIDR(
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
 * Generates transaction map based on user expenses, payments, and variance.
 * This function calculates who owes whom based on the final expenses (including additional expenses)
 * and actual payments made, then optimizes the transactions to minimize the number of transfers.
 *
 * @param {Object} userExpenses - Final user expenses including additional expenses
 * @param {Object} userPayments - Actual payments made by each user
 * @param {Object} variance - Variance between what each user paid vs what they owe
 * @returns {Object} Object containing transactionMap and transferSummaryMap
 */
function generateTransactionMapFromVariance(
  userExpenses,
  userPayments,
  variance
) {
  const transactionMap = {};
  const transferSummaryMap = {};

  // Separate users into debtors (negative variance) and creditors (positive variance)
  const debtors = [];
  const creditors = [];

  Object.entries(variance).forEach(([user, amount]) => {
    if (amount < -0.01) {
      // Small threshold to handle floating point precision
      debtors.push({ user, amount: Math.abs(amount) });
    } else if (amount > 0.01) {
      creditors.push({ user, amount });
    }
  });

  // Sort debtors by amount owed (descending) and creditors by amount owed to them (descending)
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  // Settle debts using a greedy algorithm to minimize transactions
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];

    const transferAmount = Math.min(debtor.amount, creditor.amount);

    if (transferAmount > 0.01) {
      // Only create transaction if amount is significant
      const key = `${debtor.user}->${creditor.user}`;
      transactionMap[key] = transferAmount;

      // Update transfer summary map
      if (!transferSummaryMap[debtor.user])
        transferSummaryMap[debtor.user] = {};
      transferSummaryMap[debtor.user][creditor.user] = transferAmount;

      // Update remaining amounts
      debtor.amount -= transferAmount;
      creditor.amount -= transferAmount;
    }

    // Move to next debtor or creditor if current one is settled
    if (debtor.amount <= 0.01) debtorIndex++;
    if (creditor.amount <= 0.01) creditorIndex++;
  }

  return { transactionMap, transferSummaryMap };
}

/**
 * Calculates the breakdown of expenses for each user based on shared items.
 * Each item is divided equally among the users who need to pay for it.
 * Returns a detailed breakdown for each user including their share of each item.
 *
 * @param {Array} items - An array of expense items. Each item is an object
 * containing the item name, total amount, array of users ('who') sharing the
 * expense, and the user ('paidBy') who paid for it.
 * @param {Array} additionalItems - An array of additional expense items with distribution.
 *
 * @returns {Object} An object where each key is a user and the value is an
 * array of item breakdowns. Each breakdown includes the item name, the user's
 * share of the amount, who paid, the original amount, and other users sharing
 * the cost.
 */
function calculateUserItemBreakdown(items, additionalItems = []) {
  const breakdown = {};

  items.forEach(({ item, amount, who, paidBy }) => {
    const share = amount / who.length;

    who.forEach((person) => {
      if (!breakdown[person]) breakdown[person] = [];

      breakdown[person].push({
        type: "main",
        item,
        amount: share,
        paidBy,
        originalAmount: amount,
        splitWith: who.filter((p) => p !== person),
      });
    });
  });

  // Add additional items to the breakdown
  additionalItems.forEach((additionalItem) => {
    const { name, distribution } = additionalItem;
    for (const person in distribution) {
      if (!breakdown[person]) breakdown[person] = [];
      breakdown[person].push({
        type: "additional",
        item: name,
        amount: distribution[person],
        isAdditional: true, // Flag to identify additional items
      });
    }
  });

  return breakdown;
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
