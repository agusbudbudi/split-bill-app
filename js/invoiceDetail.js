// Invoice Detail Script - Final Fixed Version
// Menggunakan IIFE untuk menghindari konflik global

(function () {
  ("use strict");

  // Private variables
  let invoiceQuill;
  let currentInvoice;

  // Cek apakah ini halaman invoice detail
  if (!document.querySelector("#invoice-detail-container")) {
    console.log("Not invoice detail page, skipping initialization");
    return;
  }

  // Initialize when DOM is ready
  document.addEventListener("DOMContentLoaded", function () {
    console.log("Invoice Detail: DOM Content Loaded");
    initializeInvoiceDetail();
  });

  function initializeInvoiceDetail() {
    try {
      const selectedInvoiceNo = sessionStorage.getItem("selectedInvoiceNo");
      if (!selectedInvoiceNo) {
        alert("Invoice tidak ditemukan");
        return;
      }

      const invoiceHistory = JSON.parse(
        localStorage.getItem("invoiceHistory") || "[]"
      );
      const invoiceData = invoiceHistory.find(
        (inv) => inv.invoiceNo === selectedInvoiceNo
      );

      if (!invoiceData) {
        alert("Invoice tidak ditemukan dalam history");
        return;
      }

      console.log("Found invoice data:", invoiceData);

      // Simpan ke localStorage untuk akses global
      currentInvoice = invoiceData;
      localStorage.setItem("currentInvoice", JSON.stringify(invoiceData));

      // Render invoice details
      renderInvoiceDetails(invoiceData);

      // Initialize Quill after rendering
      setTimeout(() => {
        initializeQuill(invoiceData);
      }, 300);
    } catch (error) {
      console.error("Error initializing invoice detail:", error);
    }
  }

  function initializeQuill(invoiceData) {
    const tncField = document.getElementById("tncField");

    if (!tncField) {
      console.warn("TnC field not found, skipping Quill initialization");
      return;
    }

    if (typeof Quill === "undefined") {
      console.error("Quill library is not loaded");
      return;
    }

    try {
      // Destroy existing instance if any
      if (invoiceQuill) {
        invoiceQuill = null;
      }

      // Clear the container
      tncField.innerHTML = "";

      invoiceQuill = new Quill("#tncField", {
        theme: "snow",
        placeholder: "Add Terms and Conditions",
        modules: {
          toolbar: [
            ["bold", "italic", "underline"],
            ["link", "blockquote"],
            [{ list: "ordered" }, { list: "bullet" }],
          ],
        },
      });

      // Prefill TnC if exists
      if (invoiceData.tnc) {
        invoiceQuill.root.innerHTML = invoiceData.tnc;
      }

      console.log("Quill initialized successfully");

      // Expose to global scope for other functions
      window.invoiceQuill = invoiceQuill;
    } catch (error) {
      console.error("Error initializing Quill:", error);
    }
  }

  function renderInvoiceDetails(data) {
    console.log("Rendering invoice details:", data);

    try {
      // Helper functions for safe DOM manipulation
      const safeSetText = (id, value) => {
        const element = document.getElementById(id);
        if (element) {
          element.textContent = value || "";
        } else {
          console.warn(`Element with ID '${id}' not found`);
        }
      };

      const safeSetHTML = (id, value) => {
        const element = document.getElementById(id);
        if (element) {
          element.innerHTML = value || "";
        } else {
          console.warn(`Element with ID '${id}' not found`);
        }
      };

      // Set basic invoice information
      safeSetText("preview-invoice-number", data.invoiceNo);
      safeSetText("preview-invoice-status", data.status);
      safeSetText("preview-invoice-date", data.invoiceDate);
      safeSetText("preview-due-date", data.dueDate);
      safeSetText("preview-subtotal", formatToIDR(data.subtotal || 0));
      safeSetText(
        "preview-discountInfo",
        `- ${formatToIDR(data.discountInfo || 0)}`
      );
      safeSetText("preview-total", formatToIDR(data.total || 0));
      safeSetText("preview-total-words", data.totalWords);

      // Handle invoice status display and styling
      const statusSection = document.getElementById("invoice-status-section");
      const statusElement = document.getElementById("preview-invoice-status");

      if (statusElement && statusSection) {
        if (data.status) {
          statusSection.style.display = "block";

          // Reset class di elemen status
          statusElement.classList.remove("paid", "unpaid", "overdue");

          const statusClass = data.status.toLowerCase();
          let icon = "";
          let label = data.status;

          // Tentukan ikon dan label berdasarkan status
          switch (statusClass) {
            case "paid":
              icon = `<i class="uil uil-check-circle"></i>`;
              label = "Lunas";
              break;
            case "unpaid":
              icon = `<i class="uil uil-clock"></i>`;
              label = "Belum Dibayar";
              break;

            case "overdue":
              icon = `<i class="uil uil-exclamation-triangle"></i>`;
              label = "Jatuh Tempo";
              break;
          }

          // Render status icon + label
          statusElement.innerHTML = `${icon} <span>${label}</span>`;
          statusElement.classList.add(statusClass);

          // Handle Mark Paid button visibility
          const markPaidBtn = document.getElementById("mark-paid-button");
          if (markPaidBtn) {
            if (statusClass === "unpaid") {
              markPaidBtn.style.display = "inline-block";
              markPaidBtn.onclick = (event) =>
                markInvoiceAsPaid(data.invoiceNo, event);
            } else {
              markPaidBtn.style.display = "none";
            }
          }
        } else {
          statusSection.style.display = "none";
        }
      }

      // Render billed sections
      renderBilledSection(data);

      // Render items table
      renderItems(data.items || []);

      // Render payment methods
      renderPaymentMethods(data.paymentMethods || []);

      // Render TnC and footer
      safeSetHTML("preview-tnc", data.tnc);
      safeSetHTML("preview-footer", data.footer);

      console.log("Invoice details rendered successfully");
    } catch (error) {
      console.error("Error rendering invoice details:", error);
    }
  }

  function renderBilledSection(data) {
    const renderBilledInfo = (elementId, billedData) => {
      const element = document.getElementById(elementId);
      if (!element || !billedData) return;

      element.innerHTML = `
        ${
          billedData.logo
            ? `<img src="${billedData.logo}" class="billed-logo-preview" alt="Logo" onerror="this.style.display='none'">`
            : ""
        }
        <p><strong>${billedData.name || ""}</strong></p>
        ${billedData.address ? `<p>${billedData.address}</p>` : ""}
        ${billedData.email ? `<p>${billedData.email}</p>` : ""}
        ${billedData.phone ? `<p>${billedData.phone}</p>` : ""}
      `;
    };

    renderBilledInfo("invoice-billed-by", data.billedBy);
    renderBilledInfo("invoice-billed-to", data.billedTo);
  }

  function renderItems(itemList) {
    const tbody = document.getElementById("preview-items");
    if (!tbody) {
      console.warn("Preview items table body not found");
      return;
    }

    tbody.innerHTML = "";

    if (!Array.isArray(itemList) || itemList.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4">No items found</td></tr>';
      return;
    }

    itemList.forEach((item, index) => {
      try {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>
            <div class="item-name">${item.name || `Item ${index + 1}`}</div>
            <div class="item-desc">${item.desc || ""}</div>
          </td>
          <td>${item.qty || 0}</td>
          <td>${formatToIDR(item.rate || 0)}</td>
          <td>${formatToIDR(item.amount || 0)}</td>
        `;
        tbody.appendChild(row);
      } catch (error) {
        console.error("Error rendering item:", item, error);
      }
    });
  }

  function renderPaymentMethods(paymentMethods) {
    const paymentContainer = document.getElementById("selectedPaymentInfo");
    if (!paymentContainer) {
      console.warn("Payment container not found");
      return;
    }

    paymentContainer.innerHTML = "<h3>Metode Pembayaran</h3>";

    if (!Array.isArray(paymentMethods) || paymentMethods.length === 0) {
      paymentContainer.innerHTML += "<p>Tidak ada metode pembayaran</p>";
      return;
    }

    paymentMethods.forEach((method) => {
      try {
        const paymentDiv = document.createElement("div");
        paymentDiv.classList.add("selected-payment-summary");

        let detailHTML = "";
        if (method.phone) {
          detailHTML = `<p>No HP: ${method.phone}</p>`;
        } else if (method.accountNumber || method.bankName) {
          detailHTML = `
            <p>
              ${method.accountNumber ? `Rek: ${method.accountNumber}<br>` : ""}
              ${method.bankName ? `Bank: ${method.bankName}` : ""}
            </p>
          `;
        }

        paymentDiv.innerHTML = `
          ${
            method.logo
              ? `<img src="${method.logo}" alt="${method.name}" class="payment-logo" onerror="this.style.display='none'">`
              : ""
          }
          <p><strong>${method.name || "Payment Method"}</strong></p>
          ${detailHTML}
        `;

        paymentContainer.appendChild(paymentDiv);
      } catch (error) {
        console.error("Error rendering payment method:", method, error);
      }
    });
  }

  // function formatCurrency(value) {
  //   try {
  //     const numValue = parseFloat(value) || 0;
  //     return new Intl.NumberFormat("id-ID", {
  //       style: "currency",
  //       currency: "IDR",
  //     }).format(numValue);
  //   } catch (error) {
  //     console.error("Error formatting currency:", value, error);
  //     return "Rp 0";
  //   }
  // }

  // Global functions untuk diakses dari HTML
  window.submitEditSection = function (
    invoiceNo,
    sectionKey,
    inputId,
    directValue = null
  ) {
    try {
      let newValue = directValue;

      if (!directValue && inputId) {
        const inputEl = document.getElementById(inputId);
        if (!inputEl) {
          console.error("Input element not found:", inputId);
          return;
        }
        newValue = inputEl.value;
      }

      editInvoice(invoiceNo, sectionKey, newValue);
    } catch (error) {
      console.error("Error in submitEditSection:", error);
    }
  };

  function editInvoice(invoiceNo, sectionKey, newData) {
    try {
      const invoiceHistory =
        JSON.parse(localStorage.getItem("invoiceHistory")) || [];

      const index = invoiceHistory.findIndex(
        (inv) => inv.invoiceNo === invoiceNo
      );
      if (index === -1) {
        console.error("Invoice not found:", invoiceNo);
        return;
      }

      invoiceHistory[index][sectionKey] = newData;
      localStorage.setItem("invoiceHistory", JSON.stringify(invoiceHistory));

      const updatedInvoice = invoiceHistory[index];
      localStorage.setItem("currentInvoice", JSON.stringify(updatedInvoice));

      // Re-render invoice details
      renderInvoiceDetails(updatedInvoice);

      console.log(`Updated ${sectionKey}:`, newData);
    } catch (error) {
      console.error("Error editing invoice:", error);
    }
  }

  window.submitInvoiceFooter = function () {
    try {
      const currentInvoice = JSON.parse(localStorage.getItem("currentInvoice"));
      if (!currentInvoice) {
        console.error("Current invoice not found");
        return;
      }

      // Update footer
      window.submitEditSection(
        currentInvoice.invoiceNo,
        "footer",
        "editFooterInput"
      );

      // Update TnC from Quill
      if (window.invoiceQuill) {
        const tncHTML = window.invoiceQuill.root.innerHTML;
        window.submitEditSection(
          currentInvoice.invoiceNo,
          "tnc",
          null,
          tncHTML
        );
      }

      // Close bottom sheet
      if (typeof closeBottomSheet === "function") {
        closeBottomSheet("editInvoiceFooterBottomSheet");
      }
    } catch (error) {
      console.error("Error submitting invoice footer:", error);
    }
  };

  // Define bottom sheet functions
  // function openBottomSheetEditInvoice(sheetId) {
  //   console.log("Opening bottom sheet:", sheetId);
  //   const sheet = document.getElementById(sheetId);
  //   const overlay = document.getElementById("overlay");

  //   if (sheet) {
  //     sheet.classList.remove("hidden");
  //     if (overlay) overlay.classList.remove("hidden");

  //     // Jika ini adalah TnC editor, inisialisasi Quill
  //     if (sheetId === "editInvoiceFooterBottomSheet") {
  //       // Delay untuk memastikan DOM ready
  //       setTimeout(() => {
  //         if (window.invoiceQuill && document.getElementById("tncField")) {
  //           console.log("Quill already initialized");
  //         }
  //       }, 100);
  //     }
  //   }
  // }

  // function closeBottomSheet(sheetId) {
  //   console.log("Closing bottom sheet:", sheetId);
  //   const sheet = document.getElementById(sheetId);
  //   const overlay = document.getElementById("overlay");

  //   if (sheet) {
  //     sheet.classList.add("hidden");
  //     if (overlay) overlay.classList.add("hidden");
  //   }
  // }

  // Expose utility functions
  window.invoiceDetailModule = {
    renderInvoiceDetails: renderInvoiceDetails,
    formatToIDR: formatToIDR,
    initializeQuill: initializeQuill,
  };
})();
