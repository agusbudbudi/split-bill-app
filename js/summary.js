/**
 * Calculates and displays the split bill summary.
 *
 * This function calculates the total expense, user expenses, user payments,
 * and variance for the split bill. It then displays the summary in the page.
 *
 * If a payment method is selected, it is also displayed.
 */
function calculateSplit() {
  const {
    totalExpense,
    userExpenses,
    userPayments,
    variance,
    additionalItems,
  } = generateSplitSummary();

  if (
    typeof getSelectedPaymentInfo === "number" &&
    paymentMethods[getSelectedPaymentInfo]
  ) {
    showSelectedPayment();
  }

  displaySummary(
    totalExpense,
    userExpenses,
    userPayments,
    variance,
    expenses,
    additionalItems
  );
}

/**
 * Generates the split bill summary.
 *
 * This function iterates over all expense items and calculates the total
 * expense, the amount each user needs to pay, and the amount each user has
 * paid. Then, it calculates the variance for each user.
 *
 * @return {Object} The summary object containing the total expense, user
 * expenses, user payments, and variance.
 */
function generateSplitSummary() {
  let totalExpense = 0;
  let userExpenses = {};
  let userPayments = {};

  expenses.forEach(({ amount, who, paidBy }) => {
    totalExpense += amount;

    who.forEach((person) => {
      if (!userExpenses[person]) userExpenses[person] = 0;
      userExpenses[person] += amount / who.length;
    });

    if (!userPayments[paidBy]) userPayments[paidBy] = 0;
    userPayments[paidBy] += amount;
  });

  let variance = calculateVariance(userExpenses, userPayments, totalExpense);

  // NEW: Calculate additional items distribution
  const additionalResult = calculateAdditionalItemsDistribution(userExpenses);
  const finalExpenses = mergeAdditionalItemsToSummary(
    userExpenses,
    additionalResult
  );

  // Add additional expense payments to userPayments
  const additionalItems = getAdditionalExpenseItems();
  additionalItems.forEach(({ amount, paidBy }) => {
    if (paidBy) {
      if (!userPayments[paidBy]) userPayments[paidBy] = 0;
      userPayments[paidBy] += amount;
    }
  });

  // Recalculate variance with final expenses and payments
  const finalVariance = calculateVariance(
    finalExpenses,
    userPayments,
    totalExpense + additionalResult.totalAmount
  );

  return {
    totalExpense: totalExpense + additionalResult.totalAmount,
    userExpenses: finalExpenses,
    userPayments,
    variance: finalVariance,
    additionalItems: additionalResult.items, // for display breakdown
  };
}

function getSelectedPaymentInfo() {
  const paymentDivs = document.querySelectorAll(
    "#summary #selectedPaymentInfo .selected-payment-summary"
  );
  const result = [];

  paymentDivs.forEach((div) => {
    const img = div.querySelector("img");
    const name = div.querySelector("strong")?.textContent || "";
    const details = div.querySelectorAll("p")[1]?.innerText.split("\n") || [];

    const accountNumber = details[0]?.replace("Rek: ", "").trim();
    const bankName = details[1]?.replace("Bank: ", "").trim();

    result.push({
      name,
      bank: bankName,
      accountNumber,
      logoUrl: img?.getAttribute("src") || "",
      bankCode: img?.getAttribute("alt") || "",
    });
  });

  return result;
}

/**
 * Generates a split bill record object.
 *
 * This function takes in the total expense, user expenses, user payments,
 * variance, and additional items and returns an object containing all the relevant information,
 * including the split bill number, activity name, date, and expenses.
 *
 * @param {number} totalExpense - Total expense of the split bill.
 * @param {Object} userExpenses - Object where each key is a user and the value
 * is the amount they need to pay.
 * @param {Object} userPayments - Object where each key is a user and the value
 * is the amount they paid.
 * @param {Object} variance - Object where each key is a user and the value is
 * the difference between what they paid and what they owed.
 * @param {Array} additionalItems - Array of additional expense items with their distribution.
 *
 * @return {Object} The split bill record object.
 */
function generateSplitRecord(
  totalExpense,
  userExpenses,
  userPayments,
  variance,
  additionalItems = []
) {
  const splitBillNumber =
    localStorage.getItem("currentSplitBillNumber") ||
    generateDailySplitBillNumber();

  return {
    splitBillNumber,
    totalExpense,
    userExpenses,
    userPayments,
    variance,
    expenses,
    additionalItems, // Include additional items in the saved record
    activityName: document.getElementById("activityName").value,
    date: new Date().toISOString(),
    selectedPaymentMethods: getSelectedPaymentInfo(), // data sudah rapi
  };
}

/**
 * Saves a split bill record to local storage.
 *
 * This function takes in a split bill record object and saves it to the
 * "splitBillHistoryList" local storage key. If a record with the same split
 * bill number already exists, it is overwritten; otherwise, the new record is
 * added to the list.
 *
 * @param {Object} newRecord - The split bill record object to be saved.
 */
function saveSplitBillToLocalStorage(newRecord) {
  const splitBillNumber = newRecord.splitBillNumber;

  let historyList =
    JSON.parse(localStorage.getItem("splitBillHistoryList")) || [];

  const existingIndex = historyList.findIndex(
    (item) => item.splitBillNumber === splitBillNumber
  );

  if (existingIndex !== -1) {
    historyList[existingIndex] = newRecord;
  } else {
    historyList.push(newRecord);
  }

  localStorage.setItem("splitBillHistoryList", JSON.stringify(historyList));
}

/**
 * Finalizes the split bill process and saves the bill to local storage.
 *
 * This function generates the split bill summary, creates a new split bill record,
 * and saves it to local storage. After saving, it closes the finalize popup and
 * displays a success toast message to the user.
 */

function handleFinalizeSplitBill() {
  const {
    totalExpense,
    userExpenses,
    userPayments,
    variance,
    additionalItems,
  } = generateSplitSummary();

  const newRecord = generateSplitRecord(
    totalExpense,
    userExpenses,
    userPayments,
    variance,
    additionalItems
  );

  saveSplitBillToLocalStorage(newRecord);
  closePopup("popupFinalizeSplitBill");
  showToast("Split Bill berhasil disimpan!", "success");
}

/**
 * Updates the UI to reflect the completion of a split bill process.
 *
 * This function hides the "Finalize Split Bill" button and shows the
 * "See Split Bill History" button, indicating that the split bill has
 * been finalized and saved. It modifies the visibility of these buttons
 * based on their presence in the DOM.
 */

function showActionSplitBill() {
  const finalizeBtn = document.getElementById("finalizeSplitBillBtn");
  const seeHistoryBtn = document.getElementById("seeSplitBillHistoryBtn");

  if (finalizeBtn) finalizeBtn.classList.add("hidden");
  if (seeHistoryBtn) seeHistoryBtn.classList.remove("hidden");
}

/**
 * Calculates the variance for each user based on their expenses and payments.
 * The variance is the difference between what each person paid and what they owed.
 * @param {Object} userExpenses - An object where each key is a user and
 * the value is the total amount they need to pay.
 * @param {Object} userPayments - An object where each key is a user and
 * the value is the amount they paid.
 * @param {number} totalExpense - The total amount of the shared expense.
 * @returns {Object} An object where each key is a user and the value is their
 * variance (how much they owe or are owed).
 */
function calculateVariance(userExpenses, userPayments, totalExpense) {
  let variance = {};
  for (let user in userExpenses) {
    let paidAmount = userPayments[user] || 0;
    variance[user] = paidAmount - userExpenses[user];
  }
  return variance;
}

/**
 * Calculates the total amount paid by all users.
 * @param {Object} userPayments - An object where each key is a user and
 * the value is the amount they paid.
 * @returns {number} The total amount paid by all users.
 */
function calculateTotalPaid(userPayments) {
  return Object.values(userPayments).reduce((sum, pay) => sum + pay, 0);
}

/**
 * Calculates the total variance of all users.
 * The total variance is the sum of each user's variance (how much they owe or are owed).
 * @param {Object} variance - An object where each key is a user and
 * the value is their variance (how much they owe or are owed).
 * @returns {number} The total variance of all users.
 */
function calculateTotalVariance(variance) {
  return Object.values(variance).reduce((sum, val) => sum + val, 0);
}

/**
 * Menampilkan ringkasan pembagian biaya per orang.
 * Menerima total biaya, biaya per orang, pembayaran per orang, variansi per orang,
 * dan daftar item biaya.
 * Menghitung ringkasan per orang dan menampilkan hasilnya dalam bentuk HTML.
 * @param {number} totalExpense - Total biaya yang dibagi
 * @param {Object} userExpenses - Biaya per orang
 * @param {Object} userPayments - Pembayaran per orang
 * @param {Object} variance - Variansi per orang
 * @param {Array} items - Daftar item biaya
 */
function displaySummary(
  totalExpense,
  userExpenses,
  userPayments,
  variance,
  items,
  additionalItems // New parameter
) {
  const summaryDiv = document.getElementById("summary");

  // Ambil nama aktivitas dan tanggal dari input form
  const activityName = document.getElementById("activityName").value;

  // Tanggal otomatis dari hari ini
  const today = new Date();
  const formattedDate = today.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Struktur HTML-nya
  summaryDiv.innerHTML = `
  <div class="summary-header">
    <div class="header-title">
      <h1 class="activity-name">${activityName || "Aktivitas Tanpa Nama"}</h1>
      <p class="activity-date"> Tanggal: ${formattedDate}</p>
      <p class="total-expense">Total Pengeluaran: <strong>${formatToIDR(
        totalExpense
      )}</strong></p>
    </div
    <div class="split-bill-icon">
       <img src="img/logoSummary.png" alt="logo" class="logo" />
    </div>
  </div>
`;

  document.querySelector(".summary-container").style.display = "block";

  // ⬇️ Generate transaction map based on final expenses (including additional expenses)
  const { transactionMap, transferSummaryMap } =
    generateTransactionMapFromVariance(
      userExpenses, // Final expenses including additional expenses
      userPayments,
      variance
    );

  summaryDiv.innerHTML += `<h3>Ringkasan per Orang</h3>`;
  summaryDiv.innerHTML += `<div class="user-summary-cards">${generateUserCards(
    userExpenses, // Use passed userExpenses
    userPayments,
    variance,
    transactionMap
  )}</div>`;

  //show breakdown per person, passing additionalItems
  const breakdown = calculateUserItemBreakdown(items, additionalItems); // Use passed items and additionalItems
  renderItemBreakdownPerPerson(breakdown);

  summaryDiv.innerHTML += `<div id="selectedPaymentInfo"></div>`;
  showSelectedPayment();

  showToast("Berhasil! cek Split Bill kamu di bawah", "success", 20000);
}

/**
 * Membuat mapping transaksi per orang.
 * Mapping ini akan dipakai untuk menghitung siapa yang harus membayar siapa dan berapa.
 * @param {object[]} items - array of objects, masing-masing berisi:
 *   {amount: number, who: string[], paidBy: string}
 * @returns {object} - object dengan 2 properti: transactionMap dan transferSummaryMap
 *   transactionMap: { [key: string]: number } - mapping transaksi per orang
 *     key: string berupa "debtor->creditor"
 *     value: number berupa jumlah yang harus dibayar dari debtor ke creditor
 *   transferSummaryMap: { [key: string]: { [key: string]: number } } - mapping ringkasan transfer per orang
 *     key: string berupa nama orang yang menerima uang
 *     value: object dengan key berupa nama orang yang mengirim uang dan value berupa jumlah yang dikirim
 */
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

/**
 * Calculates the breakdown of expenses for each user based on shared items.
 * Each item is divided equally among the users who need to pay for it.
 * Returns a detailed breakdown for each user including their share of each item.
 *
 * @param {Array} items - An array of expense items. Each item is an object
 * containing the item name, total amount, array of users ('who') sharing the
 * expense, and the user ('paidBy') who paid for it.
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
 * Renders the item breakdown for each person within the user card element.
 *
 * This function iterates over the provided breakdown object, which contains
 * information about each user's share of expenses. For each person, it creates
 * a list of items and their respective amounts (including discounts) and appends
 * this list to the corresponding user's card in the DOM.
 *
 * @param {Object} breakdown - An object where each key is a user's name,
 * and the value is an array of item breakdowns. Each item breakdown contains
 * details such as the item name and the user's share of the amount.
 */

function renderItemBreakdownPerPerson(breakdown) {
  Object.entries(breakdown).forEach(([person, items]) => {
    const userCard = document.querySelector(
      `.user-card[data-name="${person}"]`
    );
    if (!userCard) return;

    const breakdownList = document.createElement("ul");
    breakdownList.classList.add("item-breakdown");

    items.forEach(({ item, amount, isAdditional }) => {
      const li = document.createElement("li");
      li.innerHTML = `
      <div class="breakdown-row">
        <span class="item-name">${item}   ${
        amount < 0 ? '<span class="discount-label">Diskon</span>' : ""
      }${
        isAdditional
          ? '<span class="proportional-label">Split Proporsional</span>'
          : ""
      }</span>
        <span class="item-amount">${formatToIDR(amount)}
      </span>
      </div>
    `;
      breakdownList.appendChild(li);
    });

    const breakdownContainer = document.createElement("div");
    breakdownContainer.classList.add("breakdown-section");
    breakdownContainer.appendChild(breakdownList);

    // userCard.appendChild(breakdownContainer);
    const transfersSection = userCard.querySelector(".user-transfers");
    if (transfersSection) {
      userCard.insertBefore(breakdownContainer, transfersSection);
    } else {
      userCard.appendChild(breakdownContainer);
    }
  });
}

/**
 * Generates HTML elements for each user to display their total expenses and
 * any money they owe or are owed by other users.
 *
 * @param {Object} userExpenses - An object where each key is a user and the
 * value is the amount they need to pay.
 * @param {Object} userPayments - An object where each key is a user and the
 * value is the amount they paid.
 * @param {Object} variance - An object where each key is a user and the value
 * is the difference between what they paid and what they owed.
 * @param {Object} transactionMap - An object where each key is a string in the
 * format 'creditor->debtor' and the value is the amount that the debtor owes
 * the creditor.
 * @returns {string} A string of HTML elements, one for each user.
 */
function generateUserCards(
  userExpenses,
  userPayments,
  variance,
  transactionMap
) {
  return Object.keys(userExpenses)
    .map((user) => {
      const expense = userExpenses[user] || 0;
      const paid = userPayments[user] || 0;
      const diff = variance[user] || 0;

      let transfers = Object.entries(transactionMap)
        .filter(([key]) => key.startsWith(`${user}->`))
        .map(([key, amount]) => {
          const creditor = key.split("->")[1];
          return `<p class="transfer-detail">💸 Bayar <strong>${formatToIDR(
            amount
          )}</strong> ke <strong>${creditor}</strong></p>`;
        })
        .join("");

      if (!transfers && diff >= 0) {
        transfers = `<p class="no-debt">✅ Kamu tidak punya hutang</p>`;
      }

      return `
        <div class="user-card" data-name="${user}">
          <div class="user-header">
            <div class="avatar">
              <img src="https://api.dicebear.com/9.x/personas/svg?backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&scale=100&seed=${user}" alt="${user}" class="summary-avatar"/>
            </div>
            <div class="user-details">
              <h2>${user}</h2>
              <p>Total Membayar: <strong>${formatToIDR(paid)}</strong></p>
            </div>
            <div class="user-expense">
              <p>Total Pengeluaran</p>
              <h3>${formatToIDR(expense)}</h3>
            </div>
          </div>
          <div class="user-transfers">
            ${transfers}
          </div>
        </div>
      `;
    })
    .join("");
}

function generateDailySplitBillNumber() {
  const today = new Date();
  const datePart = today.toISOString().slice(0, 10).replace(/-/g, ""); // 20250727
  // const timePart =
  //   today.getHours().toString().padStart(2, "0") +
  //   today.getMinutes().toString().padStart(2, "0");
  const randomPart = Math.floor(Math.random() * 900 + 100); // 3 digit acak
  return `SB-${datePart}${randomPart}`;
}

function initSplitBillNumber() {
  const generatedNumber = generateDailySplitBillNumber();
  localStorage.setItem("currentSplitBillNumber", generatedNumber);

  // Tampilkan ke elemen jika ada
  const splitNumberDisplay = document.getElementById("splitBillNumberDisplay");
  if (splitNumberDisplay) {
    splitNumberDisplay.textContent = generatedNumber;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  initSplitBillNumber();
});

/**
 * Extracts additional expense items from the DOM.
 *
 * @returns {Array<Object>} An array of objects, each representing an additional expense item.
 *   Each object contains:
 *   - name: The name of the additional expense (string).
 *   - amount: The amount of the additional expense (number).
 *   - selectedUsers: An array of user names selected for this additional expense (string[]).
 */
function getAdditionalExpenseItems() {
  const additionalExpenseContainers = document.querySelectorAll(
    ".additional-expense-item-container"
  );
  const items = [];

  additionalExpenseContainers.forEach((containerElement) => {
    // Query for inputs within the current container
    const nameInput = containerElement.querySelector(
      ".additional-expense-name"
    );
    const amountInput = containerElement.querySelector(
      ".additional-expense-amount"
    );
    const selectedPeopleInput = containerElement.querySelector(
      ".selected-people-additional"
    );
    const paidBySelect = containerElement.querySelector(
      ".additional-expense-paid-by"
    );

    const name = nameInput ? nameInput.value.trim() : "";
    const amount = amountInput ? parseFloat(amountInput.value) || 0 : 0;
    const paidBy = paidBySelect ? paidBySelect.value.trim() : "";
    let selectedUsers = [];
    try {
      selectedUsers = selectedPeopleInput
        ? JSON.parse(selectedPeopleInput.value)
        : [];
    } catch (e) {
      console.error("Error parsing selected people for additional expense:", e);
    }

    if (name && amount !== 0 && selectedUsers.length > 0 && paidBy) {
      items.push({ name, amount, selectedUsers, paidBy });
    }
  });

  return items;
}

/**
 * Calculates the proportional distribution of additional expense items among selected users.
 *
 * @param {Object} userExpenses - An object where keys are user names and values are their total expenses from main items.
 * @returns {Object} An object containing:
 *   - items: An array of additional expense items with their distribution.
 *   - totalAdditionalPerUser: An object summarizing the total additional expense for each user.
 *   - totalAmount: The grand total of all additional expenses.
 */
function calculateAdditionalItemsDistribution(userExpenses) {
  console.log("=== calculateAdditionalItemsDistribution START ===");
  console.log("Input userExpenses:", userExpenses);

  const additionalItems = getAdditionalExpenseItems();
  console.log("Additional items found:", additionalItems);

  const resultItems = [];
  const totalAdditionalPerUser = {};
  let grandTotalAdditional = 0;

  additionalItems.forEach((item, index) => {
    const { name, amount, selectedUsers } = item;
    let totalRelevantExpense = 0;

    console.log(`\n--- Processing Additional Item ${index + 1} ---`);
    console.log("Item Name:", name);
    console.log("Item Amount:", amount);
    console.log("Selected Users for this item:", selectedUsers);

    // Calculate total expense only for users selected in this additional item
    selectedUsers.forEach((user) => {
      if (userExpenses[user]) {
        totalRelevantExpense += userExpenses[user];
      }
    });
    console.log(
      "Total relevant expense from main items for selected users:",
      totalRelevantExpense
    );

    const distribution = {};
    if (totalRelevantExpense > 0) {
      selectedUsers.forEach((user) => {
        if (userExpenses[user]) {
          const proportion = userExpenses[user] / totalRelevantExpense;
          const distributedAmount = amount * proportion;
          distribution[user] = distributedAmount;

          if (!totalAdditionalPerUser[user]) totalAdditionalPerUser[user] = 0;
          totalAdditionalPerUser[user] += distributedAmount;
        }
      });
    } else {
      // If no relevant expense or all selected users have 0 expense, distribute equally
      const equalShare = amount / selectedUsers.length;
      selectedUsers.forEach((user) => {
        distribution[user] = equalShare;
        if (!totalAdditionalPerUser[user]) totalAdditionalPerUser[user] = 0;
        totalAdditionalPerUser[user] += equalShare;
      });
    }
    console.log("Distribution for this item:", distribution);

    grandTotalAdditional += amount;
    resultItems.push({
      name,
      amount,
      selectedUsers,
      distribution,
      paidBy: item.paidBy,
    });
  });

  console.log("\n=== FINAL RESULT ===");
  console.log("Total additional per user:", totalAdditionalPerUser);
  console.log(
    "Grand total additional (sum of all additional item amounts):",
    grandTotalAdditional
  );
  console.log("=== calculateAdditionalItemsDistribution END ===\n");

  return {
    items: resultItems,
    totalAdditionalPerUser: totalAdditionalPerUser,
    totalAmount: grandTotalAdditional,
  };
}

/**
 * Merges additional expense amounts into the main user expenses.
 *
 * @param {Object} userExpenses - The original user expenses from main items.
 * @param {Object} additionalResult - The result from calculateAdditionalItemsDistribution.
 * @returns {Object} A new object with final expenses per user (main + additional).
 */
function mergeAdditionalItemsToSummary(userExpenses, additionalResult) {
  const finalExpenses = { ...userExpenses }; // Clone to avoid modifying original

  for (const user in additionalResult.totalAdditionalPerUser) {
    if (!finalExpenses[user]) finalExpenses[user] = 0;
    finalExpenses[user] += additionalResult.totalAdditionalPerUser[user];
  }
  return finalExpenses;
}
