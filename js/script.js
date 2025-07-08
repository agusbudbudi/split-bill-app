// Remove local expenses array - use window.expenses from shared function
// let expenses = []; // REMOVE THIS LINE
let itemCount = 0;

function addExpense() {
  const item = document.getElementById("item").value;
  const amount = parseFloat(document.getElementById("splitAmount").value);
  const paidBy = document.getElementById("paidBy").value.trim();

  // Fix: Check if who variable exists, if not get from global scope or default to empty array
  const whoArray = typeof who !== "undefined" ? who : [];

  // Fix: Proper validation - check if amount is valid number and not negative
  if (
    !item ||
    isNaN(amount) ||
    amount <= 0 ||
    whoArray.length === 0 ||
    !paidBy
  ) {
    alert("Isi terlebih dahulu item transaksi");
    return;
  }

  // Use window.expenses instead of local expenses array
  const newExpense = {
    item,
    amount,
    who: [...whoArray], // Create copy of who array
    paidBy,
  };

  window.expenses.push(newExpense);

  // Use shared functions for updates
  updateTable(); // Keep if exists for backward compatibility
  updateCalculateButton();

  // Use shared function to update cards display
  window.updateExpenseCards();

  // Reset field input
  document.getElementById("item").value = "";
  document.getElementById("splitAmountFormatted").value = "";

  // Reset selected avatar (who)
  if (typeof who !== "undefined") {
    who.length = 0; // Clear the who array
  }
  if (typeof renderAvatars === "function") {
    renderAvatars(); // refresh tampilan avatar
  }

  // Show success toast using shared function
  window.showToast("Expense berhasil ditambahkan!", "success", 2000);
}

function updateCalculateButton() {
  const calculateBtn = document.getElementById("calculateBtn");
  const infoBox = document.querySelector(".validasi-split-bill");

  // Use window.expenses instead of local expenses
  if (window.expenses.length > 0) {
    calculateBtn.disabled = false;
    calculateBtn.classList.remove("disabled-btn");
    if (infoBox) infoBox.style.display = "none";
  } else {
    calculateBtn.disabled = true;
    calculateBtn.classList.add("disabled-btn");
    if (infoBox) infoBox.style.display = "flex";
  }
}

// UNUSED CODE - Keep for backward compatibility but use window.expenses
function updateTable() {
  const tbody = document.querySelector("#expense-table tbody");
  if (!tbody) return; // Guard clause if table doesn't exist

  tbody.innerHTML = "";

  // Use window.expenses instead of local expenses
  if (window.expenses.length === 0) {
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = `
      <td colspan="5" style="text-align: center; padding: 10px; color: #888;">
        Belum ada daftar transaksi pengeluaran
      </td>
    `;
    tbody.appendChild(emptyRow);
  } else {
    window.expenses.forEach((expense, index) => {
      const row = `<tr>
                        <td>${expense.item}</td>
                        <td>
                          ${window.formatCurrency(expense.amount)}
                          ${
                            expense.amount < 0
                              ? '<span class="discount-label">Diskon</span>'
                              : ""
                          }
                        </td>
                        <td>${expense.who.join(", ")}</td>
                        <td>${expense.paidBy}</td>
                        <td>
                          <div class="action-buttons">
                            <button class="edit-btn" onclick="window.editExpense(${index})"><i class="fa-solid fa-pen-to-square"></i></button>
                            <button class="delete-btn" onclick="window.deleteExpense(${index})"><i class="fa-regular fa-trash-can"></i></button>
                          </div>
                        </td>
                    </tr>`;
      tbody.innerHTML += row;
    });
  }
}
// REMOVE LOCAL deleteExpense - use shared function instead
// Keep this comment as reference but remove the duplicate function

function calculateSplit() {
  let totalExpense = 0;
  let userExpenses = {};
  let userPayments = {};

  // Use window.expenses instead of local expenses
  window.expenses.forEach(({ amount, who, paidBy }) => {
    totalExpense += amount;

    // Track expenses per user (based on 'who' needs to pay)
    who.forEach((person) => {
      if (!userExpenses[person]) userExpenses[person] = 0;
      userExpenses[person] += amount / who.length;
    });

    // Track amount paid by each user (based on 'paidBy')
    if (!userPayments[paidBy]) userPayments[paidBy] = 0;
    userPayments[paidBy] += amount;
  });

  let variance = calculateVariance(userExpenses, userPayments, totalExpense);
  displaySummary(totalExpense, userExpenses, userPayments, variance);
}

function calculateVariance(userExpenses, userPayments, totalExpense) {
  let variance = {};

  // Calculate even share for each person
  let evenShare = totalExpense / Object.keys(userExpenses).length;

  // Calculate variance: how much each person owes or is owed
  for (let user in userExpenses) {
    let paidAmount = userPayments[user] || 0;
    variance[user] = paidAmount - userExpenses[user];
  }

  return variance;
}

document.addEventListener("DOMContentLoaded", () => {
  updateTable(); // Ensure the empty state is shown on page load

  // Use shared function for updating expense cards
  if (window.updateExpenseCards) {
    window.updateExpenseCards();
  }

  updateCalculateButton();
});
