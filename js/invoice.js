let invoiceCounter = 1;

function generateInvoiceNumber() {
  const prefix = document.getElementById("invoicePrefix").value || "INV-";

  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0"); // bulan mulai dari 0
  const yyyy = now.getFullYear();

  const datePart = `${dd}${mm}${yyyy}`;
  const randomPart = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  const invoiceNumber = `${prefix}${datePart}${randomPart}`;
  document.getElementById("invoiceNo").value = invoiceNumber;
}

function previewLogo(event) {
  const input = event.target;
  const file = input.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = function (e) {
      const imageSrc = e.target.result;

      // Tampilkan preview kecil
      document.getElementById("preview-logo-upload").src = imageSrc;
      document.getElementById("preview-logo-upload").style.display = "block";

      // Tampilkan juga di invoice preview
      document.getElementById("invoice-logo-preview").src = imageSrc;
      document.getElementById("invoice-logo-preview").style.display = "block";
    };

    reader.readAsDataURL(file);
  }

  showToast("Logo kamu berhasil diupload!", "success", 2000);
}

function addNewItem() {
  const itemContainer = document.getElementById("items");
  const div = document.createElement("div");
  div.className = "section item-invoice";
  div.innerHTML = `
        <input type="text" placeholder="Item Name" class="itemName" /><br>
      <div class="item-desc-container">
        <div class="itemDescQuill" style="height: 100px"></div>
      </div>
        <div class="row">
          <input type="number" min="0" placeholder="Qty" class="qty" onchange="calculateAmount(this)" />
          <input type="number" min="0" placeholder="Rate" class="rate" onchange="calculateAmount(this)" />
          <input type="text" placeholder="Amount" class="amount" readonly />
        </div>
        <div class="action-buttons-invoice">
        <button class="delete-btn" onclick="deleteItemInvoice(this)">
             <i class="fa-regular fa-trash-can"></i>
        </button>
        </div>

      `;
  itemContainer.appendChild(div);

  const quill = new Quill(div.querySelector(".itemDescQuill"), {
    theme: "snow",
    placeholder: "Item Description",
    modules: {
      toolbar: [
        // [{ header: [1, 2, false] }],
        ["bold", "italic", "underline"],
        ["link", "blockquote"],
        [{ list: "ordered" }, { list: "bullet" }],
      ],
    },
  });

  // Simpan instance ke element, jika nanti kamu ingin akses valuenya
  div.quillInstance = quill;
}

function calculateAmount(el) {
  const row = el.closest(".row");
  const qty = row.querySelector(".qty").value;
  const rate = row.querySelector(".rate").value;
  const amount = row.querySelector(".amount");
  const result = (parseFloat(qty) || 0) * (parseFloat(rate) || 0);
  amount.value = result.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
  });
  calculateTotal();
}

function calculateTotal() {
  const amounts = document.querySelectorAll(".amount");
  let subtotal = 0;

  // Hitung jumlah semua item
  amounts.forEach((a) => {
    const value =
      parseFloat(a.value.replace(/[^0-9,-]+/g, "").replace(",", ".")) || 0;
    subtotal += value;
  });

  // Tampilkan Subtotal
  document.getElementById("subtotal").innerText = `${subtotal.toLocaleString(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
    }
  )}`;

  // Ambil nilai diskon
  const discountType = document.getElementById("discountType").value;
  const discountValue =
    parseFloat(document.getElementById("discountValue").value) || 0;
  let discountAmount = 0;

  if (discountType === "percent") {
    if (discountValue >= 0 && discountValue <= 100) {
      discountAmount = (discountValue / 100) * subtotal;
    }
  } else if (discountType === "amount") {
    discountAmount = discountValue;
  }

  const total = Math.max(0, subtotal - discountAmount); // pastikan tidak negatif

  // Tampilkan total dan info diskon
  document.getElementById("total").innerText = total.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
  });

  document.getElementById("totalInWords").innerText = numberToWords(total);

  document.getElementById(
    "discountInfo"
  ).innerText = `- ${discountAmount.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
  })}`;
}

//DISCOUNT
document
  .getElementById("discountType")
  .addEventListener("change", calculateTotal);
document
  .getElementById("discountValue")
  .addEventListener("input", calculateTotal);

function numberToWords(n) {
  const satuan = [
    "",
    "satu",
    "dua",
    "tiga",
    "empat",
    "lima",
    "enam",
    "tujuh",
    "delapan",
    "sembilan",
  ];

  function toWords(num) {
    if (num < 10) return satuan[num];
    if (num === 10) return "sepuluh";
    if (num === 11) return "sebelas";
    if (num < 20) return satuan[num % 10] + " belas";
    if (num < 100)
      return satuan[Math.floor(num / 10)] + " puluh " + satuan[num % 10];
    if (num < 200) return "seratus " + toWords(num - 100);
    if (num < 1000)
      return satuan[Math.floor(num / 100)] + " ratus " + toWords(num % 100);
    if (num < 2000) return "seribu " + toWords(num - 1000);
    if (num < 1000000)
      return toWords(Math.floor(num / 1000)) + " ribu " + toWords(num % 1000);
    if (num < 1000000000)
      return (
        toWords(Math.floor(num / 1000000)) + " juta " + toWords(num % 1000000)
      );
    return "Jumlah terlalu besar";
  }

  return toWords(Math.floor(n)).replace(/\s+/g, " ").trim() + " rupiah";
}

function deleteItemInvoice(button) {
  const section = button.closest(".item-invoice");
  if (section) {
    section.remove();
    calculateTotal(); // panggil ulang kalkulasi total jika ada
  }
}

//REUSABLE
// ==== GLOBAL VARIABLES ====
const billedByList = [];
let selectedBilledByIndex = null;

const billedToList = [];
let selectedBilledToIndex = null;

function saveBilled(type) {
  const name = document.getElementById(`nameBilled${type}`).value.trim();
  const address =
    document.getElementById(`addressBilled${type}`)?.value.trim() || "";
  const email =
    document.getElementById(`emailBilled${type}`)?.value.trim() || "";
  const phone = document
    .getElementById(`phoneNumberBilled${type}`)
    .value.trim();

  if (!name || !phone) {
    alert(`Nama dan Nomor HP untuk Billed ${type} harus diisi.`);
    return;
  }

  if (type === "By" && (!address || !email)) {
    alert(`Alamat dan Email untuk Billed ${type} harus diisi.`);
    return;
  }

  const list = type === "By" ? billedByList : billedToList;
  list.push({ name, address, email, phone });

  // Clear input
  document.getElementById(`nameBilled${type}`).value = "";
  if (document.getElementById(`addressBilled${type}`))
    document.getElementById(`addressBilled${type}`).value = "";
  if (document.getElementById(`emailBilled${type}`))
    document.getElementById(`emailBilled${type}`).value = "";
  document.getElementById(`phoneNumberBilled${type}`).value = "";

  saveBilledToLocalStorage(type);
  renderBilled(type);
  closeBottomSheet(`addBilled${type}BottomSheet`);

  showToast(`Billed ${type} berhasil ditambahkan!`, "success", 2000);
}

// ==== RENDER FUNCTION (REUSABLE) ====
function renderBilled(type) {
  const container = document.getElementById(`billed${type}Container`);
  const list = type === "By" ? billedByList : billedToList;
  const selectedIndex =
    type === "By" ? selectedBilledByIndex : selectedBilledToIndex;
  container.innerHTML = "";

  list.forEach((data, index) => {
    const card = document.createElement("div");
    card.className = "billed-card";

    if (selectedIndex === index) {
      card.classList.add("selected");
    }

    card.innerHTML = `
        <div class="check-icon">
          <i class="fa-solid fa-check-circle"></i>
         </div>
      <button onclick="removeBilled(${index}, '${type}')" class="delete-top-right">
        <i class="uil uil-trash"></i>
      </button>
      <img src="https://api.dicebear.com/9.x/personas/svg?backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&scale=100&seed=${encodeURIComponent(
        data.name
      )}" class="billed-logo"/>
      <p class="name"><strong>${data.name}</strong></p>
      <p class="address">${data.address}</p>
      <p class="email">${data.email}</p>
      <p class="phoneNumber">${data.phone}</p>
    `;

    card.addEventListener("click", (e) => {
      if (!e.target.closest("button")) {
        if (type === "By") {
          selectedBilledByIndex =
            selectedBilledByIndex === index ? null : index;
        } else {
          selectedBilledToIndex =
            selectedBilledToIndex === index ? null : index;
        }
        renderBilled(type);
        showSelectedBilled(type);
      }
    });

    container.appendChild(card);
  });
}

// ==== SHOW SELECTED FUNCTION (REUSABLE) ====
function showSelectedBilled(type) {
  const list = type === "By" ? billedByList : billedToList;
  const selectedIndex =
    type === "By" ? selectedBilledByIndex : selectedBilledToIndex;

  if (selectedIndex !== null) {
    const selected = list[selectedIndex];
    console.log(`Selected Billed ${type}:`, selected);
    // tampilkan di preview, invoice, dll
  } else {
    console.log(`No Billed ${type} selected`);
  }
  saveBilledToLocalStorage(type);
}

// ==== REMOVE FUNCTION (REUSABLE) ====
function removeBilled(index, type) {
  const list = type === "By" ? billedByList : billedToList;
  let selectedIndex =
    type === "By" ? selectedBilledByIndex : selectedBilledToIndex;

  list.splice(index, 1);
  if (selectedIndex === index) {
    selectedIndex = null;
  } else if (selectedIndex > index) {
    selectedIndex--;
  }

  if (type === "By") {
    selectedBilledByIndex = selectedIndex;
  } else {
    selectedBilledToIndex = selectedIndex;
  }

  saveBilledToLocalStorage(type);
  renderBilled(type);
}

// ==== LOCAL STORAGE SAVE/LOAD (REUSABLE) ====
function saveBilledToLocalStorage(type) {
  const list = type === "By" ? billedByList : billedToList;
  const selectedIndex =
    type === "By" ? selectedBilledByIndex : selectedBilledToIndex;

  localStorage.setItem(`billed${type}List`, JSON.stringify(list));
  localStorage.setItem(
    `selectedBilled${type}Index`,
    JSON.stringify(selectedIndex)
  );
}

function loadBilledFromLocalStorage(type) {
  const list = type === "By" ? billedByList : billedToList;
  const storedList = localStorage.getItem(`billed${type}List`);
  const storedIndex = localStorage.getItem(`selectedBilled${type}Index`);

  if (storedList) {
    list.splice(0, list.length, ...JSON.parse(storedList));
  }

  if (storedIndex !== null) {
    if (type === "By") {
      selectedBilledByIndex = JSON.parse(storedIndex);
    } else {
      selectedBilledToIndex = JSON.parse(storedIndex);
    }
  }

  renderBilled(type);
}

//save tnc and footer
function saveTncAndFooter() {
  const tncHtml = quill.root.innerHTML.trim(); // Ambil isi HTML dari Quill editor
  const footer = document.getElementById("footerField").value.trim();

  localStorage.setItem("invoiceTnc", tncHtml);
  localStorage.setItem("invoiceFooter", footer);
}

//Load Tnc adn Footer from local storage
function loadTncAndFooter() {
  const savedTnc = localStorage.getItem("invoiceTnc");
  const savedFooter = localStorage.getItem("invoiceFooter");

  if (savedTnc !== null) {
    quill.root.innerHTML = savedTnc; // Tampilkan kembali ke Quill editor
  }

  if (savedFooter !== null) {
    document.getElementById("footerField").value = savedFooter;
  }
}

//Show SELECTED BILLED TO AND BILLED BY
function showSelectedBilling() {
  const billedByDiv = document.querySelector(
    "#billedByContainer .billed-card.selected"
  );
  const billedToDiv = document.querySelector(
    "#billedToContainer .billed-card.selected"
  );

  const invoiceBilledBy = document.getElementById("invoice-billed-by");
  const invoiceBilledTo = document.getElementById("invoice-billed-to");

  if (invoiceBilledBy && billedByDiv) {
    const logo = billedByDiv.querySelector(".billed-logo")?.src || "";
    const name = billedByDiv.querySelector("p strong")?.textContent || "";
    const details = Array.from(billedByDiv.querySelectorAll("p"))
      .slice(1)
      .map((p) => `<p>${p.textContent}</p>`)
      .join("");

    invoiceBilledBy.innerHTML = `
          <img src="${logo}" class="billed-logo-preview">
          <p><strong>${name}</strong></p>
          <p>${details}</p>
        `;
  }

  if (invoiceBilledTo && billedToDiv) {
    const logo = billedToDiv.querySelector(".billed-logo")?.src || "";
    const name = billedToDiv.querySelector("p strong")?.textContent || "";
    const details = Array.from(billedToDiv.querySelectorAll("p"))
      .slice(1)
      .map((p) => `<p>${p.textContent}</p>`)
      .join("");

    invoiceBilledTo.innerHTML = `
          <img src="${logo}" class="billed-logo-preview">
          <p><strong>${name}</strong></p>
          <p>${details}</p>
        `;
  }
}

// PREVIEW INVOICE
function previewInvoice() {
  // Preview header info
  document.getElementById("preview-invoice-number").textContent =
    document.getElementById("invoiceNo").value;
  // document.getElementById("preview-invoice-date").textContent =
  //   document.getElementById("invoiceDate").value;
  // document.getElementById("preview-due-date").textContent =
  //   document.getElementById("dueDate").value;

  //Date Format show to customer
  const invoiceDateValue = document.getElementById("invoiceDate").value;
  const dueDateValue = document.getElementById("dueDate").value;

  const invoiceDate = new Date(invoiceDateValue);
  const dueDate = new Date(dueDateValue);

  // Format: 12 June 2025
  const formattedInvoiceDate = invoiceDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const formattedDueDate = dueDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  document.getElementById("preview-invoice-date").textContent =
    formattedInvoiceDate;
  document.getElementById("preview-due-date").textContent = formattedDueDate;

  //Logo Preview
  const logoInput = document.getElementById("logoPreview");
  if (logoInput && logoInput.files && logoInput.files.length > 0) {
    const reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById("preview-logo").src = e.target.result;
    };
    reader.readAsDataURL(logoInput.files[0]);
  }

  // Item list
  const itemsTable = document.getElementById("preview-items");
  itemsTable.innerHTML = "";

  const items = document.querySelectorAll(".item-invoice");

  if (items.length === 0) {
    // Tambahkan baris empty state
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = `
    <td colspan="4" style="text-align: center; padding: 1rem; color: #888;">
      Belum ada item ditambahkan
    </td>
  `;
    itemsTable.appendChild(emptyRow);
  } else {
    items.forEach((item) => {
      const name = item.querySelector(".itemName").value;
      const desc = item.quillInstance?.root.innerHTML || "";
      const qty = item.querySelector(".qty").value;
      const rate = item.querySelector(".rate").value;
      const amount = item.querySelector(".amount").value;

      const row = document.createElement("tr");
      row.innerHTML = `
      <td style="min-width: 60%;">
        <div class="item-name">${name}</div>
        <div class="item-desc">${desc}</div>
      </td>
      <td style="text-align: center;">${qty}</td>
      <td style="text-align: right;">Rp${Number(rate).toLocaleString(
        "id-ID"
      )}</td>
      <td style="text-align: right;">${amount}</td>
    `;
      itemsTable.appendChild(row);
    });
  }

  const subtotal = document.getElementById("subtotal")?.textContent || "Rp 0";
  const discountInfo =
    document.getElementById("discountInfo")?.textContent || "Diskon: Rp 0";
  const total = document.getElementById("total")?.textContent || "Rp 0";
  const totalWords = document.querySelector(".total-words")?.textContent || "";

  document.getElementById("preview-subtotal").textContent = subtotal;
  document.getElementById("preview-discountInfo").textContent = discountInfo;
  document.getElementById("preview-total").textContent = total;
  document.getElementById("preview-total-words").textContent = totalWords;

  // TnC & Footer preview
  // Ambil data dari Quill
  const tncHtml = quill.root.innerHTML; // Asumsikan Quill instance kamu bernama 'quill'
  const footer = document.getElementById("footerField").value.trim();

  //panggil selected payment info
  showSelectedPayment(); // ✅ panggil di sini

  // Tampilkan ke preview
  document.getElementById("preview-tnc").innerHTML = tncHtml || "";
  document.getElementById("preview-footer").textContent = footer || "";

  const invoice = document.getElementById("invoice-preview-section");
  if (invoice) {
    invoice.style.display = "block"; // munculkan invoice
  }

  saveTncAndFooter();
  showSelectedBilled("By");
  showSelectedBilled("To");
  showSelectedBilling(); //
  loadTncAndFooter();
  // Otomatis update saat konten berubah
  quill.on("text-change", updatePreviewTnC);

  showToast("Invoice preview berhasil diperbarui!", "success", 20000);
}

//RICH TEXT EDITOR
// Inisialisasi Quill
const quill = new Quill("#tncField", {
  theme: "snow",
  placeholder: "Add Tnc",
  modules: {
    toolbar: [
      // [{ header: [1, 2, false] }],
      ["bold", "italic", "underline"],
      ["link", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
    ],
  },
});

// Function untuk update isi ke preview
function updatePreviewTnC() {
  const tncHtml = quill.root.innerHTML;
  document.getElementById("preview-tnc").innerHTML = tncHtml;
}

quill.on("text-change", function () {
  saveTncAndFooter();
});

document.getElementById("footerField").addEventListener("input", function () {
  saveTncAndFooter();
});

//Render Sharing Payment Method
function renderInvoicePayments() {
  const data = JSON.parse(localStorage.getItem("paymentMethods")) || [];
  renderPaymentCards("invoicePaymentCardsContainer", data); // ID untuk invoice
}

//FILE INFO LOGO
const logoInput = document.getElementById("logoPreview");
const logoFileName = document.getElementById("fileName-logo");
const removeLogoBtn = document.getElementById("removeLogoBtn");
const previewLogoImage = document.getElementById("preview-logo-upload");

logoInput.addEventListener("change", function () {
  const file = this.files[0];

  if (file) {
    logoFileName.textContent = truncateFileName(file.name);

    // Preview logo image
    const reader = new FileReader();
    reader.onload = function (e) {
      previewLogoImage.src = e.target.result;
      previewLogoImage.style.display = "block";
    };
    reader.readAsDataURL(file);
  }
});

removeLogoBtn.addEventListener("click", function () {
  logoInput.value = "";
  logoFileName.textContent = "No selected File";
  previewLogoImage.style.display = "none";
});

function truncateFileName(fileName, maxLength = 20) {
  if (fileName.length <= maxLength) return fileName;

  const dotIndex = fileName.lastIndexOf(".");
  const ext = dotIndex !== -1 ? fileName.slice(dotIndex) : "";
  const nameOnly = dotIndex !== -1 ? fileName.slice(0, dotIndex) : fileName;

  const truncatedName = nameOnly.slice(0, maxLength - ext.length - 3);
  return truncatedName + "..." + ext;
}
//GET SELECTED BILLED BY AND BILLED TO
function getSelectedBillingData(containerId) {
  const selectedCard = document.querySelector(
    `#${containerId} .billed-card.selected`
  );
  if (!selectedCard) return null;

  return {
    name: selectedCard.querySelector("p strong")?.textContent || "",
    address: selectedCard.querySelectorAll("p")[1]?.textContent || "",
    email: selectedCard.querySelectorAll("p")[2]?.textContent || "",
    phone: selectedCard.querySelectorAll("p")[3]?.textContent || "",
    logo: selectedCard.querySelector(".billed-logo")?.src || "",
  };
}

//GET SELECTED PAYMENT METOD
// function getSelectedPaymentMethods() {
//   const paymentElements = document.querySelectorAll(
//     "#selectedPaymentInfo .selected-payment-summary"
//   );

//   return Array.from(paymentElements).map((el) => {
//     return {
//       logo: el.querySelector("img")?.src || "",
//       name: el.querySelector("p strong")?.textContent || "",
//       phone:
//         el.querySelectorAll("p")[1]?.textContent?.replace("No HP: ", "") || "",
//     };
//   });
// }

function getSelectedPaymentMethods() {
  const paymentElements = document.querySelectorAll(
    "#selectedPaymentInfo .selected-payment-summary"
  );

  return Array.from(paymentElements).map((el) => {
    const secondP = el.querySelectorAll("p")[1];
    const infoText = secondP?.innerHTML || ""; // innerHTML untuk menangkap <br>

    let phone = "";
    let accountNumber = "";
    let bankName = "";

    if (infoText.includes("No HP:")) {
      phone = secondP.textContent.replace("No HP: ", "").trim();
    } else if (infoText.includes("Rek:")) {
      // Pisahkan berdasarkan <br> atau newline
      const lines = infoText.split(/<br\s*\/?>|\n/).map((line) => line.trim());
      lines.forEach((line) => {
        if (line.startsWith("Rek:")) {
          accountNumber = line.replace("Rek:", "").trim();
        } else if (line.startsWith("Bank:")) {
          bankName = line.replace("Bank:", "").trim();
        }
      });
    }

    return {
      logo: el.querySelector("img")?.src || "",
      name: el.querySelector("p strong")?.textContent || "",
      phone,
      accountNumber,
      bankName,
    };
  });
}

//Parse Currency to Amount
function parseCurrency(rpString) {
  if (!rpString) return 0;

  // Hilangkan "Rp", spasi, dan ubah titik jadi kosong, lalu koma jadi titik
  const cleaned = rpString
    .replace(/[^0-9,]/g, "") // hanya sisakan angka dan koma
    .replace(/\./g, "") // hapus titik (ribuan separator)
    .replace(",", "."); // ubah koma (desimal ID) ke titik (desimal en-US)

  return parseFloat(cleaned);
}

//Save invoice to History
function saveInvoiceToHistory() {
  const history = JSON.parse(localStorage.getItem("invoiceHistory")) || [];
  const billedBy = getSelectedBillingData("billedByContainer");
  const billedTo = getSelectedBillingData("billedToContainer");

  const invoiceNo = document.getElementById(
    "preview-invoice-number"
  ).textContent;

  const invoiceData = {
    invoiceNo,
    invoiceDate: document.getElementById("preview-invoice-date").textContent,
    dueDate: document.getElementById("preview-due-date").textContent,

    subtotal: parseCurrency(
      document.getElementById("preview-subtotal").textContent
    ),
    discountInfo: parseCurrency(
      document.getElementById("preview-discountInfo").textContent
    ),
    total: parseCurrency(document.getElementById("preview-total").textContent),

    totalWords: document.getElementById("preview-total-words").textContent,
    tnc: document.getElementById("preview-tnc").innerHTML,
    footer: document.getElementById("preview-footer").textContent,
    logoSrc: null,
    items: [],
    billedBy,
    billedTo,
    paymentMethods: getSelectedPaymentMethods(),
  };

  // Handle logo
  const logoElement = document.getElementById("invoice-logo-preview");
  if (logoElement) {
    invoiceData.logoSrc = logoElement.src;
  }

  // Ambil semua item dari preview
  const rows = document.querySelectorAll("#preview-items tr");
  rows.forEach((row) => {
    const nameEl = row.querySelector(".item-name");
    const descEl = row.querySelector(".item-desc");
    const cells = row.querySelectorAll("td");

    if (nameEl && descEl && cells.length === 4) {
      invoiceData.items.push({
        name: nameEl.textContent,
        // desc: descEl.innerHTML,
        desc: descEl.innerHTML.trim(), // ✅ simpan deskripsi dalam bentuk HTML
        qty: parseFloat(cells[1].textContent) || 0,
        rate: parseCurrency(cells[2].textContent),
        amount: parseCurrency(cells[3].textContent),
      });
    }
  });

  // Cek apakah invoice dengan nomor yang sama sudah ada
  const existingIndex = history.findIndex(
    (item) => item.invoiceNo === invoiceNo
  );

  if (existingIndex !== -1) {
    // Sudah ada → update data
    history[existingIndex] = invoiceData;
    showToast("Invoice berhasil diperbarui di histori!", "success", 4000);
  } else {
    // Belum ada → tambahkan
    history.push(invoiceData);
    showToast("Invoice berhasil disimpan ke histori!", "success", 4000);
  }

  // Simpan kembali ke localStorage
  localStorage.setItem("invoiceHistory", JSON.stringify(history));
}

//Get data dari local storage buat list history nya
const invoiceHistory = JSON.parse(localStorage.getItem("invoiceHistory")) || [];

function renderInvoiceCards() {
  const container = document.getElementById("invoiceCardList");
  container.innerHTML = "";

  const history = JSON.parse(localStorage.getItem("invoiceHistory")) || [];

  if (history.length === 0) {
    container.innerHTML = `
           <div class="no-data-message">
            <img src="img/empty-state.png" alt="Empty State" class="empty-state-image">
                <p class="title-empty-state">Belum ada Invoice yang disimpan<p>
                <p class="desc-empty-state">Buat invoice sekarang!<p>
            </div>
    `;
    return;
  }

  history.forEach((invoice) => {
    const card = document.createElement("div");
    card.classList.add("invoice-card");
    // Tambahkan data-id dan onclick
    card.dataset.id = invoice.invoiceNo;
    card.onclick = () => openInvoiceDetail(invoice.invoiceNo);

    card.innerHTML = `
      <div class="invoice-card-header">
        <div class="invoice-card-header-left">
          <i class="uil uil-invoice invoice-icon"></i>
          <span class="invoice-no">${invoice.invoiceNo}</span>
        </div>
        <div class="invoice-card-header-right">

          <div class="invoice-card-amount">${formatCurrency(
            invoice.total
          )}</div>

        </div>
      </div>
      <div class="invoice-card-body">
        <p><strong>Billed To:</strong> ${invoice.billedTo?.name || "-"}</p>
        <p><strong>Due Date:</strong> ${invoice.dueDate}</p>
      </div>
      <div class="invoice-card-footer">
      <div class="invoice-status">Paid</div>
      <div class="see-detail">Lihat Detail<i class="uil uil-angle-right-b"></i></div>
      </div>
    `;

    container.appendChild(card);
  });
}

//Open Invoice Detail Page
function openInvoiceDetail(invoiceNo) {
  sessionStorage.setItem("selectedInvoiceNo", invoiceNo);
  window.location.href = "invoice-detail.html";
}

document.getElementById("tncField").addEventListener("input", saveTncAndFooter);
document
  .getElementById("footerField")
  .addEventListener("input", saveTncAndFooter);

window.addEventListener("DOMContentLoaded", () => {
  loadBilledFromLocalStorage("By");
  loadBilledFromLocalStorage("To");
  loadTncAndFooter();
});

document.addEventListener("DOMContentLoaded", () => {
  loadTncAndFooter();
});

document.addEventListener("DOMContentLoaded", function () {
  // flatpickr("#invoiceDate", {
  //   dateFormat: "d-m-Y",
  //   defaultDate: "today",
  // });

  // flatpickr("#dueDate", {
  //   dateFormat: "d-m-Y",
  //   defaultDate: "today",
  // });

  flatpickr("#invoiceDate", {
    altInput: true,
    altFormat: "d F Y", // ditampilkan ke user
    dateFormat: "Y-m-d", // disimpan ke .value
    defaultDate: "today",
  });

  flatpickr("#dueDate", {
    altInput: true,
    altFormat: "d F Y",
    dateFormat: "Y-m-d",
    defaultDate: "today",
  });
});

document.getElementById("discountType").addEventListener("change", function () {
  document.getElementById("discountValue").value = "";
  document.getElementById("discountInfo").textContent = "Diskon: Rp 0,00";
  calculateTotal(); // refresh perhitungan total
});

const discountInput = document.getElementById("discountValue");

discountInput.addEventListener("input", () => {
  if (parseFloat(discountInput.value) < 0) {
    discountInput.value = "";
  }
});

discountInput.addEventListener("keydown", function (e) {
  if (e.key === "-" || e.key === "Minus") {
    e.preventDefault();
  }
});
