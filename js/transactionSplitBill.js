/**
 * Mendapatkan semua peserta yang terlibat dalam suatu transaksi split bill.
 * Peserta terlibat adalah orang-orang yang membayar, membayar sebagian,
 * atau menerima biaya dari transaksi tersebut.
 *
 * @param {Object} transaction - Transaksi split bill yang ingin diolah.
 * @return {Array<string>} Nama peserta yang terlibat dalam transaksi.
 */
function getAllParticipants(transaction) {
  const participants = new Set();

  // Tambah dari userExpenses
  Object.keys(transaction.userExpenses).forEach((user) =>
    participants.add(user)
  );

  // Tambah dari userPayments
  Object.keys(transaction.userPayments).forEach((user) =>
    participants.add(user)
  );

  // Tambah dari expenses
  transaction.expenses.forEach((expense) => {
    expense.who.forEach((person) => participants.add(person));
    participants.add(expense.paidBy);
  });

  return Array.from(participants);
}

/**
 * Generates HTML for a set of profile icons based on the given participants.
 *
 * This function creates a visual representation of the participants in a transaction
 * by generating up to three profile icons. Each icon is associated with a participant's
 * name and represents it using an avatar image. If there are more than three participants,
 * an additional indicator is displayed to show the number of remaining participants.
 *
 * @param {Array<string>} participants - An array of participant names.
 * @return {string} A string of HTML containing the profile icons and an indicator if applicable.
 */

function createProfileIcons(participants) {
  const maxVisible = 3;
  let iconsHTML = "";

  // Tampilkan maksimal 3 icon
  for (let i = 0; i < Math.min(participants.length, maxVisible); i++) {
    const name = participants[i];
    iconsHTML += `
                    <div class="profile-icon" title="${name}">
                        <img src="https://api.dicebear.com/9.x/personas/svg?backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=32&scale=100&seed=${encodeURIComponent(
                          name
                        )}" class="friend-img" />
                    </div>
                `;
  }

  // Jika ada lebih dari 3 participants, tampilkan indicator
  if (participants.length > maxVisible) {
    const remaining = participants.length - maxVisible;
    iconsHTML += `<div class="more-participants">+${remaining}</div>`;
  }

  return iconsHTML;
}

/**
 * Generates HTML for a transaction item card, displaying transaction details and participants.
 *
 * This function creates an HTML representation of a transaction item, including the split bill number,
 * total expense, activity name, date, and a preview of participant profile icons. The card includes
 * an interactive element that allows users to open transaction details by clicking on it.
 *
 * @param {Object} transaction - An object containing transaction details including splitBillNumber,
 * totalExpense, activityName, and date.
 * @returns {string} A string of HTML representing the transaction item card.
 */

function createTransactionItemHTML(transaction) {
  const participants = getAllParticipants(transaction);
  const profileIconsHTML = createProfileIcons(participants);
  const participantCount = participants.length;

  return `
                <div class="splitBill-card" onclick="openTransactionDetail('${
                  transaction.splitBillNumber
                }')">
                    <div class="transaction-header">
                        <div class="split-bill-number"> <i class="uil uil-bill invoice-icon"></i> ${
                          transaction.splitBillNumber
                        }</div>
                        <div class="split-bill-amount">${formatToIDR(
                          transaction.totalExpense
                        )}</div>
                    </div>
                    <div class="transaction-body">
                        <div class="transaction-info">
                            <div class="activity-name">${
                              transaction.activityName ||
                              "Aktivitas tidak disebutkan"
                            }</div>
                            <div class="activity-date">${formatDate(
                              transaction.date
                            )}</div>
                        </div>
                    </div>
                    <div class="transaction-footer">
                        <div class="participants-preview">
                            <div class="profile-icons">
                                ${profileIconsHTML}
                            </div>
                            <span class="participants-count"> ${participantCount} teman</span>
                        </div>
                        <div class="see-detail">Lihat Detail<i class="uil uil-angle-right-b"></i></div>
                    </div>
                </div>
            `;
}

/**
 * Loads the split bill history from localStorage.
 *
 * This function retrieves the data from localStorage and parses it as JSON.
 * If the data is not available or there is an error while parsing, it returns an empty array.
 *
 * @return {Array<Object>} The split bill history data, or an empty array if there is an error.
 */
function loadDataFromLocalStorage() {
  try {
    const data = localStorage.getItem("splitBillHistoryList");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading data from localStorage:", error);
    return [];
  }
}

/**
 * Renders the list of split bill transactions.
 *
 * This function renders the list of split bill transactions in the #SplitBillList container.
 * If there is no data available, it shows a "no data" message.
 *
 * @return {void}
 */
function renderTransactionList() {
  const container = document.getElementById("SplitBillList");

  const data = loadDataFromLocalStorage();

  if (!data || data.length === 0) {
    container.innerHTML = `
           <div class="no-data-message">
                <img src="img/state-search.png" alt="Empty State" class="empty-state-image">
                <p class="title-empty-state">Belum ada Split Bill yang disimpan<p>
                <p class="desc-empty-state">Buat Split Bill sekarang!<p>

                <button class="secondary-button" onclick="window.location.href='index.html'">
                    <i class="uil uil-plus"></i> Buat Split Bill
                </button>
            </div>
    `;
    return;
  }

  // Sort data berdasarkan tanggal (terbaru dulu)
  const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));

  const html = sortedData.map(createTransactionItemHTML).join("");
  container.innerHTML = html;
}

/**
 * Opens the detail page of a split bill transaction.
 *
 * This function takes a split bill number as a parameter and opens the detail page
 * of the split bill transaction with that number. It validates whether the split
 * bill number is available and whether the data is available in localStorage.
 * If the data is not found, it shows an error message to the user.
 *
 * @param {string} splitBillNumber - the split bill number to open the detail page for
 * @return {void}
 */
function openTransactionDetail(splitBillNumber) {
  console.log("Open detail for:", splitBillNumber);

  // Validasi apakah splitBillNumber ada
  if (!splitBillNumber) {
    console.error("Split bill number is required");
    return;
  }

  // Validasi apakah data ada di localStorage
  const storedData = localStorage.getItem("splitBillHistoryList");
  if (!storedData) {
    alert("Tidak ada data split bill yang tersimpan");
    return;
  }

  const splitBillList = JSON.parse(storedData);
  const selectedSplitBill = splitBillList.find(
    (item) => item.splitBillNumber === splitBillNumber
  );

  if (!selectedSplitBill) {
    alert(`Split bill ${splitBillNumber} tidak ditemukan`);
    return;
  }

  // Buka halaman detail dengan parameter splitBillNumber
  window.location.href = `splitBill-detail.html?id=${encodeURIComponent(
    splitBillNumber
  )}`;
}

/**
 * Loads the latest split bill transactions from localStorage.
 *
 * This function retrieves the data from localStorage and sorts it by date
 * in descending order. It then returns the first `limit` transactions.
 * If there is no data available or there is an error while parsing, it returns an empty array.
 *
 * @param {number} [limit = 3] - The number of transactions to load
 * @return {Array<Object>} The latest split bill transactions, or an empty array if there is an error.
 */
function loadLatestTransactions(limit = 3) {
  const data = loadDataFromLocalStorage();
  const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
  return sorted.slice(0, limit);
}

/**
 * Renders the latest split bill transactions on the landing page.
 *
 * This function retrieves the latest three split bill transactions from localStorage,
 * and renders them in the #SplitBillList container. If there are no transactions available,
 * it shows an empty state message with a button to create a new split bill transaction.
 *
 * @return {void}
 */
function renderLatestTransactionsOnLanding() {
  const container = document.getElementById("SplitBillList");
  const latestData = loadLatestTransactions(3);

  if (!latestData || latestData.length === 0) {
    container.innerHTML = `
           <div class="no-data-message">
                <img src="img/state-search.png" alt="Empty State" class="empty-state-image">
                <p class="title-empty-state">Belum ada Split Bill yang disimpan<p>
                <p class="desc-empty-state">Buat Split Bill sekarang!<p>

                <button class="secondary-button" onclick="window.location.href='index.html'">
                    <i class="uil uil-plus"></i> Buat Split Bill
                </button>
            </div>
    `;
    return;
  }

  const html = latestData.map(createTransactionItemHTML).join("");
  container.innerHTML = html;
}

// Inisialisasi saat halaman dimuat
document.addEventListener("DOMContentLoaded", function () {
  renderTransactionList();
});
