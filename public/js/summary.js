// calculate split function
function calculateSplit() {
  let totalExpense = 0;
  let userExpenses = {};
  let userPayments = {};

  expenses.forEach(({ amount, who, paidBy }) => {
    totalExpense += amount;

    who.forEach((person) => {
      if (!userExpenses[person]) userExpenses[person] = 0;
      userExpenses[person] += amount / who.length;
    });

    if (!userPayments[paidBy]) userPayments[paidBy] = 0;
    userPayments[paidBy] += amount;
  });

  let variance = calculateVariance(userExpenses, userPayments, totalExpense);
  displaySummary(totalExpense, userExpenses, userPayments, variance, expenses);
}

//===============================================================================

// calculate variance function
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

//===============================================================================

function findPayer(user, variance, paidBy) {
  // If the user owes money, return the one who paid (paidBy)
  if (variance[user] < 0) {
    return paidBy;
  }
  return null;
}

//===============================================================================

function displaySummary(
  totalExpense,
  userExpenses,
  userPayments,
  variance,
  items
) {
  const summaryDiv = document.getElementById("summary");
  summaryDiv.innerHTML = `<h2>Summary Split Bill</h2>`;

  // Total Expense (formatted in Rupiah)
  summaryDiv.innerHTML += `<p><strong>Total Expense:</strong> ${formatCurrency(
    totalExpense
  )}</p>`;

  let table = `
    <table id="summaryTable">
      <thead>
        <tr>
          <th>Name</th>
          <th>Total Expense</th>
          <th>Total Paid</th>
          <th>Variance</th>
          <th>Transfer Summary</th>
        </tr>
      </thead>
      <tbody>

  `;

  let totalPaid = Object.values(userPayments).reduce(
    (sum, pay) => sum + pay,
    0
  );
  let expenseVerification =
    totalExpense === totalPaid
      ? "Total Expense dan Total Paid ✅ SESUAI"
      : "Total Expense dan Total Paid ❌ SALAH";

  let totalVariance = Object.values(variance).reduce(
    (sum, varValue) => sum + varValue,
    0
  );
  let varianceVerification =
    totalVariance === 0
      ? `Variance sama dengan ${formatCurrency(totalVariance)}`
      : `Variance tidak seimbang: ${formatCurrency(totalVariance)}`;

  summaryDiv.innerHTML += `
        <p><strong>Total Paid:</strong> ${formatCurrency(totalPaid)}</p>
        <p>${expenseVerification}</p>
        <p>${varianceVerification}</p>
    `;

  // Generate item list table
  let itemTable = `
        <h3>Item List</h3>
        <table id="itemTable">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Amount</th>
              <th>Who Need to Pay</th>
              <th>Paid By</th>
            </tr>
          </thead>
          <tbody>

    `;

  items.forEach(({ item, amount, paidBy, who }) => {
    itemTable += `
            <tr>
              <td>${item}</td>
              <td>${formatCurrency(amount)}</td>
              <td>${who.join(", ")}</td>
              <td>${paidBy}</td>
            </tr>
        `;
  });

  itemTable += `</tbody></table>`;
  summaryDiv.innerHTML += itemTable;

  let totalPaidMap = {}; // Menyimpan total yang dibayar oleh setiap orang
  let totalExpenseMap = {}; // Menyimpan total pengeluaran yang seharusnya dibayar oleh setiap orang
  let transactionMap = {}; // Menyimpan transaksi pembayaran antar orang
  let transferSummaryMap = {}; // Menyimpan ringkasan transfer antar orang

  items.forEach(({ item, amount, who, paidBy }) => {
    if (!paidBy || !who || who.length === 0) {
      console.warn("Invalid transaction data:", { item, amount, who, paidBy });
      return;
    }

    who.forEach((debtor) => {
      if (debtor === paidBy) {
        if (!transferSummaryMap[debtor]) {
          transferSummaryMap[debtor] = [];
        }
        transferSummaryMap[debtor].push({
          message: `${formatCurrency(amount / who.length)} dibayar sendiri`,
        });
        return;
      }

      let key = `${debtor}->${paidBy}`;
      if (!transactionMap[key]) {
        transactionMap[key] = 0;
      }
      transactionMap[key] += amount / who.length; // Jika beberapa orang berbagi hutang, dibagi rata
    });
  });

  // update: Cek dan hitung hutang yang telah dilunasi
  for (let key in transactionMap) {
    let [debtor, creditor] = key.split("->");
    let reverseKey = `${creditor}->${debtor}`;

    if (transactionMap[reverseKey]) {
      // Kurangi jumlah utang jika ada pembayaran balik
      let minAmount = Math.min(transactionMap[key], transactionMap[reverseKey]);
      transactionMap[key] -= minAmount;
      transactionMap[reverseKey] -= minAmount;

      // Hapus transaksi jika jumlahnya sudah nol
      if (transactionMap[key] === 0) delete transactionMap[key];
      if (transactionMap[reverseKey] === 0) delete transactionMap[reverseKey];

      // Cek apakah transaksi sudah lunas
      if (transactionMap[key] === 0 && transactionMap[reverseKey] === 0) {
        if (!transferSummaryMap[debtor]) transferSummaryMap[debtor] = [];
        if (!transferSummaryMap[creditor]) transferSummaryMap[creditor] = [];

        // Tambahkan pesan "Tidak perlu membayar karena lunas" jika transaksi sudah selesai
        transferSummaryMap[debtor].push({
          message: "Tidak perlu membayar karena lunas",
        });
        transferSummaryMap[creditor].push({
          message: "Tidak perlu membayar karena lunas",
        });
      } else {
        // 🔥 Jika masih ada hutang, hapus pesan lunas jika ada
        transferSummaryMap[debtor] =
          transferSummaryMap[debtor]?.filter(
            (entry) => entry.message !== "Tidak perlu membayar karena lunas"
          ) || [];
        transferSummaryMap[creditor] =
          transferSummaryMap[creditor]?.filter(
            (entry) => entry.message !== "Tidak perlu membayar karena lunas"
          ) || [];
      }
    }
  }

  // Menyusun Transfer Summary berdasarkan hasil akhir
  for (let user in userExpenses) {
    const userExpense = userExpenses[user];
    const userPaid = userPayments[user] || 0;
    const userVariance = variance[user] || 0;

    let transferSummary = "";

    // Show transfer summary regardless of variance
    for (let key in transactionMap) {
      let [debtor, creditor] = key.split("->");
      if (debtor === user) {
        transferSummary += `<p><strong>${debtor} hutang ${formatCurrency(
          transactionMap[key]
        )} ke ${creditor}</strong></p>`;
      }
    }

    // Only display "No transfer needed" for users who don't owe anything (variance positive)
    if (userVariance >= 0 && transferSummary === "") {
      transferSummary += "<p>Kamu tidak punya hutang</p>";
    }

    table += `
      <tr>

        <td>${user}</td>
        <td>${formatCurrency(userExpense)}</td>
        <td>${formatCurrency(userPaid)}</td>
        <td>${formatCurrency(userVariance)}</td>
        <td>${transferSummary || "No transfer needed"}</td>
      </tr>
    `;
  }

  table += `</tbody></table>`;
  summaryDiv.innerHTML += table;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(amount);
}
