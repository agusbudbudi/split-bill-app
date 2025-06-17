window.addEventListener("DOMContentLoaded", () => {
  const selectedInvoiceNo = sessionStorage.getItem("selectedInvoiceNo");
  if (!selectedInvoiceNo) return;

  const history = JSON.parse(localStorage.getItem("invoiceHistory") || "[]");
  const invoice = history.find((inv) => inv.invoiceNo === selectedInvoiceNo);

  if (invoice) {
    renderInvoiceDetails(invoice);
  }
});

//Prefil Data
window.addEventListener("DOMContentLoaded", () => {
  const selectedInvoiceNo = sessionStorage.getItem("selectedInvoiceNo");
  if (!selectedInvoiceNo) return;

  const invoiceHistory = JSON.parse(
    localStorage.getItem("invoiceHistory") || "[]"
  );

  const invoiceData = invoiceHistory.find(
    (inv) => inv.invoiceNo === selectedInvoiceNo
  );

  if (invoiceData) {
    renderInvoiceDetails(invoiceData);
  }
});

function renderInvoiceDetails(data) {
  // Isi info dasar
  document.getElementById("preview-invoice-number").textContent =
    data.invoiceNo;
  document.getElementById("preview-invoice-date").textContent =
    data.invoiceDate;
  document.getElementById("preview-due-date").textContent = data.dueDate;
  document.getElementById("preview-subtotal").textContent = formatCurrency(
    data.subtotal || 0
  );
  document.getElementById(
    "preview-discountInfo"
  ).textContent = `- ${formatCurrency(data.discountInfo || 0)}`;
  document.getElementById("preview-total").textContent = formatCurrency(
    data.total || 0
  );

  document.getElementById("preview-total-words").textContent =
    data.totalWords || "";

  // Billed By
  if (data.billedBy) {
    document.getElementById("invoice-billed-by").innerHTML = `
        <img src="${data.billedBy.logo}" class="billed-logo-preview">
        <p><strong>${data.billedBy.name}</strong></p>
        ${data.billedBy.address ? `<p>${data.billedBy.address}</p>` : ""}
        ${data.billedBy.email ? `<p>${data.billedBy.email}</p>` : ""}
        ${data.billedBy.phone ? `<p>${data.billedBy.phone}</p>` : ""}
      `;
  }

  // Billed To
  if (data.billedTo) {
    document.getElementById("invoice-billed-to").innerHTML = `
        <img src="${data.billedTo.logo}" class="billed-logo-preview">
        <p><strong>${data.billedTo.name}</strong></p>
        ${data.billedTo.address ? `<p>${data.billedTo.address}</p>` : ""}
        ${data.billedTo.email ? `<p>${data.billedTo.email}</p>` : ""}
        ${data.billedTo.phone ? `<p>${data.billedTo.phone}</p>` : ""}
      `;
  }

  // Items
  const itemList = data.items || [];
  const tbody = document.getElementById("preview-items");
  tbody.innerHTML = "";
  itemList.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>
        <div class="item-name">${item.name}</div>
        <div class="item-desc">${item.desc || ""}</div>
        </td>
        <td>${item.qty}</td>
        <td>${formatCurrency(item.rate)}</td>
        <td>${formatCurrency(item.amount)}</td>
      `;
    tbody.appendChild(row);
  });

  // Payment Methods
  const paymentContainer = document.getElementById("selectedPaymentInfo");
  paymentContainer.innerHTML = "<h3>Metode Pembayaran</h3>";

  if (data.paymentMethods && data.paymentMethods.length > 0) {
    data.paymentMethods.forEach((method) => {
      const paymentDiv = document.createElement("div");
      paymentDiv.classList.add("selected-payment-summary");

      paymentDiv.innerHTML = `
          <img src="${method.logo}" alt="${method.name}" class="payment-logo">
          <p><strong>${method.name}</strong></p>
          <p>No HP: ${method.phone}</p>
        `;

      paymentContainer.appendChild(paymentDiv);
    });
  }

  // TnC & Footer
  document.getElementById("preview-tnc").innerHTML = data.tnc || "";
  document.getElementById("preview-footer").innerHTML = data.footer || "";
}

function formatCurrency(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(value);
}
