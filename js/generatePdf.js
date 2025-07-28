// ===== MAIN PDF EXPORT FUNCTION =====

/**
 * Export a given HTML element as a PDF file.
 *
 * @param {Object} config - Configuration options.
 * @param {string} config.elementId - The ID of the HTML element to export.
 * @param {string} [config.title="Report"] - The title to display in the PDF.
 * @param {string} [config.filename] - A custom filename for the PDF.
 * @param {boolean} [config.showSuccessToast=true] - Whether to show a success toast.
 * @param {string} [config.toastMessage="Berhasil download!"] - The message to display in the toast.
 * @param {Object} [config.customStyles={}] - Additional CSS styles to apply to the element.
 * @param {Object} [config.containerOptions={}] - Additional options to pass to the PDF container element.
 */
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

/**
 * Create a container element for PDF export.
 *
 * @param {string} [title="Report"] - Title of the report
 * @param {object} [options={}] - Options to customize the container
 * @param {boolean} [options.hideHeader=false] - Hide the header section
 * @param {boolean} [options.hideTitle=false] - Hide the title in the header
 * @param {boolean} [options.hideLogo=false] - Hide the logo in the header
 * @returns {HTMLElement} - The container element
 */
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

/**
 * Clone the given element and prepare it for PDF conversion.
 * Hides elements with class "exclude-pdf", converts images to base64,
 * converts canvases to images, applies base styles, and formats elements
 * based on content type.
 * @param {HTMLElement} originalElement - The element to clone and prepare.
 * @param {Object} customStyles - Optional custom styles to apply to the clone.
 * @returns {HTMLElement} The prepared clone.
 */
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

/**
 * Hides elements with the class "exclude-pdf" within the given clone.
 *
 * This utility function iterates over all elements with the "exclude-pdf"
 * class within the provided clone and sets their display style to "none".
 * It is typically used to prevent specific elements from being included
 * in the PDF generation process.
 *
 * @param {HTMLElement} clone - The cloned element containing elements to hide.
 */

function hideExcludedElements(clone) {
  clone
    .querySelectorAll(".exclude-pdf")
    .forEach((el) => (el.style.display = "none"));
}

/**
 * Converts all images with class "summary-avatar" or attribute
 * "data-convert-base64" within the given container to base64.
 * This is necessary because jsPDF cannot directly use external images.
 * @param {HTMLElement} container - The container element containing the images.
 * @returns {Promise} A promise that resolves when all images have been converted.
 */
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

/**
 * Replaces all canvas elements in the given clone with img elements.
 * The replacement img elements are created by calling toDataURL() on the
 * corresponding canvas element from the original element. The img elements
 * are then styled with a maximum width of 40%, margin of 10px auto, and
 * display of block. This function is used to allow jsPDF to generate a PDF
 * containing images created by the canvas element.
 * @param {HTMLElement} originalElement - The element containing the original
 * canvas elements.
 * @param {HTMLElement} clone - The element containing the canvas elements to
 * be replaced.
 */
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

/**
 * Applies base CSS styles to all elements in the given clone.
 * Specifically, the styles applied are:
 *   - color: The value of customStyles.textColor, or "#000000" if it is not
 *     provided.
 *   - background-color: transparent.
 *   - box-shadow: none.
 * @param {HTMLElement} clone - The element to apply the styles to.
 * @param {Object} customStyles - An object containing custom styles to apply.
 *   Currently the only supported style is textColor.
 */
function applyBaseStyles(clone, customStyles) {
  const allElements = clone.querySelectorAll("*");
  allElements.forEach((el) => {
    el.style.color = customStyles.textColor || "#000000";
    el.style.backgroundColor = "transparent";
    el.style.boxShadow = "none";
  });
}

/**
 * Formats elements in the given clone according to the default PDF formatting.
 * The specific formatting applied is as follows:
 *   - Tables are formatted with a border of 1px solid black.
 *   - Cards are formatted with a border radius of 12px.
 *   - Split Bill specific elements are formatted according to the split bill
 *     PDF formatting.
 *   - Collect Money specific elements are formatted according to the collect
 *     money PDF formatting.
 *   - Custom styles are applied if provided.
 * @param {HTMLElement} clone - The element containing the elements to be
 *   formatted.
 * @param {Object} customStyles - An object containing custom styles to apply.
 *   Currently the only supported style is customFormatter.
 */
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

/**
 * Formats elements in the given clone according to the Split Bill PDF
 * formatting. The specific formatting applied is as follows:
 *   - Status indicators are formatted with different colors, font weights, and
 *     font sizes.
 *   - Separators are formatted with a border color of #f7f7f7.
 *   - Activity name is formatted with a font size of 20px.
 *   - User transfers are formatted with a border radius of 10px and a
 *     background color of #eef6fc.
 *   - Breakdown rows are formatted with a color of #848486 and a font weight
 *     of 100.
 *   - Discount labels are formatted with a color of #cc0000, a padding of 1px
 *     4px, a border radius of 5px, and a background color of #ffe0e0.
 *   - User details and expenses are formatted with a color of #848486 and a
 *     font weight of 100.
 *   - Avatars are formatted with a width and height of 40px, a border radius of
 *     40%, and an object-fit of cover.
 * @param {HTMLElement} container - The element containing the elements to be
 *   formatted.
 */
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

/**
 * Format HTML elements specific to the collect money summary PDF.
 * @param {HTMLElement} container - The container element containing the
 * elements to be formatted.
 */
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

/**
 * Format tables in the given container.
 * @param {HTMLElement} container - The container element containing the
 * tables to be formatted.
 */
function formatTables(container) {
  container.querySelectorAll("table").forEach((table) => {
    table.style.borderCollapse = "collapse";
    table.style.width = "100%";
    table.style.borderRadius = "8px";
  });

  container.querySelectorAll("th").forEach((th) => {
    th.style.backgroundColor = "#eef6fc";
    th.style.color = "#272a33";
    th.style.padding = "8px";
    th.style.border = "1px solid #eef6fc";
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

/**
 * Creates a footer element for the PDF with the given text.
 * @returns {HTMLElement} The created footer element.
 */
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

/**
 * Generates a PDF from the given container element and saves it as a file with the given filename.
 * @param {HTMLElement} container The HTML element to generate the PDF from.
 * @param {string} filename The name of the PDF file to save.
 * @returns {Promise<void>} A promise that resolves when the PDF is saved.
 */
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

/**
 * Exports the split bill summary as a PDF file. If an activity name is provided
 * in the "activityName" input field, it will be used as the title and filename
 * of the PDF; otherwise, a default name is used. The PDF is generated from the
 * element with the ID "summary", and a toast message is shown upon successful
 * download.
 */

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

/**
 * Exports the collect money summary as a PDF file. The PDF is generated from
 * the element with the ID "collectSectionToExport", and a toast message is
 * shown upon successful download.
 */
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
