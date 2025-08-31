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

  if (
    !item ||
    isNaN(amount) ||
    amount <= 0 ||
    whoArray.length === 0 ||
    !paidBy
  ) {
    showToast(
      "Isi item transaksi dulu. Amount harus lebih dari Rp0.",
      "error",
      5000
    );
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
  // document.getElementById("editPaidBy").value = expense.paidBy; // Remove this line
  renderAvatarsPaidBy(expense.paidBy); // Call the new function

  // Load people data
  renderAvatarsEdit();

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
  // Validasi form
  const validation = validateEditExpenseForm();

  if (!validation.isValid) {
    showToast(validation.errors.join(", "), "error", 5000);
    return; // Stop execution jika validasi gagal
  }

  const who = document
    .getElementById("editWho")
    .value.split(",")
    .map((s) => s.trim())
    .filter((s) => s); // hapus string kosong

  const paidByContainer = document.getElementById("editPaidByContainer");
  const paidBy = paidByContainer.dataset.paidBy || ""; // Get the selected paidBy from the data attribute

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
    updateAllAdditionalExpenseAvatars?.();
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
    resetExpenseForm();
  }

  showToast("Expense berhasil diperbarui!", "success", 5000);
}

function validateEditExpenseForm() {
  const item = document.getElementById("editItemName").value.trim();
  const amount = parseFloat(document.getElementById("editAmount").value);
  const who = document.getElementById("editWho").value.trim();
  const paidByContainer = document.getElementById("editPaidByContainer");
  const paidBy = paidByContainer.dataset.paidBy || ""; // Get the selected paidBy from the data attribute

  const errors = [];

  if (!item) errors.push("Item Name harus diisi");
  if (isNaN(amount) || amount <= 0) errors.push("Jumlah harus lebih dari Rp0");
  if (!who) errors.push("Pilih minimal 1 orang yang berhutang");
  if (!paidBy) errors.push("Pilih siapa yang membayar");

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
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

const addAdditionalExpenseBtn = document.getElementById("addAdditionalExpense");
const additionalExpenseContainer = document.getElementById(
  "additionalExpenseContainer"
);

addAdditionalExpenseBtn.addEventListener("click", () => {
  const div = document.createElement("div");
  div.classList.add("additional-expense-item-container");
  const uniqueId = Date.now(); // Generate a unique ID for this item

  div.innerHTML = `
  <div class="additional-expense-item">
    <input type="text" placeholder="Nama Pengeluaran" class="additional-expense-name" />
    <input type="text" id="addAdditionalExpenseAmountFormatted-${uniqueId}" placeholder="Jumlah"/>
    <input type="hidden" id="addAdditionalExpenseAmount-${uniqueId}"  class="additional-expense-amount"/>
     <button class="delete-btn"><i class="uil uil-trash"></i></button>
  </div>
  <div>
    <label for="additionalExpensePaidBy-${uniqueId}">Dibayar oleh</label>
    <select class="additional-expense-paid-by" id="additionalExpensePaidBy-${uniqueId}">
      <option value="">Pilih yang membayar</option>
    </select>
  </div>
  <div>
    <label>Split dengan Siapa</label>
    <div class="avatar-container-additional" id="avatarContainerAdditional-${uniqueId}"></div>
    <input type="hidden" class="selected-people-additional" id="selectedPeopleAdditional-${uniqueId}" value="[]" />
  </div>

  `;

  // tombol hapus untuk remove item
  div.querySelector(".delete-btn").addEventListener("click", () => {
    div.remove();
  });

  additionalExpenseContainer.appendChild(div);

  // Setup currency formatter for the new amount input
  setupCurrencyFormatter(
    `addAdditionalExpenseAmountFormatted-${uniqueId}`,
    `addAdditionalExpenseAmount-${uniqueId}`
  );

  // Render avatars for the newly added expense item
  renderAvatarsForAdditionalExpense(
    `avatarContainerAdditional-${uniqueId}`,
    `selectedPeopleAdditional-${uniqueId}`
  );

  // Populate the "Dibayar oleh" dropdown
  populateAdditionalExpensePaidByDropdown(
    `additionalExpensePaidBy-${uniqueId}`
  );
});

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

/**
 * Renders a list of avatars in a specified container for additional expenses.
 *
 * This function retrieves the list of people from local storage and updates the
 * specified avatar container with their avatars and names. Each avatar is generated
 * using the Dicebear API and is clickable to toggle its selection state. The selected
 * state is indicated with a visual change, and selections are saved back to the
 * associated hidden input. If there are no people in the list, a message prompting
 * the user to add friends is displayed instead.
 *
 * @param {string} containerId - The ID of the HTML element where avatars will be rendered.
 * @param {string} hiddenInputId - The ID of the hidden input field that stores selected people.
 */
function renderAvatarsForAdditionalExpense(containerId, hiddenInputId) {
  const container = document.getElementById(containerId);
  const hiddenInput = document.getElementById(hiddenInputId);
  if (!container || !hiddenInput) return;

  let people = loadFromLocalStorage("people") || [];
  let selectedPeople = JSON.parse(hiddenInput.value || "[]");

  container.innerHTML = "";

  if (people.length === 0) {
    const emptyText = document.createElement("div");
    emptyText.className = "empty-text";
    emptyText.textContent = "Tambahkan teman terlebih dahulu";
    container.appendChild(emptyText);
    return;
  }

  people
    .slice()
    .reverse()
    .forEach((person) => {
      const avatarWrapper = document.createElement("div");
      avatarWrapper.className = "avatar-wrapper";

      const avatar = document.createElement("img");
      avatar.className = `avatar-img ${
        selectedPeople.includes(person) ? "selected" : ""
      }`;
      avatar.src = `${AVATAR_BASE_URL}${encodeURIComponent(person)}`;
      avatar.alt = person;

      const nameLabel = document.createElement("div");
      nameLabel.className = "avatar-name";
      nameLabel.textContent = person;

      avatar.onclick = () => {
        toggleAvatarSelectionAdditional(person, containerId, hiddenInputId);
      };

      avatarWrapper.appendChild(avatar);
      avatarWrapper.appendChild(nameLabel);
      container.appendChild(avatarWrapper);
    });
}

/**
 * Toggles the selection state of an avatar for an additional expense item.
 *
 * This function updates the `selectedPeople` array associated with a specific
 * additional expense item, saves the updated array to the corresponding hidden
 * input, and then re-renders the avatars for that item to reflect the change.
 *
 * @param {string} personName - The name of the person whose avatar was clicked.
 * @param {string} containerId - The ID of the avatar container.
 * @param {string} hiddenInputId - The ID of the hidden input field storing selected people.
 */
function toggleAvatarSelectionAdditional(
  personName,
  containerId,
  hiddenInputId
) {
  const hiddenInput = document.getElementById(hiddenInputId);
  if (!hiddenInput) return;

  let selectedPeople = JSON.parse(hiddenInput.value || "[]");

  if (selectedPeople.includes(personName)) {
    selectedPeople = selectedPeople.filter((name) => name !== personName);
  } else {
    selectedPeople.push(personName);
  }

  hiddenInput.value = JSON.stringify(selectedPeople);
  renderAvatarsForAdditionalExpense(containerId, hiddenInputId); // Re-render to update UI
}

/**
 * Populates the "Dibayar oleh" dropdown for additional expense items.
 *
 * @param {string} selectId - The ID of the select element to populate
 */
function populateAdditionalExpensePaidByDropdown(selectId) {
  const selectElement = document.getElementById(selectId);
  if (!selectElement) return;

  const people = loadFromLocalStorage("people") || [];

  // Clear existing options except the first one
  selectElement.innerHTML = '<option value="">Pilih yang membayar</option>';

  // Add people as options
  people.forEach((person) => {
    const option = document.createElement("option");
    option.value = person;
    option.textContent = person;
    selectElement.appendChild(option);
  });
}
