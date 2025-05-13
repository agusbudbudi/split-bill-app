let collectMoneyList = [];

function addCollectMoney() {
  const name = document.getElementById("collectName").value.trim();
  const amount = document.getElementById("collectAmount").value.trim();
  const method = document.getElementById("collectMethod").value.trim();
  const bankName = document.getElementById("collectBankName").value.trim(); // ambil bank name

  // Validasi field dasar
  if (!name || !amount || !method) {
    alert("Harap lengkapi semua field.");
    return;
  }

  // Validasi tambahan jika metode adalah Bank Transfer
  if (method === "BankTransfer" && !bankName) {
    alert("Harap isi nama bank untuk metode Bank Transfer.");
    return;
  }

  // Gabungkan method dengan info bank jika perlu
  const methodWithBank =
    method === "BankTransfer" ? `${method} - ${bankName}` : method;

  // Simpan ke list
  collectMoneyList.push({ name, amount, method: methodWithBank });
  renderCollectMoneyTable();

  // Reset input
  document.getElementById("collectName").value = "";
  document.getElementById("collectAmount").value = "";
  document.getElementById("collectAmountFormatted").value = "";
  document.getElementById("collectMethod").value = "";
  document.getElementById("collectBankName").value = "";

  // Sembunyikan form bank setelah add
  document.getElementById("collectBankForm").style.display = "none";

  // render collect summary
  renderCollectSummary();
}

function renderCollectMoneyTable() {
  const tableSection = document.getElementById("collectMoneySection");
  const tableBody = document.querySelector("#collectMoneyTable tbody");
  tableBody.innerHTML = "";

  if (collectMoneyList.length === 0) {
    tableSection.style.display = "none";
    return;
  }

  tableSection.style.display = "block";

  collectMoneyList.forEach((item, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.name}</td>
      <td>${formatToIDR(item.amount)}</td>
      <td>${item.method}${item.bankName ? ` - ${item.bankName}` : ""}</td>
      <td class="exclude-pdf"><button class="delete-btn" onclick="removeCollectMoney(${index})"><i class="fa-regular fa-trash-can"></i></button></td>
    `;
    tableBody.appendChild(row);
  });
}

function renderCollectSummary() {
  const summaryContainer = document.getElementById("collectSummarySection"); // Tambahkan ID wrapper di HTML
  const summaryDiv = document.getElementById("collectSummary");

  if (collectMoneyList.length === 0) {
    summaryContainer.style.display = "none";
    return;
  }

  summaryContainer.style.display = "block";

  let total = 0;
  const methodTotals = {};

  collectMoneyList.forEach((entry) => {
    const amount = parseInt(entry.amount, 10);
    total += amount;

    if (!methodTotals[entry.method]) {
      methodTotals[entry.method] = 0;
    }
    methodTotals[entry.method] += amount;
  });

  summaryDiv.querySelector("h3").innerHTML = `Total Semua: ${formatToIDR(
    total
  )}`;

  renderMethodSummaryCards(methodTotals);
  renderPaymentChart(methodTotals); // render grafik
}

//render payment cards scetion
function renderMethodSummaryCards(methodTotals) {
  const container = document.getElementById("methodSummaryCards");
  container.innerHTML = ""; // reset

  Object.entries(methodTotals).forEach(([method, total]) => {
    const card = document.createElement("div");
    card.className = "method-card";

    const logoSrc = getPaymentLogo(method); // fungsi yang kamu pakai juga untuk payment lainnya

    card.innerHTML = `
      <img src="${logoSrc}" alt="${method} logo" />
      <div class="method-info">
        <span class="method-name">${method}</span>
        <span class="method-total">${formatToIDR(total)}</span>
      </div>
    `;

    container.appendChild(card);
  });
}

//select Bank Transfer Method
// handle payment method change
function handlePaymentMethodBankTransfer() {
  const method = document.getElementById("collectMethod").value;
  const bankForm = document.getElementById("collectBankForm");
  const detailsContainer = document.getElementById("BankTransferDetails");

  if (method === "BankTransfer") {
    detailsContainer.style.display = "block";
    bankForm.style.display = "block";
  } else {
    detailsContainer.style.display = "none";
    bankForm.style.display = "none";
  }
}

//grafik
let paymentChartInstance = null;

function renderPaymentChart(methodTotals) {
  const ctx = document.getElementById("paymentChart").getContext("2d");

  // Hapus chart lama jika ada
  if (paymentChartInstance) {
    paymentChartInstance.destroy();
  }

  const labels = Object.keys(methodTotals);
  const data = Object.values(methodTotals);

  const backgroundColors = [
    "#4e73df",
    "#1cc88a",
    "#36b9cc",
    "#f6c23e",
    "#e74a3b",
    "#858796",
  ];

  paymentChartInstance = new Chart(ctx, {
    type: "pie", // Ubah jadi 'bar' jika mau bar chart
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColors.slice(0, labels.length),
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            font: {
              size: 10, // Ukuran font
            },
            padding: 10, // Jarak antar legend item
            boxWidth: 20, // Ukuran kotak warna
            usePointStyle: true, // Gunakan point style bulat/segitiga, dll
          },
        },
        title: {
          display: true,
          text: "Distribusi Metode Pembayaran",
        },
      },
    },
  });
}

//EVENT LISTENER
const collectBankNameInput = document.getElementById("collectBankName");

collectBankNameInput.addEventListener("input", () => {
  collectBankNameInput.value = collectBankNameInput.value.toUpperCase();
});

function removeCollectMoney(index) {
  if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
    collectMoneyList.splice(index, 1);
    renderCollectMoneyTable();
    renderCollectSummary();
  }
}
