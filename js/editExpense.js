let currentEditIndex = null;

function editExpense(index) {
  // Fix: Use window.expenses consistently
  const expense = window.expenses[index];
  currentEditIndex = index;

  document.getElementById("editItemName").value = expense.item;
  document.getElementById("editAmount").value = expense.amount;
  document.getElementById("editWho").value = expense.who.join(", ");
  document.getElementById("editPaidBy").value = expense.paidBy;
  document.getElementById("overlay").classList.remove("hidden");

  openBottomSheet("editBottomSheet");
}

// ADD: Missing deleteExpense function
function deleteExpense(index) {
  if (confirm("Hapus expense ini?")) {
    window.expenses.splice(index, 1);
    updateExpenseCards();
    updateCalculateButton(); // If this function exists
    showToast("Expense berhasil dihapus!", "success", 2000);
  }
}

function closeBottomSheet() {
  const sheet = document.getElementById("editBottomSheet");
  sheet.classList.remove("show");
  setTimeout(() => {
    sheet.classList.add("hidden");
  }, 300);
  document.getElementById("overlay").classList.add("hidden");

  showToast("Expense berhasil dihapus!", "success", 5000);
}

// ADD: Missing openBottomSheet function
function openBottomSheet(sheetId) {
  const sheet = document.getElementById(sheetId);
  if (sheet) {
    sheet.classList.remove("hidden");
    setTimeout(() => {
      sheet.classList.add("show");
    }, 10);
  }
}

function saveEditedExpense() {
  const item = document.getElementById("editItemName").value;
  const amount = parseFloat(document.getElementById("editAmount").value);
  const who = document
    .getElementById("editWho")
    .value.split(",")
    .map((s) => s.trim());
  const paidBy = document.getElementById("editPaidBy").value;

  if (currentEditIndex !== null) {
    // Fix: Use window.expenses consistently
    window.expenses[currentEditIndex] = {
      item,
      amount,
      who,
      paidBy,
    };

    updateTable(); // If this function exists
    updateExpenseCards();
    updateCalculateButton(); // If this function exists
    closeBottomSheet("editBottomSheet");
  }

  showToast("Expense berhasil diperbarui!", "success", 5000);
}

// Shared functions and global variables
// This file should be loaded first before other scanner files

// Initialize global expenses array
window.expenses = window.expenses || [];

// Shared function to update expense cards display
function updateExpenseCards() {
  const container = document.getElementById("expense-list");
  if (!container) {
    console.log("Current expenses:", window.expenses);
    return;
  }

  container.innerHTML = "";
  console.log("Expenses:", window.expenses);
  console.log("Is empty:", window.expenses.length === 0);

  if (window.expenses.length === 0) {
    container.innerHTML = `
    <div class="empty-state">
    <img src="img/empty-state.png" alt="Empty State" class="empty-state-image">
    <p class="title-empty-state">Belum ada daftar transaksi</p>
    <p class="desc-empty-state">Scan bill atau tambah manual untuk menambah transaksi</p></div>`;
    return;
  }

  let cardsHTML = "";
  window.expenses.forEach((expense, index) => {
    const isWhoEmpty =
      !expense.who ||
      !expense.who.length ||
      expense.who.every((name) => name.trim() === "");
    const isPaidByEmpty = !expense.paidBy || expense.paidBy.trim() === "";

    const whoAvatars = isWhoEmpty
      ? `<div class="add-new-wrapper person-item">
          <div class="edit-expense" onclick="editExpense(${index})">
            <i class="fa-solid fa-plus"></i>
          </div>
          <span class="edit-expense-text">Edit</span>
        </div>`
      : expense.who
          .map(
            (name) => `
          <div class="avatar-wrapper">
            <div class="avatar-box">
              <img src="https://api.dicebear.com/9.x/personas/svg?backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=32&scale=100&seed=${name}" alt="${name}">
            </div>
            <div class="avatar-name">${name}</div>
          </div>`
          )
          .join("");

    const paidByAvatar = isPaidByEmpty
      ? `<div class="add-new-wrapper person-item">
          <div class="edit-expense" onclick="editExpense(${index})">
            <i class="fa-solid fa-plus"></i>
          </div>
          <span class="edit-expense-text">Edit</span>
        </div>`
      : `<div class="avatar-wrapper">
          <div class="avatar-box">
            <img src="https://api.dicebear.com/9.x/personas/svg?backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=32&scale=100&seed=${expense.paidBy}" alt="${expense.paidBy}">
          </div>
          <div class="avatar-name">${expense.paidBy}</div>
        </div>`;

    cardsHTML += `
      <div class="expense-card">
        <div class="expense-header">
          <span>${expense.item}</span>
          <span>${formatToIDR(expense.amount)}</span>
        </div>

        <div class="expense-meta">
          <div class="label-columns">
            <div class="label-row">
                <div class="people-list">
                  ${whoAvatars}
                </div>
            </div>
            <div class="label-row">
                <label>Dibayar oleh:</label>
                <div class="people-list">
                  ${paidByAvatar}
                </div>
            </div>
          </div>

          <div class="action-buttons">
            <button class="edit-btn" onclick="editExpense(${index})"><i class="uil uil-edit"></i></i></button>
            <button class="delete-btn" onclick="deleteExpense(${index})"><i class="uil uil-trash"></i></button>
          </div
        </div>
      </div>`;
  });

  container.innerHTML = cardsHTML;
}

// Shared currency formatting function
// Fixed currency formatting function
// function formatCurrency(amount) {
//   // Ensure amount is a number, default to 0 if not
//   const numericAmount =
//     typeof amount === "number" ? amount : parseFloat(amount) || 0;

//   return new Intl.NumberFormat("id-ID", {
//     style: "currency",
//     currency: "IDR",
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 0,
//   }).format(numericAmount); // Use numericAmount instead of amount
// }

// Shared toast notification function
function showToast(message, type = "success", duration = 3000) {
  // Remove existing toasts
  const existingToasts = document.querySelectorAll(".toast");
  existingToasts.forEach((toast) => toast.remove());

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-content">
      <i class="fa-solid ${
        type === "success" ? "fa-check-circle" : "fa-exclamation-circle"
      }"></i>
      <span>${message}</span>
    </div>
  `;

  document.body.appendChild(toast);

  // Show toast
  setTimeout(() => toast.classList.add("show"), 100);

  // Hide and remove toast
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Shared price cleaning function
function cleanPriceString(priceStr) {
  if (!priceStr) return 0;
  // Remove currency symbols, commas, dots used as thousand separators
  // Handle formats like: 43,000 or 43.000 or Rp 43,000
  return parseInt(priceStr.toString().replace(/[^\d]/g, "")) || 0;
}

// Shared function to add expenses to global array
function addExpensesToGlobal(newExpenses) {
  if (!Array.isArray(newExpenses)) return;

  newExpenses.forEach((expense) => {
    const expenseItem = {
      item: expense.item || expense.name || "Unknown Item",
      amount:
        typeof expense.amount === "number"
          ? expense.amount
          : cleanPriceString(expense.amount || expense.total || expense.price),
      who: expense.who || [], // Empty array initially - user needs to edit
      paidBy: expense.paidBy || "", // Empty initially - user needs to edit
    };
    window.expenses.push(expenseItem);
  });

  // Update display
  updateExpenseCards();

  // Show success message
  showToast(
    `${newExpenses.length} item berhasil ditambahkan ke expense list!`,
    "success",
    4000
  );
}

// Export functions for global access
window.updateExpenseCards = updateExpenseCards;
window.showToast = showToast;
window.cleanPriceString = cleanPriceString;
window.addExpensesToGlobal = addExpensesToGlobal;
window.editExpense = editExpense;
window.deleteExpense = deleteExpense;
window.openBottomSheet = openBottomSheet;
window.closeBottomSheet = closeBottomSheet;
window.saveEditedExpense = saveEditedExpense;
