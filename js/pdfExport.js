function exportToPDF() {
  const summaryDiv = document.getElementById("summary");

  if (!summaryDiv || summaryDiv.innerHTML.trim() === "") {
    alert("No summary data available to export!");
    return;
  }

  const activityNameInput = document.getElementById("activityName");
  const activityName =
    activityNameInput && typeof activityNameInput.value === "string"
      ? activityNameInput.value.trim()
      : "Split Bill Report";

  const today = new Date();
  const formattedDate = today.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const clonedSummary = summaryDiv.cloneNode(true);

  // Ganti semua warna teks dalam clonedSummary menjadi hitam
  const allElements = clonedSummary.querySelectorAll("*");
  allElements.forEach((el) => {
    el.style.color = "#000000";
    el.style.backgroundColor = "transparent";
    el.style.boxShadow = "none";
  });

  // Warna emoji dan kondisi
  allElements.forEach((el) => {
    if (el.textContent.includes("✅")) {
      el.style.color = "#2e7d32";
      el.style.fontWeight = "600";
      el.style.fontSize = "13px"; // pastikan tidak terlalu besar
    } else if (
      el.textContent.includes("❌") ||
      el.textContent.includes("tidak seimbang")
    ) {
      el.style.color = "#c62828";
      el.style.fontWeight = "600";
      el.style.fontSize = "13px"; // pastikan tidak terlalu besar
    } else if (el.textContent.includes("Hutang")) {
      el.style.color = "#272a33";
      el.style.fontWeight = "600";
      el.style.fontSize = "13px"; // pastikan tidak terlalu besar
    }
  });
  //Styling separator header
  const summaryHeader = clonedSummary.querySelectorAll(".summary-header");
  summaryHeader.forEach((summaryHeader) => {
    summaryHeader.style.borderColor = "#f7f7f7";
  });

  //Styling separator summary header
  const summaryValidation = clonedSummary.querySelectorAll(
    ".summary-validation"
  );
  summaryValidation.forEach((summaryValidation) => {
    summaryValidation.style.borderColor = "#f7f7f7";
  });

  //Styling separator
  const separator = clonedSummary.querySelectorAll(".separator");
  separator.forEach((separator) => {
    separator.style.borderColor = "#f7f7f7";
  });

  //Styling activity-name
  const h1 = clonedSummary.querySelectorAll(".activity-name");
  h1.forEach((h1) => {
    h1.style.fontSize = "20px";
  });

  //Styling user-transfers
  const userTransfers = clonedSummary.querySelectorAll(".user-transfers");
  userTransfers.forEach((userTransfers) => {
    userTransfers.style.borderRadius = "10px";
    userTransfers.style.backgroundColor = "#eef6fc";
  });

  //Styling breakdownRow
  const breakdownRow = clonedSummary.querySelectorAll(".breakdown-row");
  breakdownRow.forEach((breakdownRow) => {
    breakdownRow.style.color = "#848486";
    breakdownRow.style.fontWeight = "100";
  });

  //Styling discount label
  const discountLabel = clonedSummary.querySelectorAll(".discount-label");
  discountLabel.forEach((discountLabel) => {
    discountLabel.style.color = "#cc0000";
    discountLabel.style.padding = "1px 4px";
    discountLabel.style.borderRadius = "5px";
    discountLabel.style.backgroundColor = "#ffe0e0";
  });

  //Styling User Details
  const userDetails = clonedSummary.querySelectorAll(".user-details p");
  userDetails.forEach((userDetails) => {
    userDetails.style.color = "#848486";
    userDetails.style.fontWeight = "100";
  });

  //Styling User Expense
  const userExpense = clonedSummary.querySelectorAll(".user-expense p");
  userExpense.forEach((userExpense) => {
    userExpense.style.color = "#848486";
    userExpense.style.fontWeight = "100";
  });

  // Styling avatar
  const avatars = clonedSummary.querySelectorAll(".summary-avatar");
  avatars.forEach((avatar) => {
    avatar.style.width = "40px";
    avatar.style.height = "40px";
    avatar.style.borderRadius = "50%";
    avatar.style.objectFit = "cover";
  });

  const pdfContainer = document.createElement("div");
  pdfContainer.appendChild(clonedSummary);

  // Global styling
  pdfContainer.style.padding = "50px";
  pdfContainer.style.fontFamily = "poppins";
  pdfContainer.style.fontSize = "13px";
  pdfContainer.style.backgroundColor = "#ffffff";
  pdfContainer.style.color = "#000000";
  pdfContainer.style.lineHeight = "1.6";

  // Signature
  const footer = document.createElement("div");
  footer.textContent = "💡 Dibuat dengan Split Bill App oleh Agus Budiman";
  footer.style.marginTop = "30px";
  footer.style.textAlign = "center";
  footer.style.fontSize = "11px";
  footer.style.color = "#888";
  footer.style.width = "100%";
  footer.style.overflowWrap = "break-word";
  footer.style.lineHeight = "1.4";
  pdfContainer.appendChild(footer);

  // 🔁 Convert semua img ke base64 (khusus avatar)
  const convertImagesToBase64 = () => {
    const imgPromises = [];
    const images = pdfContainer.querySelectorAll("img");

    images.forEach((img) => {
      if (img.src.startsWith("data:")) return; // Sudah base64

      const promise = new Promise((resolve) => {
        const tempImg = new Image();
        tempImg.crossOrigin = "anonymous";
        tempImg.onload = function () {
          const canvas = document.createElement("canvas");
          canvas.width = tempImg.naturalWidth;
          canvas.height = tempImg.naturalHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(tempImg, 0, 0);
          const dataURL = canvas.toDataURL("image/png");
          img.setAttribute("src", dataURL);
          resolve();
        };
        tempImg.onerror = function () {
          console.warn("Gagal load gambar untuk base64:", img.src);
          resolve(); // lanjutkan walaupun gagal
        };
        tempImg.src = img.src;
      });

      imgPromises.push(promise);
    });

    return Promise.all(imgPromises);
  };

  convertImagesToBase64().then(() => {
    html2pdf()
      .set({
        margin: 10,
        filename: `${activityName.replace(/\s+/g, "_")}_Summary.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 1.5 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(pdfContainer)
      .save()
      .then(() => console.log("✅ PDF berhasil diexport"))
      .catch((error) => console.error("❌ Error export PDF:", error));
  });
}

//=============================================================

// EXPORT PDF COLLECT MONEY
function exportCollectMoneyToPDF() {
  const element = document.getElementById("collectSectionToExport");

  if (!element || element.innerHTML.trim() === "") {
    alert("Tidak ada data untuk diexport.");
    return;
  }

  // Buat container baru untuk isi PDF
  const pdfContainer = document.createElement("div");

  // Tambahkan Header
  const header = document.createElement("div");
  header.innerHTML = `
    <h1 style="margin-bottom: 5px; color: #000000;">Ringkasan Collect Money</h1>
    <hr style="margin: 10px 0; border: none; border-top: 1px solid #ccc;">
  `;
  pdfContainer.appendChild(header);

  // Clone element utama
  const clonedElement = element.cloneNode(true);

  // Hapus elemen yang dikecualikan dan simpan sementara styling-nya
  const excludes = clonedElement.querySelectorAll(".exclude-pdf");
  excludes.forEach((el) => el.classList.add("exclude-pdf-temp-hide"));

  // Ubah warna teks menjadi hitam, background transparan
  const allElements = clonedElement.querySelectorAll("*");
  allElements.forEach((el) => {
    el.style.color = "#000000";
    el.style.backgroundColor = "transparent";
  });

  // Ganti canvas jadi image
  const originalCanvases = element.querySelectorAll("canvas");
  const clonedCanvases = clonedElement.querySelectorAll("canvas");

  clonedCanvases.forEach((canvas, index) => {
    const img = document.createElement("img");
    const originalCanvas = originalCanvases[index];

    try {
      img.src = originalCanvas.toDataURL("image/png");
    } catch (error) {
      console.warn("Gagal konversi canvas:", error);
    }

    img.style.maxWidth = "40%";
    img.style.display = "block";
    img.style.marginLeft = "auto"; // Center horizontally
    img.style.marginRight = "auto"; // Center horizontally
    img.style.objectFit = "contain"; // Optional: make sure the image maintains its aspect ratio

    canvas.replaceWith(img);
  });

  // Format tabel
  const tables = clonedElement.querySelectorAll("table");
  tables.forEach((table) => {
    table.style.borderCollapse = "collapse";
    table.style.width = "100%";
    table.style.borderRadius = "10px";
  });

  const ths = clonedElement.querySelectorAll("th");
  ths.forEach((th) => {
    th.style.backgroundColor = "#7056ec";
    th.style.color = "#ffffff";
    th.style.padding = "8px";
    th.style.border = "1px solid #7056ec";
    th.style.textAlign = "center";
  });

  const tds = clonedElement.querySelectorAll("td");
  tds.forEach((td) => {
    td.style.backgroundColor = "#f9f9f9";
    td.style.color = "#000000";
    td.style.padding = "5px";
    td.style.border = "1px solid #F3F2F3";
    td.style.textAlign = "center";
  });

  // Tambahkan clonedElement ke dalam container
  pdfContainer.appendChild(clonedElement);

  // Styling global
  pdfContainer.style.padding = "30px";
  pdfContainer.style.fontFamily = "Arial, sans-serif";
  pdfContainer.style.fontSize = "13px";
  pdfContainer.style.backgroundColor = "#ffffff";
  pdfContainer.style.color = "#000000";

  // Target .card-container elements in the cloned element to apply border color
  const cardContainers = clonedElement.querySelectorAll(".card-container");
  cardContainers.forEach((card) => {
    card.style.border = "1px solid #fff"; // Set border to white in cloned element
    card.style.boxShadow = "none"; // Optionally remove shadow in cloned element
  });

  // Tambahkan clonedElement ke dalam container
  pdfContainer.appendChild(clonedElement);

  // Footer
  const footer = document.createElement("div");
  footer.textContent = "💡 Dibuat dengan Split Bill App oleh Agus Budiman";
  footer.style.marginTop = "30px";
  footer.style.textAlign = "center";
  footer.style.fontSize = "11px";
  footer.style.color = "#888";
  footer.style.width = "100%";
  footer.style.lineHeight = "1.4";
  pdfContainer.appendChild(footer);

  // Export to PDF
  html2pdf()
    .set({
      margin: 10,
      filename: `ringkasan-collect-money-${new Date().toLocaleDateString(
        "id-ID"
      )}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 1.5 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(pdfContainer)
    .save()
    .then(() => {
      console.log("✅ PDF collect exported!");
      // Tampilkan kembali tombol setelah export selesai
      excludes.forEach((el) => el.classList.remove("exclude-pdf-temp-hide"));

      // Restore styling card-container setelah PDF selesai dibuat
      cardContainers.forEach((card) => {
        card.style.boxShadow =
          card.getAttribute("data-original-box-shadow") || "";
        card.style.border = card.getAttribute("data-original-border") || "";
      });
    })
    .catch((err) => console.error("❌ Error:", err));
}

function exportInvoiceToPDF() {
  const invoiceDiv = document.getElementById("invoice");

  if (!invoiceDiv || invoiceDiv.innerHTML.trim() === "") {
    alert("No invoice data available to export!");
    return;
  }

  const today = new Date();
  const formattedDate = today.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const clonedInvoice = invoiceDiv.cloneNode(true);

  // Set semua warna teks & latar jadi netral untuk PDF
  const allElements = clonedInvoice.querySelectorAll("*");
  allElements.forEach((el) => {
    el.style.color = "#000000";
    el.style.backgroundColor = "transparent";
    el.style.boxShadow = "none";
  });

  // Format tabel
  const tables = clonedInvoice.querySelectorAll("table");
  tables.forEach((table) => {
    // table.style.borderCollapse = "collapse";
    table.style.width = "100%";
    table.style.borderRadius = "8px";
  });

  // Format header tabel
  const ths = clonedInvoice.querySelectorAll("th");
  ths.forEach((th) => {
    th.style.backgroundColor = "#7056ec";
    th.style.color = "#ffffff";
    th.style.padding = "8px";
    th.style.border = "1px solid #7056ec";
    th.style.textAlign = "center";
  });

  // Format isi tabel
  const tds = clonedInvoice.querySelectorAll("td");
  tds.forEach((td) => {
    // td.style.backgroundColor = "#f9f9f9";
    td.style.color = "#000000";
    td.style.padding = "5px 20px";
    td.style.textAlign = "center";
  });

  const trs = clonedInvoice.querySelectorAll("tr");
  trs.forEach((tr) => {
    tr.style.border = "1px solid #F3F2F3";
  });

  const itemName = clonedInvoice.querySelectorAll(".item-name");
  itemName.forEach((itemName) => {
    itemName.style.textAlign = "left";
    itemName.style.padding = "bold";
  });
  const itemDesc = clonedInvoice.querySelectorAll(".item-desc");
  itemDesc.forEach((itemDesc) => {
    itemDesc.style.textAlign = "left";
    itemDesc.style.color = "#848486";
  });

  const h1 = clonedInvoice.querySelectorAll("h1");
  h1.forEach((h1) => {
    h1.style.color = "#7056ec";
  });

  // Styling logo avatar
  const avatars = clonedInvoice.querySelectorAll(".billed-logo-preview");
  avatars.forEach((avatar) => {
    avatar.style.width = "40px";
    avatar.style.height = "40px";
    avatar.style.borderRadius = "10px";
    avatar.style.objectFit = "cover";
    avatar.style.marginBottom = "5px";
  });

  // Styling logo avatar
  const invoiceSection = clonedInvoice.querySelectorAll(".invoice-section");
  invoiceSection.forEach((invoiceSection) => {
    invoiceSection.style.backgroundColor = " #EEF6FC";
  });

  // Styling p tag dalam invoice-section
  const invoiceSections = clonedInvoice.querySelectorAll(".invoice-section p");
  invoiceSections.forEach((p) => {
    p.style.margin = "1px 0";
    p.style.color = "#333";
    p.style.fontSize = "13px";
  });

  const pdfContainer = document.createElement("div");
  pdfContainer.appendChild(clonedInvoice);

  // Styling container PDF
  pdfContainer.style.padding = "10px";
  pdfContainer.style.fontFamily = "poppins";
  pdfContainer.style.fontSize = "12px";
  pdfContainer.style.backgroundColor = "#ffffff";
  pdfContainer.style.color = "#000000";
  // pdfContainer.style.lineHeight = "1.6";

  // Convert semua image jadi base64 (avatar/logo)
  const convertImagesToBase64 = () => {
    const imgPromises = [];
    const images = pdfContainer.querySelectorAll("img");

    images.forEach((img) => {
      if (img.src.startsWith("data:")) return; // sudah base64

      const promise = new Promise((resolve) => {
        const tempImg = new Image();
        tempImg.crossOrigin = "anonymous";
        tempImg.onload = function () {
          const canvas = document.createElement("canvas");
          canvas.width = tempImg.naturalWidth;
          canvas.height = tempImg.naturalHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(tempImg, 0, 0);
          const dataURL = canvas.toDataURL("image/png");
          img.setAttribute("src", dataURL);
          resolve();
        };
        tempImg.onerror = function () {
          console.warn("❌ Gagal load gambar:", img.src);
          resolve(); // lanjutkan walaupun gagal
        };
        tempImg.src = img.src;
      });

      imgPromises.push(promise);
    });

    return Promise.all(imgPromises);
  };

  convertImagesToBase64().then(() => {
    html2pdf()
      .set({
        margin: 10,
        filename: `Invoice_${formattedDate.replace(/\s+/g, "_")}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(pdfContainer)
      .save()
      .then(() => console.log("✅ Invoice PDF berhasil dibuat"))
      .catch((error) => console.error("❌ Error export PDF:", error));
  });
}
