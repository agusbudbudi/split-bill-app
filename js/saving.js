// Global variables
let selectedCategory = null;
let categories = [];
let savings = [];

// Initialize the app
document.addEventListener("DOMContentLoaded", function () {
  loadCategories();
  loadSavings();
  displayCategories();
  displaySavings();
  displayStatistics();
  displayCategoryCards(); // ✅ Tambahkan ini
  setupTransactionToggle();
  toggleSavingsUI(savings);
});

// Statistics Functions
function displayStatistics() {
  displayTotalSavings();
  displayPaymentMethodStats();
  displayCategoryCards();
}
function displayTotalSavings() {
  const totalAmountElement = document.getElementById("totalAmount");
  const totalAmount = savings.reduce((sum, saving) => sum + saving.nominal, 0);

  if (!isHidden) {
    totalAmountElement.textContent = `Rp ${formatCurrency(totalAmount)}`;
  }
}
// function displayPaymentMethodStats() {
function displayPaymentMethodStats() {
  const paymentMethodCards = document.getElementById("paymentMethodCards");
  const paymentStats = getTotalSavingsByPaymentMethod();

  paymentMethodCards.innerHTML = "";

  if (Object.keys(paymentStats).length === 0) {
    paymentMethodCards.innerHTML = `
      <div class="no-data-message">
        <img src="img/empty-state.png" alt="Empty State" class="empty-state-image">
        <p>Belum ada data transaksi berdasarkan metode penyimpanan</p>
      </div>
    `;
    return;
  }

  // Sort by amount (highest first)
  const sortedPaymentStats = Object.entries(paymentStats).sort(
    ([, a], [, b]) => b.amount - a.amount
  );

  sortedPaymentStats.forEach(([method, data]) => {
    const card = document.createElement("div");
    card.className = "payment-method-card";

    // Ambil logo dari fungsi baru
    const logoData =
      typeof getPaymentLogo === "function"
        ? getPaymentLogo(method, data.bankName || "")
        : { text: method, image: "img/default.png", class: "" };

    card.innerHTML = `
      <div class="card-body">
        <span class="card-title">${logoData.text}</span>
        <div class="payment-method-amount">Rp ${formatCurrency(
          data.amount
        )}</div>
      </div>
      <div class="card-footer">
        <div class="payment-method-count">${data.count} transaksi</div>
        <img src="${logoData.image}" 
             alt="${logoData.text}" 
             class="payment-logo ${logoData.class}" 
             onerror="this.src='img/default.png'">
      </div>
    `;

    paymentMethodCards.appendChild(card);
  });
}

function getTotalSavingsByPaymentMethod() {
  const stats = {};

  savings.forEach((saving) => {
    const method = saving.paymentMethod;
    if (!stats[method]) {
      stats[method] = {
        amount: 0,
        count: 0,
      };
    }
    stats[method].amount += saving.nominal;
    stats[method].count += 1;
  });

  return stats;
}

// Local Storage Functions
function saveToLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function getFromLocalStorage(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function loadCategories() {
  categories = getFromLocalStorage("tabungan_categories");
}

function loadSavings() {
  savings = getFromLocalStorage("tabungan_savings");
}

function resetForm() {
  document.getElementById("categoryName").value = "";
  document.getElementById("targetCompleted").value = "";
  document.getElementById("nominalTabungan").value = "";
  document.getElementById("savingMethod").value = "";

  // Hide category form
  document.getElementById("categoryForm").classList.add("hidden");

  // Reset selected category
  selectedCategory = null;
  document.querySelectorAll(".category-item").forEach((item) => {
    item.classList.remove("selected");
  });
}

// Category Functions
function toggleCategoryForm() {
  const categoryForm = document.getElementById("categoryForm");
  const isHidden = categoryForm.classList.contains("hidden");

  if (isHidden) {
    categoryForm.classList.remove("hidden");
  } else {
    categoryForm.classList.add("hidden");
    resetCategoryForm();
  }
}

function resetCategoryForm() {
  document.getElementById("categoryName").value = "";
  document.getElementById("targetTabungan").value = "";
  document.getElementById("targetCompleted").value = "";
}

function saveCategory() {
  const categoryName = document.getElementById("categoryName").value.trim();
  const targetTabungan = document.getElementById("targetTabungan").value.trim();
  const targetCompleted = document.getElementById("targetCompleted").value;

  // Validation
  if (!categoryName) {
    showAlert("Nama category tidak boleh kosong!", "error");
    return;
  }

  if (!targetTabungan) {
    showAlert("Target Tabungan tidak boleh kosong!", "error");
    return;
  }

  if (!targetCompleted) {
    showAlert("Target completion date harus diisi!", "error");
    return;
  }

  // Check if category already exists
  if (
    categories.some(
      (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
    )
  ) {
    showAlert("Category dengan nama tersebut sudah ada!", "error");
    return;
  }

  // Create new category
  const newCategory = {
    id: Date.now(),
    name: categoryName,
    targetTabungan: targetTabungan,
    targetCompleted: targetCompleted,
    createdAt: new Date().toISOString(),
  };

  // Add to categories array
  categories.push(newCategory);

  // Save to localStorage
  saveToLocalStorage("tabungan_categories", categories);

  // Update display
  displayCategories();

  // Hide form and reset
  document.getElementById("categoryForm").classList.add("hidden");
  resetCategoryForm();

  showAlert("Category berhasil disimpan!", "success");
}

function displayCategories() {
  const categoriesList = document.getElementById("categoriesList");
  const categoriesListBottomSheet = document.getElementById(
    "categoriesListBottomSheet"
  );

  categoriesList.innerHTML = "";
  categoriesListBottomSheet.innerHTML = "";

  categories.forEach((category, index) => {
    // Buat elemen bottom sheet dulu
    const bottomSheetItem = document.createElement("div");
    bottomSheetItem.className = "category-item";
    bottomSheetItem.setAttribute("data-category-name", category.name);
    bottomSheetItem.innerHTML = `
      <img src="https://api.dicebear.com/9.x/icons/svg?scale=80&seed=${encodeURIComponent(
        category.name
      )}"
        class="category-img person-img" alt="${category.name}">
      <div class="category-name">${category.name}</div>
    `;
    bottomSheetItem.onclick = (event) => {
      selectCategory(category, "bottomSheet", event);
    };

    // Simpan dulu ke bottom sheet
    categoriesListBottomSheet.appendChild(bottomSheetItem);

    // Buat elemen untuk sidebar
    const sidebarItem = bottomSheetItem.cloneNode(true);
    sidebarItem.onclick = () => {
      // Pilih yang ada di bottomSheet, bukan dari sidebar
      const allBottomItems =
        categoriesListBottomSheet.querySelectorAll(".category-item");
      const targetItem = Array.from(allBottomItems).find(
        (el) => el.getAttribute("data-category-name") === category.name
      );
      if (targetItem) {
        selectCategory(category, "sidebar", { currentTarget: targetItem });
      }

      openBottomSheet("addSavingsBottomSheet");
    };

    categoriesList.appendChild(sidebarItem);
  });
}
function selectCategory(category, source = "default", event = null) {
  console.log("Kategori diklik:", category.name, "dari:", source);

  selectedCategory = category;

  // Remove semua selected
  document.querySelectorAll(".category-item").forEach((item) => {
    item.classList.remove("selected");
  });

  // Tambahkan class selected
  if (event?.currentTarget) {
    event.currentTarget.classList.add("selected");
  }
}

// Savings Functions
function saveTabungan() {
  const nominal = document.getElementById("nominalTabungan").value;
  const paymentMethod = document.getElementById("savingMethod").value;

  // Validation
  if (!selectedCategory) {
    showAlert("Pilih category terlebih dahulu!", "error");
    return;
  }

  if (!nominal || parseFloat(nominal) <= 0) {
    showAlert("Nominal harus diisi dan lebih besar dari 0!", "error");
    return;
  }

  if (!paymentMethod) {
    showAlert("Pilih metode pembayaran!", "error");
    return;
  }

  // Create new saving
  const newSaving = {
    id: Date.now(),
    categoryId: selectedCategory.id,
    categoryName: selectedCategory.name,
    nominal: parseFloat(nominal),
    paymentMethod: paymentMethod,
    timestamp: new Date().toISOString(),
    createdAt: new Date().toLocaleString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  // Add to savings array
  savings.push(newSaving);

  // Save to localStorage
  saveToLocalStorage("tabungan_savings", savings);

  // Update display
  displaySavings();

  displayStatistics();

  // Close bottom sheet and reset
  closeBottomSheet("addSavingsBottomSheet");

  showAlert("Tabungan berhasil disimpan!", "success");

  //reset form to default
  resetForm();

  //update category
  displayCategoryCards();

  showToast("Tabungan berhasil ditambahkan!", "success", 2000);

  setupTransactionToggle();

  toggleSavingsUI(savings);
}

function displaySavings() {
  const savingsList = document.getElementById("savings-list");
  savingsList.innerHTML = "";

  if (savings.length === 0) {
    savingsList.innerHTML = `
            <div class="no-data-message">
            <img src="img/empty-state-wallet.png" alt="Empty State" class="empty-state-image">
                <p class="title-empty-state">Belum ada tabungan<p>
                <p class="desc-empty-state">Mulai menabung sekarang!<p>
            </div>
        `;
    return;
  }

  // Sort savings by newest first
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
                )}" class="category-emoji" alt="${saving.categoryName}">
                    <span class="category-name">${saving.categoryName}</span>
                </div>
                <div class="savings-right">
                    <div class="savings-amount">+ Rp ${formatCurrency(
                      saving.nominal
                    )}</div>

                    <div class="savings-meta">
                        <span class="savings-method">${
                          saving.paymentMethod
                        }</span>
                        <span class="savings-date">${saving.createdAt}</span>
                    </div>
                </div>
        `;

    savingsList.appendChild(savingElement);
  });
}

// Utility Functions
function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID").format(amount);
}

function showAlert(message, type) {
  // Remove existing alerts
  const existingAlert = document.querySelector(".alert");
  if (existingAlert) {
    existingAlert.remove();
  }

  // Create new alert
  const alert = document.createElement("div");
  alert.className = `alert alert-${type}`;
  alert.textContent = message;

  // Insert at top of bottom sheet content
  const bottomSheetContent = document.querySelector(".bottom-sheet-content");
  bottomSheetContent.insertBefore(alert, bottomSheetContent.firstChild);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (alert.parentNode) {
      alert.remove();
    }
  }, 5000);
}

// Calculate total savings per category
function getTotalSavingsByCategory() {
  const totals = {};

  savings.forEach((saving) => {
    if (!totals[saving.categoryName]) {
      totals[saving.categoryName] = 0;
    }
    totals[saving.categoryName] += saving.nominal;
  });

  return totals;
}

// Get savings statistics
function getSavingsStats() {
  const totalAmount = savings.reduce((sum, saving) => sum + saving.nominal, 0);
  const totalTransactions = savings.length;
  const categoriesUsed = [
    ...new Set(savings.map((saving) => saving.categoryName)),
  ].length;

  return {
    totalAmount,
    totalTransactions,
    categoriesUsed,
  };
}

function displayCategoryCards() {
  const container = document.getElementById("categoryCardsContainer");
  container.innerHTML = "";

  const savingsByCategory = getTotalSavingsByCategory();

  categories.forEach((category) => {
    const totalSaved = savingsByCategory[category.name] || 0;
    const target = parseFloat(category.targetTabungan);
    const percentage = Math.min((totalSaved / target) * 100, 100).toFixed(1);

    const completedBar = (percentage / 100) * 100;
    const remainingBar = 100 - completedBar;

    const card = document.createElement("div");
    card.className = "category-card";

    // Ambil nama kategori dari data atau DOM (misalnya dari variable atau dari elemen child)
    const categoryName = category.name; // ganti ini sesuai datamu, bisa juga ambil dari objek, misalnya `item.name`

    card.addEventListener("click", () => {
      localStorage.setItem("filterCategory", categoryName); // simpan ke localStorage
      window.location.href = "transactions.html"; // redirect
    });

    // Hitung savings per hari
    const today = new Date();
    const targetDate = new Date(category.targetCompleted);

    // Hitung selisih hari (dibulatkan ke atas)
    const timeDiff = targetDate - today;
    const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    let savingsPerDay = 0;
    if (daysRemaining > 0) {
      const remainingAmount = Math.max(target - totalSaved, 0);
      savingsPerDay = remainingAmount / daysRemaining;
    }

    let suggestionClass = "";
    let suggestionMessage = "";

    if (totalSaved >= target) {
      suggestionClass = "suggestion-achieved";
      suggestionMessage = `🏆 Yeay, kamu sudah<strong>achieve</strong> target ini!`;
    } else if (daysRemaining > 0) {
      suggestionClass = "suggestion-progress";
      suggestionMessage = `🗓️ Nabung <strong>Rp ${formatCurrency(
        savingsPerDay
      )}</strong> per hari untuk capai targetmu`;
    } else {
      suggestionClass = "suggestion-expired";
      suggestionMessage = `❌ Target date sudah lewat, yuk tinjau ulang targetmu`;
    }

    card.innerHTML = `
  <div class="card-content" ">
    <div class="category-header">
      <div class="category-info">
        <img src="https://api.dicebear.com/9.x/icons/svg?scale=80&seed=${encodeURIComponent(
          category.name
        )}"
             alt="${category.name}" class="category-icon"/>
        <div class="category-details">
          <div class="category-name">${category.name}</div>
          <div class="category-duration">Target ${formatTimeDifference(
            new Date(),
            new Date(category.targetCompleted)
          )}</div>
        </div>
      </div>
      <div class="category-meta">
        <span class="category-amount">Rp ${formatCurrency(totalSaved)} </span>
        <span class="category-percentage">${percentage}%</span>
      </div>
    </div>
    
    <div class="progress-container">
      <div class="progress-bar-wrapper">
        <div class="progress-fill" style="width: ${completedBar}%;"></div>
      </div>
      <div class="progress-footer">
        <span>
        ${new Date(category.targetCompleted).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </span>
        <span>Rp ${formatCurrency(target)}</span>
      </div>
    </div>
  </div>
  <div class="card-category-footer">
  <div class="daily-suggestion ${suggestionClass}">
        ${suggestionMessage}
      </div>
  </div
`;

    container.appendChild(card);
  });
}

function formatTimeDifference(startDate, endDate) {
  const msPerDay = 1000 * 60 * 60 * 24;
  const diffInMs = endDate - startDate;
  const days = Math.ceil(diffInMs / msPerDay);

  if (days <= 0) {
    return "Sudah lewat";
  } else if (days < 30) {
    return `${days} Hari`;
  } else if (days < 60) {
    return `1 Bulan`;
  } else {
    const years = endDate.getFullYear() - startDate.getFullYear();
    const months = endDate.getMonth() - startDate.getMonth();
    const totalMonths = years * 12 + months;
    return `${totalMonths} Bulan`;
  }
}

function setupTransactionToggle() {
  const savingsList = document.getElementById("savings-list");
  const toggleBtn = document.getElementById("toggle-transactions");
  const chevronIcon = document.getElementById("chevron-icon");
  const items = savingsList.querySelectorAll(".savings-item");

  if (items.length <= 3) {
    toggleBtn.style.display = "none"; // Tidak cukup data untuk toggle
    return;
  }

  // Sembunyikan semua item ke-4 dan seterusnya
  for (let i = 3; i < items.length; i++) {
    items[i].classList.add("hidden");
  }

  // Tampilkan tombol karena ada lebih dari 3 item
  toggleBtn.style.display = "inline-block";

  let expanded = false;
  toggleBtn.addEventListener("click", () => {
    expanded = !expanded;

    for (let i = 3; i < items.length; i++) {
      items[i].classList.toggle("hidden", !expanded);
    }

    toggleBtn.innerHTML = expanded
      ? 'Tampilkan Lebih Sedikit <i class="fa-solid fa-chevron-up" id="chevron-icon"></i>'
      : 'Lihat Lainnya <i class="fa-solid fa-chevron-down" id="chevron-icon"></i>';
  });
}

function toggleSavingsUI(savings) {
  const elementsToToggle = [document.getElementById("savings-information")];

  const shouldHide = savings.length === 0;

  elementsToToggle.forEach((el) => {
    if (el) {
      console.log("Toggling element:", el.id);
      if (shouldHide) {
        el.classList.add("hidden");
      } else {
        el.classList.remove("hidden");
      }
    } else {
      console.warn("Element not found");
    }
  });
}

function showCategoryForm() {
  const form = document.querySelector(".category-form");
  if (form) {
    form.classList.remove("hidden");
  }
}

let isHidden = false;

function toggleAmount() {
  const amountEl = document.getElementById("totalAmount");
  const iconEl = document.getElementById("eyeIcon");

  if (isHidden) {
    // Tampilkan total tabungan
    const totalAmount = savings.reduce(
      (sum, saving) => sum + saving.nominal,
      0
    );
    amountEl.textContent = `Rp ${formatCurrency(totalAmount)}`;

    iconEl.classList.remove("uil-eye");
    iconEl.classList.add("uil-eye-slash");
  } else {
    // Sembunyikan saldo
    amountEl.textContent = "••••••••";

    iconEl.classList.remove("uil-eye-slash");
    iconEl.classList.add("uil-eye");
  }

  isHidden = !isHidden;
}

// Export functions for potential future use
window.tabunganApp = {
  openBottomSheet,
  closeBottomSheet,
  saveCategory,
  saveTabungan,
  getSavingsStats,
  getTotalSavingsByCategory,
  getTotalSavingsByPaymentMethod,
  displayStatistics,
  toggleSavingsUI,
};
