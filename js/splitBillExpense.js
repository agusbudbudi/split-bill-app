let currentEditIndex = null;

/**
 * Tambahkan expense baru ke dalam array window.expenses
 * @param {string} item - Nama item transaksi
 * @param {number} amount - Jumlah yang dibayar
 * @param {string} paidBy - Nama orang yang membeli
 * @param {string[]} who - Nama orang yang berhutang
 * @return {void}
 */
function addExpense() {
  const item = document.getElementById("item").value.trim();
  const amount = parseFloat(document.getElementById("splitAmount").value);
  const paidBy = document.getElementById("paidBy").value.trim();

  // Ambil dari localStorage, default ke array kosong
  const whoArray = JSON.parse(localStorage.getItem("who")) || [];

  if (!item || isNaN(amount) || whoArray.length === 0 || !paidBy) {
    showToast("Isi terlebih dahulu item transaksi", "error", 5000);
    return;
  }

  const newExpense = {
    item,
    amount,
    who: [...whoArray],
    paidBy,
  };

  window.expenses.push(newExpense);

  updateCalculateButton?.();
  window.updateExpenseCards();

  // Reset input dan localStorage
  resetExpenseForm();
  renderAvatars?.();

  showToast("Expense berhasil ditambahkan!", "success", 5000);
}

/**
 * Update tombol calculate button, kalo ada expense maka tombol enable
 * dan info box hidden, kalo tidak ada expense maka tombol disable
 * dan info box tampil.
 */
function updateCalculateButton() {
  const calculateBtn = document.getElementById("calculateBtn");
  const infoBox = document.querySelector(".validasi-split-bill");

  if (!calculateBtn) {
    console.warn("Tombol calculateBtn tidak ditemukan di DOM.");
    return;
  }

  const hasExpenses =
    Array.isArray(window.expenses) && window.expenses.length > 0;

  calculateBtn.disabled = !hasExpenses;
  calculateBtn.classList.toggle("disabled-btn", !hasExpenses);

  if (infoBox) {
    infoBox.style.display = hasExpenses ? "none" : "flex";
  }
}

/**
 * Removes the "selected" class from all avatar images in the avatar container.
 * This is typically used when the user opens the edit expense bottom sheet.
 */
function resetSelectedAvatars() {
  // Hapus dari localStorage
  localStorage.removeItem("who");

  // Hapus class selected dari avatar
  const selectedAvatars = document.querySelectorAll(
    "#avatarContainer .avatar-wrapper .avatar-img.selected"
  );
  selectedAvatars.forEach((avatar) => {
    avatar.classList.remove("selected");
  });
}

/**
 * Reset input field item, splitAmountFormatted, and selected avatars
 * @return {void}
 */
function resetExpenseForm() {
  document.getElementById("item").value = "";
  document.getElementById("splitAmountFormatted").value = "";
  resetSelectedAvatars();
}

/**
 * Opens the edit expense bottom sheet and populates the fields with the selected expense data.
 * @param {number} index - The index of the expense in the window.expenses array
 */
function editExpense(index) {
  // Validate index
  if (!window.expenses || !window.expenses[index]) {
    console.error("Invalid expense index:", index);
    return;
  }

  const expense = window.expenses[index];
  currentEditIndex = index;

  // Populate form fields
  document.getElementById("editItemName").value = expense.item;
  document.getElementById("editAmountFormatted").value = formatToIDR(
    expense.amount
  );
  document.getElementById("editAmount").value = expense.amount;
  document.getElementById("editWho").value = expense.who.join(", ");
  document.getElementById("editPaidBy").value = expense.paidBy;

  // Initialize currency formatter for edit field
  setupCurrencyFormatter("editAmountFormatted", "editAmount");

  openBottomSheet("editBottomSheet");
  showOverlay();
}

/**
 * Deletes an expense from the window.expenses array and updates the display.
 * @param {number} index - The index of the expense in the window.expenses array
 */
function deleteExpense(index) {
  // Validate index
  if (!window.expenses || !window.expenses[index]) {
    console.error("Invalid expense index:", index);
    return;
  }

  if (confirm("Hapus expense ini?")) {
    window.expenses.splice(index, 1);
    updateExpenseCards();
    showToast("Expense berhasil dihapus!", "success", 5000);
  }
}

/**
 * Save edited expense data to memory (not to localStorage).
 * If the user adds new names, update the people array in localStorage.
 * Call update functions if they exist.
 * Close the bottom sheet.
 * Show a success toast.
 *
 * @param {number} currentEditIndex - The index of the expense in window.expenses
 */
function saveEditedExpense() {
  const item = document.getElementById("editItemName").value;
  const amount = parseFloat(document.getElementById("editAmount").value); // dari hidden input

  const who = document
    .getElementById("editWho")
    .value.split(",")
    .map((s) => s.trim())
    .filter((s) => s); // hapus string kosong

  const paidBy = document.getElementById("editPaidBy").value.trim();

  // Ambil data orang dari localStorage
  let people = loadFromLocalStorage("people") || [];

  // Gabungkan who dan paidBy, lalu tambahkan nama baru jika belum ada
  const allNames = [...who, paidBy];
  let updated = false;

  allNames.forEach((name) => {
    if (name && !people.includes(name)) {
      people.push(name);
      updated = true;
    }
  });

  if (updated) {
    saveToLocalStorage("people", people);
    updateDropdowns?.();
    renderPeople?.();
    renderAvatars?.();
  }

  // Update data expense di memori (tidak ke localStorage)
  if (currentEditIndex !== null) {
    window.expenses[currentEditIndex] = {
      item,
      amount,
      who,
      paidBy,
    };

    updateExpenseCards?.();
    updateCalculateButton?.(); // opsional, jika ada
    closeBottomSheet("editBottomSheet");
  }

  showToast("Expense berhasil diperbarui!", "success", 5000);
}

// Constants
const AVATAR_BASE_URL =
  "https://api.dicebear.com/9.x/personas/svg?backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=32&scale=100&seed=";

// Global variables
window.expenses = window.expenses || [];

/**
 * Updates the expense cards container with the current expenses in memory.
 * If there are no expenses, the container will be hidden.
 * If there are expenses, the container will be shown and the expense cards will be rendered.
 * Each expense card will have the item name, amount, who (avatars), and paid by (avatar).
 */
function updateExpenseCards() {
  const container = document.getElementById("expense-list");
  if (!container) {
    console.log("Current expenses:", window.expenses);
    return;
  }

  container.innerHTML = "";
  console.log("Expenses:", window.expenses);

  // Handle expense card container visibility
  const expenseCard =
    document.getElementById("expenseCard") ||
    document.querySelector(".card-container");
  if (window.expenses.length === 0) {
    if (expenseCard) {
      expenseCard.classList.add("hidden");
    }
  } else {
    if (expenseCard) {
      expenseCard.classList.remove("hidden");
    }
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
              <img src="${AVATAR_BASE_URL}${name}" alt="${name}">
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
            <img src="${AVATAR_BASE_URL}${expense.paidBy}" alt="${expense.paidBy}">
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
            <button class="edit-btn" onclick="editExpense(${index})"><i class="uil uil-edit"></i></button>
            <button class="delete-btn" onclick="deleteExpense(${index})"><i class="uil uil-trash"></i></button>
          </div>
        </div>
      </div>`;
  });

  container.innerHTML = cardsHTML;
}

document.addEventListener("DOMContentLoaded", () => {
  if (window.updateExpenseCards) {
    window.updateExpenseCards();
  }
  updateCalculateButton();
});

// Export functions for global access
window.updateExpenseCards = updateExpenseCards;
window.editExpense = editExpense;
window.deleteExpense = deleteExpense;
window.saveEditedExpense = saveEditedExpense;
