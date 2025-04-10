let expenses = [];
let itemCount = 0;

function addExpense() {
  const item = document.getElementById("item").value;
  const amountValue = document.getElementById("amount").value; // handle negative amount
  const amount = parseFloat(document.getElementById("amount").value);
  const paidBy = document.getElementById("paidBy").value.trim();

  //add isNaN buat handle negative amount
  if (!item || isNaN(!amount) || who.length === 0 || !paidBy) {
    alert("Please fill all fields correctly");
    return;
  }

  expenses.push({ item, amount, who, paidBy });
  updateTable();
  updateCalculateButton();

  // Reset field input
  document.getElementById("item").value = "";
  document.getElementById("amountFormatted").value = "";
  document.getElementById("paidBy").value = "";

  // Reset selected avatar (who)
  who = [];
  renderAvatars(); // refresh tampilan avatar
}

function updateCalculateButton() {
  const calculateBtn = document.getElementById("calculateBtn");
  if (expenses.length > 0) {
    calculateBtn.disabled = false;
    calculateBtn.classList.remove("disabled-btn");
  } else {
    calculateBtn.disabled = true;
    calculateBtn.classList.add("disabled-btn");
  }
}

function updateTable() {
  const tbody = document.querySelector("#expense-table tbody");
  tbody.innerHTML = "";

  // If there are no expenses, display empty state message
  if (expenses.length === 0) {
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = `
      <td colspan="5" style="text-align: center; padding: 10px; color: #888;">
        Belum ada daftar transaksi pengeluaran
      </td>
    `;
    tbody.appendChild(emptyRow);
  } else {
    // Otherwise, populate the table with expenses
    expenses.forEach((expense, index) => {
      const row = `<tr>
                        <td>${expense.item}</td>
                        
                        <td>
                          ${formatCurrency(expense.amount)}
                          ${
                            expense.amount < 0
                              ? '<span class="discount-label">Diskon</span>'
                              : ""
                          }
                        </td>
                        <td>${expense.who.join(", ")}</td>
                        <td>${expense.paidBy}</td>
                        <td>
                        <button class="delete-btn" onclick="deleteExpense(${index})"><i class="fa-regular fa-trash-can"></i> Hapus</button></td>
                    </tr>`;
      tbody.innerHTML += row;
    });
  }
}

// Function to delete an expense
function deleteExpense(index) {
  expenses.splice(index, 1); // Remove expense from the array
  updateTable(); // Refresh the table
  updateCalculateButton();
}

function calculateSplit() {
  let totalExpense = 0;
  let userExpenses = {};
  let userPayments = {};

  expenses.forEach(({ amount, who, paidBy }) => {
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
});
