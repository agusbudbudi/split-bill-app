let expenses = [];
let itemCount = 0;

function addExpense() {
  const item = document.getElementById("item").value;
  const amount = parseFloat(document.getElementById("splitAmount").value);
  const paidBy = document.getElementById("paidBy").value.trim();

  //add isNaN buat handle negative amount
  if (!item || isNaN(!amount) || who.length === 0 || !paidBy) {
    alert("Isi terlebih dahulu item transaksi");
    return;
  }

  expenses.push({ item, amount, who, paidBy });
  updateTable();
  updateCalculateButton();
  //ADD NEW EXPENSE with list
  updateExpenseCards();

  // Reset field input
  document.getElementById("item").value = "";
  document.getElementById("splitAmountFormatted").value = "";

  // Reset selected avatar (who)
  who = [];
  renderAvatars(); // refresh tampilan avatar
}

function updateCalculateButton() {
  const calculateBtn = document.getElementById("calculateBtn");
  const infoBox = document.querySelector(".info-box");

  if (expenses.length > 0) {
    calculateBtn.disabled = false;
    calculateBtn.classList.remove("disabled-btn");
    if (infoBox) infoBox.style.display = "none";
  } else {
    calculateBtn.disabled = true;
    calculateBtn.classList.add("disabled-btn");
    if (infoBox) infoBox.style.display = "flex"; // atau "block" tergantung desain kamu
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
                          <div class="action-buttons">
                            <button class="edit-btn" onclick="editExpense(${index})"><i class="fa-solid fa-pen-to-square"></i></button>
                            <button class="delete-btn" onclick="deleteExpense(${index})"><i class="fa-regular fa-trash-can"></i></button>
                          </div
                        </td>
                    </tr>`;
      tbody.innerHTML += row;
    });
  }
}

//NEW ADD EXPENSE WITH LIST
function updateExpenseCards() {
  const container = document.getElementById("expense-list");
  container.innerHTML = "";
  console.log("Expenses:", expenses);
  console.log("Is empty:", expenses.length === 0);

  if (expenses.length === 0) {
    container.innerHTML = `
    <p style="text-align: center; color: #888;">Belum ada daftar transaksi pengeluaran</p>`;
    return;
  }

  expenses.forEach((expense, index) => {
    const card = document.createElement("div");
    card.classList.add("expense-card");

    const whoAvatars = expense.who
      .map(
        (name) => `
  <div class="avatar-wrapper">
    <div class="avatar-box">
      <img src="https://api.dicebear.com/9.x/dylan/svg?seed=${name}" alt="${name}">
    </div>
    <div class="avatar-name">${name}</div>
  </div>
`
      )
      .join("");

    const paidByAvatar = `
  <div class="avatar-wrapper">
    <div class="avatar-box">
      <img src="https://api.dicebear.com/9.x/dylan/svg?seed=${expense.paidBy}" alt="${expense.paidBy}">
    </div>
    <div class="avatar-name">${expense.paidBy}</div>
  </div>
`;

    card.innerHTML = `
  <div class="expense-header">
    <span>${expense.item}</span>
    <span>${formatCurrency(expense.amount)}</span>
  </div>

  <div class="expense-meta">
    <div class="label-columns">
      <div class="label-row">
        <div class="people-row">${whoAvatars}</div>
      </div>

      <div class="label-row">
        <label>Dibayar oleh:</label>
        <div class="people-row">${paidByAvatar}</div>
      </div>
    </div>

    <div class="action-buttons">
        <button class="edit-btn" onclick="editExpense(${index})"><i class="fa-solid fa-pen-to-square"></i></button>
        <button class="delete-btn" onclick="deleteExpense(${index})"><i class="fa-regular fa-trash-can"></i></button>
    </div
  </div>
`;

    container.appendChild(card);
  });
}

// Function to delete an expense
function deleteExpense(index) {
  expenses.splice(index, 1); // Remove expense from the array
  updateTable(); // Refresh the table
  updateExpenseCards();
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
  updateExpenseCards();
});
