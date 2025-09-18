// Global variables
let allSavings = [];
let filteredSavings = [];
let categories = [];

// Initialize the page
document.addEventListener("DOMContentLoaded", function () {
  loadData();
  populateFilterOptions();
  displayTransactions(allSavings);
  updateSummary(allSavings);
});

// Load data from localStorage
function loadData() {
  allSavings = getFromLocalStorage("tabungan_savings");
  categories = getFromLocalStorage("tabungan_categories");
  filteredSavings = [...allSavings];
}

function getFromLocalStorage(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

// Populate filter options
function populateFilterOptions() {
  const categorySelect = document.getElementById("categoryFilter");
  const paymentMethodSelect = document.getElementById("paymentMethodFilter");

  // ✅ Kalau salah satu nggak ada, langsung stop
  if (!categorySelect || !paymentMethodSelect) return;

  // Clear existing options (except "Semua")
  categorySelect.innerHTML = '<option value="">Semua Kategori</option>';
  paymentMethodSelect.innerHTML = '<option value="">Semua Metode</option>';

  // Get unique categories
  const uniqueCategories = [
    ...new Set(allSavings.map((saving) => saving.categoryName)),
  ];
  uniqueCategories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });

  // Get unique payment methods
  const uniquePaymentMethods = [
    ...new Set(allSavings.map((saving) => saving.paymentMethod)),
  ];
  uniquePaymentMethods.forEach((method) => {
    const option = document.createElement("option");
    option.value = method;
    option.textContent = method;
    paymentMethodSelect.appendChild(option);
  });
}

// Apply filters
function applyFilters() {
  const dateFrom = document.getElementById("dateFrom").value;
  const dateTo = document.getElementById("dateTo").value;
  const categoryFilter = document.getElementById("categoryFilter").value;
  const paymentMethodFilter = document.getElementById(
    "paymentMethodFilter"
  ).value;

  filteredSavings = allSavings.filter((saving) => {
    const savingDate = new Date(saving.timestamp);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo + "T23:59:59") : null;

    // Date filter
    if (fromDate && savingDate < fromDate) return false;
    if (toDate && savingDate > toDate) return false;

    // Category filter
    if (categoryFilter && saving.categoryName !== categoryFilter) return false;

    // Payment method filter
    if (paymentMethodFilter && saving.paymentMethod !== paymentMethodFilter)
      return false;

    return true;
  });

  displayTransactions(filteredSavings);
  updateSummary(filteredSavings);
  showActiveFilters();
}

// Clear all filters
function clearFilters() {
  document.getElementById("dateFrom").value = "";
  document.getElementById("dateTo").value = "";
  document.getElementById("categoryFilter").value = "";
  document.getElementById("paymentMethodFilter").value = "";

  filteredSavings = [...allSavings];
  displayTransactions(filteredSavings);
  updateSummary(filteredSavings);
  hideActiveFilters();
  showActiveFilters();
}

function showActiveFilters() {
  const activeFiltersDiv = document.getElementById("activeFilters");
  const dateFrom = document.getElementById("dateFrom").value;
  const dateTo = document.getElementById("dateTo").value;
  const categoryFilter = document.getElementById("categoryFilter").value;
  const paymentMethodFilter = document.getElementById(
    "paymentMethodFilter"
  ).value;

  let filtersHTML = "";
  let activeCount = 0;

  if (dateFrom) {
    activeCount++;
    filtersHTML += `<span class="filter-chip">Dari: ${formatDate(
      dateFrom
    )} <button class="remove-chip" onclick="removeFilter('dateFrom')">×</button></span>`;
  }

  if (dateTo) {
    activeCount++;
    filtersHTML += `<span class="filter-chip">Sampai: ${formatDate(
      dateTo
    )} <button class="remove-chip" onclick="removeFilter('dateTo')">×</button></span>`;
  }

  if (categoryFilter) {
    activeCount++;
    filtersHTML += `<span class="filter-chip">Kategori: ${categoryFilter} <button class="remove-chip" onclick="removeFilter('categoryFilter')">×</button></span>`;
  }

  if (paymentMethodFilter) {
    activeCount++;
    filtersHTML += `<span class="filter-chip">Metode: ${paymentMethodFilter} <button class="remove-chip" onclick="removeFilter('paymentMethodFilter')">×</button></span>`;
  }

  // Tampilkan badge filter aktif di header
  const countLabel = document.getElementById("activeFilterCount");
  if (activeCount > 0) {
    countLabel.textContent = `${activeCount}`;
    countLabel.style.display = "inline-block";
  } else {
    countLabel.style.display = "none";
  }

  if (filtersHTML) {
    activeFiltersDiv.innerHTML = filtersHTML;
    activeFiltersDiv.classList.remove("hidden");
  } else {
    hideActiveFilters();
  }
}

// Hide active filters
function hideActiveFilters() {
  document.getElementById("activeFilters").classList.add("hidden");
}

// Remove specific filter
function removeFilter(filterType) {
  document.getElementById(filterType).value = "";
  applyFilters();
}

// Display transactions
function displayTransactions(savings) {
  const transactionsList = document.getElementById("transactionsList");
  const transactionCount = document.getElementById("transactionCount");

  // ✅ kalau elemen tidak ada, hentikan fungsi
  if (!transactionsList || !transactionCount) {
    console.warn("displayTransactions: Element target tidak ditemukan");
    return;
  }

  transactionsList.innerHTML = "";
  transactionCount.textContent = `${savings.length} transaksi`;

  if (savings.length === 0) {
    transactionsList.innerHTML = `
      <div class="no-data-message">
        <img src="img/state-search.png" alt="empty state" class="empty-state-image">
        <p class="title-empty-state">Tidak ada transaksi ditemukan</p>
        <p class="desc-empty-state">Coba ubah filter pencarian Anda</p>
      </div>
    `;
    return;
  }

  // Sort by newest first
  const sortedSavings = [...savings].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  sortedSavings.forEach((saving) => {
    const savingElement = document.createElement("div");
    savingElement.className = "savings-item";

    savingElement.innerHTML = `
      <div class="savings-category">
        <div class="savings-left">
          <img src="https://api.dicebear.com/9.x/icons/svg?scale=80&seed=${encodeURIComponent(
            saving.categoryName
          )}" 
          class="category-emoji" alt="${saving.categoryName}">
          <span class="category-name">${saving.categoryName}</span>
        </div>
        <div class="savings-right">
          <div class="savings-amount">+ ${formatToIDR(saving.nominal)}</div>
          <div class="savings-meta">
            <span class="savings-method">${saving.paymentMethod}</span>
            <span class="savings-date">${saving.createdAt}</span>
          </div>
        </div>
      </div>
    `;

    transactionsList.appendChild(savingElement);
  });
}

// Update summary
function updateSummary(savings) {
  const totalAmount = savings.reduce((sum, saving) => sum + saving.nominal, 0);
  const totalTransactions = savings.length;

  const totalAmountEl = document.getElementById("totalFilteredAmount");
  const totalTransactionsEl = document.getElementById(
    "totalFilteredTransactions"
  );

  // ✅ kalau salah satu elemen nggak ada, hentikan
  if (!totalAmountEl || !totalTransactionsEl) {
    console.warn("updateSummary: Elemen target tidak ditemukan");
    return;
  }

  totalAmountEl.textContent = formatToIDR(totalAmount);
  totalTransactionsEl.textContent = totalTransactions;
}

// Utility functions
// function formatCurrency(amount) {
//   return new Intl.NumberFormat("id-ID").format(amount);
// }

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function toggleSection(sectionSelector, iconId) {
  const section = document.querySelector(sectionSelector);
  const icon = document.getElementById(iconId);

  if (!section || !icon) return;

  section.classList.toggle("active");

  // Toggle ikon
  const isActive = section.classList.contains("active");
  icon.classList.toggle("fa-chevron-down", !isActive);
  icon.classList.toggle("fa-chevron-up", isActive);
}

document.addEventListener("DOMContentLoaded", () => {
  const savedCategory = localStorage.getItem("filterCategory");

  if (savedCategory) {
    const categoryFilterSelect = document.getElementById("categoryFilter");

    if (categoryFilterSelect) {
      categoryFilterSelect.value = savedCategory;
      applyFilters(); // jalankan filter dengan nilai yg baru diset
    }

    localStorage.removeItem("filterCategory"); // opsional, agar tidak berulang
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  flatpickr("#dateFrom", {
    altInput: true,
    altFormat: "d F Y", // untuk tampilan user
    dateFormat: "Y-m-d", // untuk .value
    defaultDate: thirtyDaysAgo,
  });

  flatpickr("#dateTo", {
    altInput: true,
    altFormat: "d F Y",
    dateFormat: "Y-m-d",
    defaultDate: today,
  });
});

// Auto-apply filters on input change
// document.getElementById("dateFrom").addEventListener("change", applyFilters);
// document.getElementById("dateTo").addEventListener("change", applyFilters);
// document
//   .getElementById("categoryFilter")
//   .addEventListener("change", applyFilters);
// document
//   .getElementById("paymentMethodFilter")
//   .addEventListener("change", applyFilters);

function safeAddEventListener(selector, event, handler) {
  const el = document.getElementById(selector);
  if (el) {
    el.addEventListener(event, handler);
  }
}

// Auto-apply filters on input change
safeAddEventListener("dateFrom", "change", applyFilters);
safeAddEventListener("dateTo", "change", applyFilters);
safeAddEventListener("categoryFilter", "change", applyFilters);
safeAddEventListener("paymentMethodFilter", "change", applyFilters);
