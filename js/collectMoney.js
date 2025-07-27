let collectMoneyList = [];

/**
 * Mengembalikan nilai dari input field dengan ID yang diberikan.
 * Nilai akan di-trim agar tidak ada spasi di awal atau akhir.
 * @param {string} id - ID dari input field
 * @returns {string} Nilai dari input field
 */
function getInputValue(id) {
  return document.getElementById(id).value.trim();
}

/**
 * Resets the form fields related to the collection of money.
 * Clears the values of input fields: collectName, collectAmount,
 * collectAmountFormatted, collectMethod, and collectBankName.
 * Hides the bank form section.
 */

function resetCollectForm() {
  [
    "collectName",
    "collectAmount",
    "collectAmountFormatted",
    "collectMethod",
    "collectBankName",
  ].forEach((id) => (document.getElementById(id).value = ""));

  document.getElementById("collectBankForm").style.display = "none";
}

/**
 * Mengecek apakah inputan collect money sudah valid.
 * Kembali false jika inputan tidak valid.
 * @param {{name: string, amount: string, method: string, bankName?: string}} input
 * @returns {boolean} Apakah inputan valid
 */
function validateCollectInput({ name, amount, method, bankName }) {
  if (!name || !amount || !method) {
    showToast("Harap lengkapi semua field.", "error", 5000);
    return false;
  }

  if (method === "BankTransfer" && !bankName) {
    showToast("Harap isi Nama Bank", "error", 5000);
    return false;
  }

  return true;
}

/**
 * Menambahkan data collect money ke dalam daftar.
 * Jika data tidak valid, maka data tidak akan ditambahkan.
 * Jika data valid, maka data akan ditambahkan ke dalam daftar,
 * tabel collect money akan di render ulang,
 * ringkasan collect money akan di render ulang,
 * dan form collect money akan di reset.
 */
function addCollectMoney() {
  const name = getInputValue("collectName");
  const amount = getInputValue("collectAmount");
  const method = getInputValue("collectMethod");
  const bankName = getInputValue("collectBankName");

  const formData = { name, amount, method, bankName };

  if (!validateCollectInput(formData)) return;

  const methodWithBank = method === "BankTransfer" ? `${bankName}` : method;

  collectMoneyList.push({ name, amount, method: methodWithBank });

  showToast("Collect Money berhasil ditambahkan.", "success", 5000);

  renderCollectMoneyTable();
  renderCollectSummary();
  resetCollectForm();
}

/**
 * Attaches an event listener to an input element to automatically convert its value to uppercase
 * as the user types.
 *
 * @param {HTMLInputElement} inputElement - The input element to which the event listener is attached.
 */

function autoUppercaseInput(inputElement) {
  if (!inputElement) return;
  inputElement.addEventListener("input", () => {
    inputElement.value = inputElement.value.toUpperCase();
  });
}

// Penggunaan:
autoUppercaseInput(document.getElementById("collectBankName"));

/**
 * Menghapus semua isi dari tabel body
 * @param {HTMLElement} tableBody Elemen tabel body yang akan dibersihkan
 */
function clearTableBody(tableBody) {
  tableBody.innerHTML = "";
}

/**
 * Mengatur apakah suatu elemen akan ditampilkan atau disembunyikan.
 * Jika target berupa string, maka akan dianggap sebagai id dari suatu elemen.
 * Jika target berupa HTMLElement, maka akan dianggap sebagai elemen yang akan diatur.
 * Jika shouldShow benar, maka elemen akan diatur untuk ditampilkan.
 * Jika shouldShow salah, maka elemen akan diatur untuk disembunyikan.
 * @param {string | HTMLElement} target Elemen yang akan diatur
 * @param {boolean} shouldShow Benar jika elemen akan ditampilkan, salah jika akan disembunyikan
 */
function toggleDisplay(target, shouldShow) {
  const el =
    typeof target === "string" ? document.getElementById(target) : target;
  if (el) el.style.display = shouldShow ? "block" : "none";
}

/**
 * Membuat baris untuk tabel collect money berdasarkan item collect money
 * dan index item di dalam daftar collect money.
 * @param {Object} item Item collect money yang akan dijadikan baris tabel
 * @param {number} index Index item di dalam daftar collect money
 * @returns {HTMLElement} Elemen baris tabel yang telah dibuat
 */
function createCollectRow(item, index) {
  const row = document.createElement("tr");
  const methodDisplay =
    item.method.includes("BankTransfer") && item.bankName
      ? `${item.method} - ${item.bankName}`
      : item.method;

  row.innerHTML = `
    <td>${index + 1}</td>
    <td>${item.name}</td>
    <td>${formatToIDR(item.amount)}</td>
    <td>${methodDisplay}</td>
    <td class="exclude-pdf">
      <button class="delete-btn" onclick="removeCollectMoney(${index})">
        <i class="uil uil-trash"></i>
      </button>
    </td>
  `;

  return row;
}

/**
 * Renders the collect money table based on the collectMoneyList.
 * If the list is empty, hides the table section.
 * If the list is not empty, shows the table section,
 * clears the table body, and appends a row for each item in the list.
 */
function renderCollectMoneyTable() {
  const tableSection = document.getElementById("collectMoneySection");
  const tableBody = document.querySelector("#collectMoneyTable tbody");

  clearTableBody(tableBody);

  const hasData = collectMoneyList.length > 0;
  toggleDisplay(tableSection, hasData);
  if (!hasData) return;

  collectMoneyList.forEach((item, index) => {
    const row = createCollectRow(item, index);
    tableBody.appendChild(row);
  });
}

/**
 * Renders the collect money summary section.
 * If the collect money list is empty, hides the summary section.
 * If the list is not empty, shows the summary section,
 * calculates the total amount,
 * renders the total summary,
 * and renders the detail method & chart.
 */
function renderCollectSummary() {
  const summaryContainer = document.getElementById("collectSummarySection");
  const summaryDiv = document.getElementById("collectSummary");

  const isEmpty = collectMoneyList.length === 0;
  summaryContainer.style.display = isEmpty ? "none" : "block";
  if (isEmpty) return;

  let total = 0;
  const methodTotals = {};

  for (const { amount, method } of collectMoneyList) {
    const numericAmount = parseInt(amount, 10) || 0;
    total += numericAmount;
    methodTotals[method] = (methodTotals[method] || 0) + numericAmount;
  }

  // Update total summary
  const totalHeader = summaryDiv.querySelector("h3");
  if (totalHeader) {
    totalHeader.innerHTML = `🎉 Total Semua:<strong> ${formatToIDR(
      total
    )}  </strong>`;
  }

  // Render detail method & chart
  renderMethodSummaryCards(methodTotals);
  renderPaymentChart(methodTotals);
}

/**
 * Renders the detail method summary cards.
 * @param {Object.<string, number>} methodTotals - Object with method names as keys and total amounts as values.
 * @example
 * {
 *   "BNI": 100000,
 *   "BCA": 50000,
 *   "Mandiri": 20000
 * }
 */
function renderMethodSummaryCards(methodTotals) {
  const container = document.getElementById("methodSummaryCards");
  if (!container) return;

  container.innerHTML = ""; // Bersihkan isi lama

  Object.entries(methodTotals).forEach(([method, total]) => {
    const card = document.createElement("div");
    card.classList.add("method-card");

    const logoSrc = getPaymentLogo(method) || "default-logo.png"; // fallback logo

    const imgWrapper = document.createElement("div");
    imgWrapper.className = "method-logo-wrapper"; // opsional: untuk styling

    const img = document.createElement("img");
    img.src = logoSrc;
    img.alt = `${method} logo`;
    img.style.maxWidth = "100%"; // opsional styling

    imgWrapper.appendChild(img); // masukkan <img> ke dalam <div>

    const infoDiv = document.createElement("div");
    infoDiv.classList.add("method-info");

    const methodName = document.createElement("span");
    methodName.className = "method-name";
    methodName.textContent = method;

    const methodTotal = document.createElement("span");
    methodTotal.className = "method-total";
    methodTotal.textContent = formatToIDR(total);

    // Susun struktur
    infoDiv.append(methodName, methodTotal);
    card.append(imgWrapper, infoDiv);
    container.appendChild(card);
  });
}

/**
 * Handles changes to the select box for the payment method.
 * If the selected method is Bank Transfer, shows the bank form and its details.
 * Otherwise, hides both.
 */
function handlePaymentMethodBankTransfer() {
  const selectedMethod = document.getElementById("collectMethod").value;
  const isBankTransfer = selectedMethod === "BankTransfer";

  toggleDisplay("collectBankForm", isBankTransfer);
  toggleDisplay("BankTransferDetails", isBankTransfer);
}

/**
 * Menghapus data collect money pada indeks yang ditentukan.
 * Jika user mengkonfirmasi, maka data akan dihapus dan tabel akan di render ulang.
 * @param {number} index - indeks data yang ingin dihapus
 */
function removeCollectMoney(index) {
  if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
    collectMoneyList.splice(index, 1);
    renderCollectMoneyTable();
    renderCollectSummary();
  }
}

let paymentChartInstance = null;

/**
 * Renders a pie chart showing the distribution of payment methods.
 * @param {Object.<string, number>} methodTotals - Object with method names as keys and total amounts as values.
 * @example
 * {
 *   "BNI": 100000,
 *   "BCA": 50000,
 *   "Mandiri": 20000
 * }
 * The chart will show the proportion of each method in the total amount.
 */
function renderPaymentChart(methodTotals) {
  const canvas = document.getElementById("paymentChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  // Destroy chart sebelumnya jika ada
  if (paymentChartInstance) {
    paymentChartInstance.destroy();
  }

  const labels = Object.keys(methodTotals);
  const data = Object.values(methodTotals);
  const colors = [
    "#4e73df",
    "#1cc88a",
    "#36b9cc",
    "#f6c23e",
    "#e74a3b",
    "#858796",
    "#20c997",
    "#fd7e14",
    "#6f42c1",
    "#17a2b8",
  ];

  const dataset = {
    data,
    backgroundColor: colors.slice(0, labels.length),
  };

  const config = {
    type: "pie", // Bisa diubah ke "bar", "doughnut", dll
    data: {
      labels,
      datasets: [dataset],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Distribusi Metode Pembayaran",
        },
        legend: {
          position: "bottom",
          labels: {
            font: { size: 10 },
            padding: 10,
            boxWidth: 20,
            usePointStyle: true,
          },
        },
      },
    },
  };

  paymentChartInstance = new Chart(ctx, config);
}
