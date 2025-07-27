// ===== MAIN PDF EXPORT FUNCTION =====
function exportToPDF(config) {
  const {
    elementId,
    title = "Report",
    filename,
    showSuccessToast = true,
    toastMessage = "Berhasil download!",
    customStyles = {},
    containerOptions = {},
  } = config;

  const element = document.getElementById(elementId);
  if (!element || element.innerHTML.trim() === "") {
    alert("Tidak ada data untuk diexport.");
    return;
  }

  const pdfContainer = createPDFContainer(title, containerOptions);
  const clonedElement = prepareClonedElement(element, customStyles);
  pdfContainer.appendChild(clonedElement);

  const footer = createPDFFooter();
  pdfContainer.appendChild(footer);

  const finalFilename =
    filename ||
    `${title.replace(/\s+/g, "_")}_${new Date().toLocaleDateString(
      "id-ID"
    )}.pdf`;

  generatePDF(pdfContainer, finalFilename)
    .then(() => {
      if (showSuccessToast) {
        showToast(toastMessage, "success", 20000);
      }
    })
    .catch((error) => {
      console.error("❌ Error export PDF:", error);
      showToast("Gagal export PDF!", "error", 5000);
    });
}

// ===== PDF CONTAINER CREATOR =====
function createPDFContainer(title = "Report", options = {}) {
  const container = document.createElement("div");
  container.style.padding = "50px";
  container.style.fontFamily = "Poppins, Arial, sans-serif";
  container.style.fontSize = "13px";
  container.style.backgroundColor = "#ffffff";
  container.style.color = "#000000";
  container.style.lineHeight = "1.6";

  // Jika hideHeader true, tidak tampilkan header sama sekali
  if (options.hideHeader) {
    return container;
  }

  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.justifyContent = "space-between";
  header.style.alignItems = "center";
  header.style.marginBottom = "10px";

  // Hanya tampilkan title jika hideTitle = false
  if (!options.hideTitle) {
    const titleElement = document.createElement("h1");
    titleElement.textContent = title;
    titleElement.style.margin = "0";
    titleElement.style.fontSize = "20px";
    titleElement.style.color = "#000000";
    header.appendChild(titleElement);
  }

  // Hanya tampilkan logo jika hideLogo = false
  if (!options.hideLogo) {
    const logo = document.createElement("img");
    logo.src = "img/logoSummary.png";
    logo.alt = "Split Bill Logo";
    logo.style.height = "50px";
    logo.style.objectFit = "contain";
    header.appendChild(logo);
  }

  container.appendChild(header);

  return container;
}

// ===== ELEMENT PREPARATION =====
function prepareClonedElement(originalElement, customStyles = {}) {
  const clone = originalElement.cloneNode(true);

  // Hide elements with exclude-pdf class
  hideExcludedElements(clone);

  // Convert images to base64 if needed
  convertImagesToBase64(clone);

  // Convert canvas to images
  convertCanvasesToImages(originalElement, clone);

  // Apply base styles
  applyBaseStyles(clone, customStyles);

  // Apply specific formatting based on content type
  formatElementsInClone(clone, customStyles);

  return clone;
}

// ===== UTILITY FUNCTIONS =====
function hideExcludedElements(clone) {
  clone
    .querySelectorAll(".exclude-pdf")
    .forEach((el) => (el.style.display = "none"));
}

function convertImagesToBase64(container) {
  const images = container.querySelectorAll(
    "img.summary-avatar, img[data-convert-base64]"
  );
  const promises = [];

  images.forEach((img) => {
    if (img.src.startsWith("data:")) return;

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
        console.warn("❌ Gagal load gambar untuk base64:", img.src);
        resolve();
      };
      tempImg.src = img.src;
    });

    promises.push(promise);
  });

  return Promise.all(promises);
}

function convertCanvasesToImages(originalElement, clone) {
  const originalCanvases = originalElement.querySelectorAll("canvas");
  const clonedCanvases = clone.querySelectorAll("canvas");

  clonedCanvases.forEach((canvas, i) => {
    if (originalCanvases[i]) {
      const img = document.createElement("img");
      try {
        img.src = originalCanvases[i].toDataURL("image/png");
        img.style.maxWidth = "40%";
        img.style.margin = "10px auto";
        img.style.display = "block";
        canvas.replaceWith(img);
      } catch (err) {
        console.warn("❌ Gagal convert canvas:", err);
      }
    }
  });
}

function applyBaseStyles(clone, customStyles) {
  const allElements = clone.querySelectorAll("*");
  allElements.forEach((el) => {
    el.style.color = customStyles.textColor || "#000000";
    el.style.backgroundColor = "transparent";
    el.style.boxShadow = "none";
  });
}

function formatElementsInClone(clone, customStyles) {
  // Format tables
  formatTables(clone);

  // Format cards
  formatCards(clone);

  // Format Split Bill specific elements
  formatSplitBillElements(clone);

  // Format Collect Money specific elements
  formatCollectMoneyElements(clone);

  // Apply custom styles if provided
  if (customStyles.customFormatter) {
    customStyles.customFormatter(clone);
  }
}

// ===== SPLIT BILL SPECIFIC FORMATTING =====
function formatSplitBillElements(container) {
  // Format status indicators
  container.querySelectorAll("*").forEach((el) => {
    if (el.textContent.includes("✅")) {
      el.style.color = "#2e7d32";
      el.style.fontWeight = "600";
      el.style.fontSize = "13px";
    } else if (
      el.textContent.includes("❌") ||
      el.textContent.includes("tidak seimbang")
    ) {
      el.style.color = "#c62828";
      el.style.fontWeight = "600";
      el.style.fontSize = "13px";
    } else if (el.textContent.includes("Hutang")) {
      el.style.color = "#272a33";
      el.style.fontWeight = "600";
      el.style.fontSize = "13px";
    }
  });

  // Format separators
  container
    .querySelectorAll(".summary-header, .summary-validation, .separator")
    .forEach((el) => (el.style.borderColor = "#f7f7f7"));

  // Format activity name
  container
    .querySelectorAll(".activity-name")
    .forEach((el) => (el.style.fontSize = "20px"));

  // Format user transfers
  container.querySelectorAll(".user-transfers").forEach((el) => {
    el.style.borderRadius = "10px";
    el.style.backgroundColor = "#eef6fc";
  });

  // Format breakdown rows
  container.querySelectorAll(".breakdown-row").forEach((el) => {
    el.style.color = "#848486";
    el.style.fontWeight = "100";
  });

  // Format discount labels
  container.querySelectorAll(".discount-label").forEach((el) => {
    el.style.color = "#cc0000";
    el.style.padding = "1px 4px";
    el.style.borderRadius = "5px";
    el.style.backgroundColor = "#ffe0e0";
  });

  // Format user details and expenses
  container
    .querySelectorAll(".user-details p, .user-expense p")
    .forEach((el) => {
      el.style.color = "#848486";
      el.style.fontWeight = "100";
    });

  // Format avatars
  container.querySelectorAll(".summary-avatar").forEach((el) => {
    el.style.width = "40px";
    el.style.height = "40px";
    el.style.borderRadius = "40%";
    el.style.objectFit = "cover";
  });
}

// ===== COLLECT MONEY SPECIFIC FORMATTING =====
function formatCollectMoneyElements(container) {
  // Format total collect money
  const summary = container.querySelector("#collectSummary");
  if (summary) {
    const totalHeader = summary.querySelector("h3");
    if (totalHeader) {
      totalHeader.style.backgroundColor = "#e0f7e9";
      totalHeader.style.color = "#272a33";
      totalHeader.style.padding = "10px 16px";
      totalHeader.style.textAlign = "left";
      totalHeader.style.borderRadius = "8px";
      totalHeader.style.marginBottom = "10px";
    }
  }

  // Format payment method cards
  container
    .querySelectorAll(".method-card")
    .forEach((el) => (el.style.border = "1px solid #eef6fc"));
}

// ===== COMMON FORMATTING =====
function formatTables(container) {
  container.querySelectorAll("table").forEach((table) => {
    table.style.borderCollapse = "collapse";
    table.style.width = "100%";
    table.style.borderRadius = "10px";
  });

  container.querySelectorAll("th").forEach((th) => {
    th.style.backgroundColor = "#7056ec";
    th.style.color = "#ffffff";
    th.style.padding = "8px";
    th.style.border = "1px solid #7056ec";
    th.style.textAlign = "center";
  });

  container.querySelectorAll("td").forEach((td) => {
    td.style.backgroundColor = "#ffffff";
    td.style.color = "#272a33";
    td.style.padding = "5px";
    td.style.textAlign = "center";
  });

  container
    .querySelectorAll(".table-container")
    .forEach((el) => (el.style.border = "1px solid #e9ecef"));
}

function formatCards(container) {
  container.querySelectorAll(".card-container").forEach((el) => {
    el.style.border = "1px solid #ffffff";
    el.style.boxShadow = "none";
  });
}

function createPDFFooter() {
  const footer = document.createElement("div");
  footer.textContent =
    "💡 Dibuat dengan Split Bill App developed by Agus Budiman";
  footer.style.marginTop = "30px";
  footer.style.textAlign = "center";
  footer.style.fontSize = "11px";
  footer.style.color = "#888";
  footer.style.width = "100%";
  footer.style.lineHeight = "1.4";
  return footer;
}

async function generatePDF(container, filename) {
  // Wait for images to load
  await convertImagesToBase64(container);

  return html2pdf()
    .set({
      margin: 10,
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 1.5 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(container)
    .save();
}

// ===== WRAPPER FUNCTIONS FOR SPECIFIC FEATURES =====
function exportSplitBillToPDF() {
  const activityNameInput = document.getElementById("activityName");
  const activityName =
    activityNameInput && typeof activityNameInput.value === "string"
      ? activityNameInput.value.trim()
      : "Split Bill Report";

  exportToPDF({
    elementId: "summary",
    title: activityName,
    filename: `${activityName.replace(/\s+/g, "_")}_Summary.pdf`,
    toastMessage: "Berhasil download Split Bill!",
    containerOptions: {
      hideHeader: true, // Tidak tampilkan header sama sekali untuk Split Bill
    },
  });
}

function exportCollectMoneyToPDF() {
  exportToPDF({
    elementId: "collectSectionToExport",
    title: "Ringkasan Collect Money",
    filename: `ringkasan-collect-money-${new Date().toLocaleDateString(
      "id-ID"
    )}.pdf`,
    toastMessage: "Berhasil download Collect Money!",
    containerOptions: {
      hideHeader: false, // Tampilkan header
      hideTitle: false, // Tampilkan title
      hideLogo: false, // Tampilkan logo
    },
  });
}
