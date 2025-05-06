let currentEditIndex = null;

function editExpense(index) {
  const expense = expenses[index];
  currentEditIndex = index;

  document.getElementById("editItemName").value = expense.item;
  document.getElementById("editAmount").value = expense.amount;
  document.getElementById("editWho").value = expense.who.join(", ");
  document.getElementById("editPaidBy").value = expense.paidBy;
  document.getElementById("overlay").classList.remove("hidden");

  const sheet = document.getElementById("editBottomSheet");

  sheet.classList.remove("hidden");
  sheet.classList.add("show");
}

function closeBottomSheet() {
  const sheet = document.getElementById("editBottomSheet");
  sheet.classList.remove("show");
  setTimeout(() => {
    sheet.classList.add("hidden");
  }, 300);
  document.getElementById("overlay").classList.add("hidden");
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
    expenses[currentEditIndex] = {
      item,
      amount,
      who,
      paidBy,
    };

    updateTable();
    updateCalculateButton();
    closeBottomSheet("editBottomSheet");
  }
}
