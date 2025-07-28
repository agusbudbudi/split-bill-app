//EXPORT PDF INVOICE
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

  // ❌ Hapus elemen status sebelum export PDF
  const statusSection = clonedInvoice.querySelector(".invoice-action-button");
  if (statusSection) {
    statusSection.remove();
  }

  // Set semua warna teks & latar jadi netral untuk PDF
  const allElements = clonedInvoice.querySelectorAll("*");
  allElements.forEach((el) => {
    el.style.color = "#000000";
    el.style.backgroundColor = "transparent";
    el.style.boxShadow = "none";
  });

  const tableContainers = clonedInvoice.querySelectorAll(".table-container");
  tableContainers.forEach((tableContainer) => {
    tableContainer.style.width = "100%";
    tableContainer.style.borderRadius = "8px";
    tableContainer.style.border = "1px solid #F3F2F3";
  });

  // Format tabel
  const tables = clonedInvoice.querySelectorAll("table");
  tables.forEach((table) => {
    // table.style.borderCollapse = "collapse";
    table.style.width = "100%";
    table.style.borderRadius = "8px";
    table.style.border = "none";
  });

  // Format header tabel
  const ths = clonedInvoice.querySelectorAll("th");
  ths.forEach((th) => {
    th.style.backgroundColor = "#eef6fc";
    th.style.color = "#272a33";
    th.style.padding = "16px";
    th.style.border = "1px solid #eef6fc";
    th.style.textAlign = "center";
  });

  // Format isi tabel
  const tds = clonedInvoice.querySelectorAll("td");
  tds.forEach((td) => {
    // td.style.backgroundColor = "#f9f9f9";
    td.style.color = "#000000";
    td.style.padding = "5px 20px";
    td.style.textAlign = "center";
    td.style.border = "none";
  });

  const trs = clonedInvoice.querySelectorAll("tr");
  trs.forEach((tr) => {
    tr.style.border = "none";
  });

  const paymentMethodCard = clonedInvoice.querySelectorAll(
    ".selected-payment-summary"
  );
  paymentMethodCard.forEach((paymentMethodCard) => {
    paymentMethodCard.style.border = "1px solid #eef6fc";
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
    h1.style.fontSize = "22px";
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

  //styling footer
  const footer = clonedInvoice.querySelectorAll(".preview-footer");
  footer.forEach((footer) => {
    footer.style.color = "#848486";
    footer.style.marginTop = "40px";
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

  showToast("Berhasil download Invoice!", "success", 20000);
}
