let expenses = [];

function addExpense() {
  const item = document.getElementById("item").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const who = document
    .getElementById("who")
    .value.split(",")
    .map((name) => name.trim());
  const paidBy = document.getElementById("paidBy").value.trim();

  if (!item || !amount || who.length === 0 || !paidBy) {
    alert("Please fill all fields correctly");
    return;
  }

  expenses.push({ item, amount, who, paidBy });
  updateTable();

  // Clear the input fields after adding the expense
  document.getElementById("item").value = "";
  document.getElementById("amount").value = "";
  document.getElementById("who").value = "";
  document.getElementById("paidBy").value = "";
}

function updateTable() {
  const tbody = document.querySelector("#expense-table tbody");
  tbody.innerHTML = "";

  // If there are no expenses, display empty state message
  if (expenses.length === 0) {
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = `
      <td colspan="5" style="text-align: center; padding: 10px; color: #888;">
        No expense records yet
      </td>
    `;
    tbody.appendChild(emptyRow);
  } else {
    // Otherwise, populate the table with expenses
    expenses.forEach((expense, index) => {
      const row = `<tr>
                        <td>${expense.item}</td>
                        <td>${formatCurrency(expense.amount)}</td>
                        <td>${expense.who.join(", ")}</td>
                        <td>${expense.paidBy}</td>
                        <td>
                        <button class="delete-btn" onclick="deleteExpense(${index})"><i class="fas fa-trash"></i> Remove</button></td>
                    </tr>`;
      tbody.innerHTML += row;
    });
  }
}

// Function to delete an expense
function deleteExpense(index) {
  expenses.splice(index, 1); // Remove expense from the array
  updateTable(); // Refresh the table
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
