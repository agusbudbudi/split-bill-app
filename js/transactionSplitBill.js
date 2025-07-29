// Fungsi untuk memformat mata uang Rupiah
function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// Fungsi untuk memformat tanggal
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Fungsi untuk mendapatkan initial dari nama
function getInitials(name) {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .substring(0, 2);
}

// Fungsi untuk mendapatkan semua participants dari transaction
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

// Fungsi untuk membuat profile icons
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

// Fungsi untuk membuat HTML transaction item
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
                        <div class="split-bill-amount">${formatCurrency(
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
                            <span class="participants-count">Split dengan ${participantCount} teman</span>
                        </div>
                    </div>
                </div>
            `;
}

// Fungsi untuk load data dari localStorage (gunakan ini dalam implementasi nyata)
function loadDataFromLocalStorage() {
  try {
    const data = localStorage.getItem("splitBillHistoryList");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading data from localStorage:", error);
    return [];
  }
}

// Fungsi untuk render transaction list
function renderTransactionList() {
  const container = document.getElementById("SplitBillList");

  // Dalam implementasi nyata, gunakan:
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

// Fungsi untuk membuka detail transaksi (placeholder)
function openTransactionDetail(splitBillNumber) {
  console.log("Open detail for:", splitBillNumber);
  // Implementasi detail view bisa ditambahkan di sini
  alert(`Detail untuk ${splitBillNumber}`);
}

// Inisialisasi saat halaman dimuat
document.addEventListener("DOMContentLoaded", function () {
  renderTransactionList();
});

// Fungsi untuk refresh data (bisa dipanggil dari luar)
window.refreshTransactionList = function () {
  renderTransactionList();
};
