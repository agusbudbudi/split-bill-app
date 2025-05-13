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

  // ✅ Tampilkan info metode pembayaran jika ada
  if (
    typeof selectedPaymentIndex === "number" &&
    paymentMethods[selectedPaymentIndex]
  ) {
    showSelectedPayment();
  }

  displaySummary(totalExpense, userExpenses, userPayments, variance, expenses);
}

function calculateVariance(userExpenses, userPayments, totalExpense) {
  let variance = {};
  for (let user in userExpenses) {
    let paidAmount = userPayments[user] || 0;
    variance[user] = paidAmount - userExpenses[user];
  }
  return variance;
}

function calculateTotalPaid(userPayments) {
  return Object.values(userPayments).reduce((sum, pay) => sum + pay, 0);
}

function calculateTotalVariance(variance) {
  return Object.values(variance).reduce((sum, val) => sum + val, 0);
}

function displaySummary(
  totalExpense,
  userExpenses,
  userPayments,
  variance,
  items
) {
  const summaryDiv = document.getElementById("summary");

  // Ambil nama aktivitas dan tanggal dari input form
  const activityName = document.getElementById("activityName").value;

  // Tanggal otomatis dari hari ini
  const today = new Date();
  const formattedDate = today.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Struktur HTML-nya
  summaryDiv.innerHTML = `
  <div class="summary-header">
    <div class="header-title">
      <h1 class="activity-name">${activityName || "Aktivitas Tanpa Nama"}</h1>
      <p class="activity-date"> Tanggal: ${formattedDate}</p>
    </div
    <div class="split-bill-icon">
       <img src="img/splitBill-invoice.png" alt="logo" class="logo" />
    </div>
  </div>
`;

  // summaryDiv.innerHTML = `<h2>💰 Ringkasan Pembayaran</h2>`;
  document.querySelector(".summary-container").style.display = "block";

  const totalPaid = calculateTotalPaid(userPayments);
  const totalVariance = calculateTotalVariance(variance);

  summaryDiv.innerHTML += generateSummaryStats(
    totalExpense,
    totalPaid,
    totalVariance
  );
  //TEMPORARY HIDDEN
  summaryDiv.innerHTML += `<h3 class="hidden">List Item</h3><div class="table-container hidden">${generateItemTable(
    items
  )}</div>`;

  // ⬇️ Tambahkan di sini
  const { transactionMap, transferSummaryMap } = generateTransactionMap(items);
  adjustForMutualPayments(transactionMap, transferSummaryMap);

  summaryDiv.innerHTML += `<h3>Ringkasan per Orang</h3>`;
  summaryDiv.innerHTML += `<div class="user-summary-cards">${generateUserCards(
    userExpenses,
    userPayments,
    variance,
    transactionMap
  )}</div>`;

  //show breakdown per person
  const breakdown = calculateUserItemBreakdown(items);
  renderItemBreakdownPerPerson(breakdown);

  summaryDiv.innerHTML += `<div id="selectedPaymentInfo"></div>`;
  showSelectedPayment();
}

function generateSummaryStats(totalExpense, totalPaid, totalVariance) {
  const expenseMatch =
    totalExpense === totalPaid
      ? "✅ Total Pengeluaran dan Total Pembayaran SESUAI"
      : "❌ Total Pengeluaran dan Total Pembayaran SALAH";
  const varianceText =
    totalVariance === 0
      ? `✅ Selisih sama dengan ${formatCurrency(totalVariance)}`
      : `❌ Selisih tidak seimbang: ${formatCurrency(totalVariance)}`;

  return `
  <div class="summary-validation">
    <p>Total Pengeluaran: <strong>${formatCurrency(totalExpense)}</strong></p>
    <p>Total Pembayaran: <strong>${formatCurrency(totalPaid)}</strong></p>
    <p class="text-desc">${expenseMatch}</p>
    <p class="text-desc">${varianceText}</p>
  </div>
  `;
}

// TEMPORARY HIDDEN
function generateItemTable(items) {
  return `
    <table id="itemTable">
      <thead>
        <tr>
          <th>Item</th>
          <th>Jumlah</th>
          <th>Yang Berhutang</th>
          <th>Dibayar Oleh</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map(
            ({ item, amount, who, paidBy }) => `
          <tr>
            <td>${item}</td>
            <td>
              ${formatCurrency(amount)}
              ${amount < 0 ? '<span class="discount-label">Diskon</span>' : ""}
            </td>
            <td>${who.join(", ")}</td>
            <td>${paidBy}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function generateTransactionMap(items) {
  const transactionMap = {};
  const transferSummaryMap = {};

  items.forEach(({ amount, who, paidBy }) => {
    if (!paidBy || !who || who.length === 0) return;

    const share = amount / who.length;

    who.forEach((debtor) => {
      if (debtor === paidBy) return; // paidBy tidak perlu bayar ke dirinya sendiri

      const key = `${debtor}->${paidBy}`;
      if (!transactionMap[key]) transactionMap[key] = 0;
      transactionMap[key] += share;

      // Simpan juga untuk transfer summary
      if (!transferSummaryMap[debtor]) transferSummaryMap[debtor] = {};
      if (!transferSummaryMap[debtor][paidBy])
        transferSummaryMap[debtor][paidBy] = 0;
      transferSummaryMap[debtor][paidBy] += share;
    });
  });

  return { transactionMap, transferSummaryMap };
}

function adjustForMutualPayments(transactionMap, transferSummaryMap) {
  for (const key in transactionMap) {
    const [from, to] = key.split("->");
    const reverseKey = `${to}->${from}`;

    if (transactionMap[reverseKey]) {
      const forward = transactionMap[key];
      const reverse = transactionMap[reverseKey];

      if (forward > reverse) {
        transactionMap[key] = forward - reverse;
        delete transactionMap[reverseKey];
      } else if (reverse > forward) {
        transactionMap[reverseKey] = reverse - forward;
        delete transactionMap[key];
      } else {
        delete transactionMap[key];
        delete transactionMap[reverseKey];
      }
    }
  }
}

// NEW FUNCTION Person breakdown
function calculateUserItemBreakdown(items) {
  const breakdown = {};

  items.forEach(({ item, amount, who, paidBy }) => {
    const share = amount / who.length;

    who.forEach((person) => {
      if (!breakdown[person]) breakdown[person] = [];

      breakdown[person].push({
        item,
        amount: share,
        paidBy,
        originalAmount: amount,
        splitWith: who.filter((p) => p !== person),
      });
    });
  });

  return breakdown;
}

//NEW Render person breakdown
function renderItemBreakdownPerPerson(breakdown) {
  Object.entries(breakdown).forEach(([person, items]) => {
    const userCard = document.querySelector(
      `.user-card[data-name="${person}"]`
    );
    if (!userCard) return;

    const breakdownList = document.createElement("ul");
    breakdownList.classList.add("item-breakdown");

    items.forEach(({ item, amount }) => {
      const li = document.createElement("li");
      li.innerHTML = `
      <div class="breakdown-row">
        <span class="item-name">${item}   ${
        amount < 0 ? '<span class="discount-label">Diskon</span>' : ""
      }</span>
        <span class="item-amount">${formatCurrency(amount)}
      </span>
      </div>
    `;
      breakdownList.appendChild(li);
    });

    const breakdownContainer = document.createElement("div");
    breakdownContainer.classList.add("breakdown-section");
    breakdownContainer.appendChild(breakdownList);

    // userCard.appendChild(breakdownContainer);
    const transfersSection = userCard.querySelector(".user-transfers");
    if (transfersSection) {
      userCard.insertBefore(breakdownContainer, transfersSection);
    } else {
      userCard.appendChild(breakdownContainer);
    }
  });
}

//WORK CODE
function generateUserCards(
  userExpenses,
  userPayments,
  variance,
  transactionMap
) {
  return Object.keys(userExpenses)
    .map((user) => {
      const expense = userExpenses[user] || 0;
      const paid = userPayments[user] || 0;
      const diff = variance[user] || 0;

      let transfers = Object.entries(transactionMap)
        .filter(([key]) => key.startsWith(`${user}->`))
        .map(([key, amount]) => {
          const creditor = key.split("->")[1];
          return `<p class="transfer-detail">💸 Hutang <strong>${formatCurrency(
            amount
          )}</strong> ke <strong>${creditor}</strong></p>`;
        })
        .join("");

      if (!transfers && diff >= 0) {
        transfers = `<p class="no-debt">✅ Kamu tidak punya hutang</p>`;
      }

      return `
        <div class="user-card" data-name="${user}">
          <div class="user-header">
            <div class="avatar">
              <img src="https://api.dicebear.com/9.x/dylan/svg?scale=80&seed=${user}" alt="${user}" class="summary-avatar"/>
            </div>
            <div class="user-details">
              <h2>${user}</h2>
              <p>Total Membayar: <strong>${formatCurrency(paid)}</strong></p>
            </div>
            <div class="user-expense">
              <p>Total Pengeluaran</p>
              <h3>${formatCurrency(expense)}</h3>
            </div>
          </div>
          <hr class="separator"/>
          <div class="user-transfers">
            ${transfers}
          </div>
        </div>
      `;
    })
    .join("");
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(amount);
}
