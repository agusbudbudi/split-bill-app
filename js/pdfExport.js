function exportToPDF() {
  const summaryDiv = document.getElementById("summary");

  if (!summaryDiv || summaryDiv.innerHTML.trim() === "") {
    alert("No summary data available to export!");
    return;
  }

  // Ambil nama acara dari input
  const activityNameInput = document.getElementById("activityName");
  const activityName =
    activityNameInput && typeof activityNameInput.value === "string"
      ? activityNameInput.value.trim()
      : "Split Bill Report";

  // Ambil tanggal saat ini
  const today = new Date();
  const formattedDate = today.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Clone summary untuk PDF
  const clonedSummary = summaryDiv.cloneNode(true);

  // Ganti semua warna teks dalam clonedSummary menjadi hitam
  const allElements = clonedSummary.querySelectorAll("*");
  allElements.forEach((el) => {
    el.style.color = "#000000";
    el.style.backgroundColor = "transparent"; // untuk amankan background gelap
  });

  // Perbaiki warna khusus setelah reset warna umum
  allElements.forEach((el) => {
    if (el.textContent.includes("✅")) {
      el.style.color = "#2e7d32";
      el.style.fontWeight = "600";
    } else if (
      el.textContent.includes("❌") ||
      el.textContent.includes("tidak seimbang")
    ) {
      el.style.color = "#c62828";
      el.style.fontWeight = "600";
    }
  });

  const pdfContainer = document.createElement("div");

  // Tambahkan header nama acara dan tanggal
  const header = document.createElement("div");
  header.innerHTML = `
  <h1 style="margin-bottom: 5px; color: #000000;">${activityName}</h1>
  <p style="margin-top: 0; font-size: 12px; color: #555;">Tanggal: ${formattedDate}</p>
  <hr style="margin: 10px 0; border: none; border-top: 1px solid #ccc;">
`;

  pdfContainer.appendChild(header);
  pdfContainer.appendChild(clonedSummary);

  // Styling global PDF
  pdfContainer.style.padding = "30px";
  pdfContainer.style.fontFamily = "Arial, sans-serif";
  pdfContainer.style.fontSize = "13px";
  pdfContainer.style.backgroundColor = "#ffffff";
  pdfContainer.style.color = "#000000";
  pdfContainer.style.lineHeight = "1.6";

  const headings = pdfContainer.querySelectorAll("h2, h3");

  headings.forEach((h) => {
    h.style.color = "#2b2a6c";
    h.style.marginTop = "24px";
    h.style.marginBottom = "12px";
    h.style.paddingBottom = "4px";
  });

  // Paragraph styling

  const paragraphs = pdfContainer.querySelectorAll("p");

  paragraphs.forEach((p) => {
    p.style.margin = "8px 0";
  });

  // Highlight ✅ dan ❌
  paragraphs.forEach((p) => {
    if (p.textContent.includes("✅")) {
      p.style.color = "#2e7d32"; // green

      p.style.fontWeight = "600";
    } else if (
      p.textContent.includes("❌") ||
      p.textContent.includes("tidak seimbang")
    ) {
      p.style.color = "#c62828"; // red

      p.style.fontWeight = "600";
    }
  });

  // Format tabel
  const tables = pdfContainer.querySelectorAll("table");
  tables.forEach((table) => {
    table.style.borderCollapse = "collapse";
    table.style.width = "100%";
    table.style.borderRadius = "10px";
  });

  // Format header tabel
  const ths = pdfContainer.querySelectorAll("th");
  ths.forEach((th) => {
    th.style.backgroundColor = "#7056ec";
    th.style.color = "#ffffff";
    th.style.padding = "8px";
    th.style.border = "1px solid #7056ec";
    th.style.textAlign = "center";
  });

  // Format isi tabel
  const tds = pdfContainer.querySelectorAll("td");
  tds.forEach((td) => {
    td.style.backgroundColor = "#f9f9f9";
    td.style.color = "#000000";
    td.style.padding = "5px";
    td.style.border = "1px solid #F3F2F3";
    td.style.textAlign = "center";
  });

  // Signature / Footer

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

  // Export ke PDF
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
}

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
