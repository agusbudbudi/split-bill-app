function exportToPDF() {
  const summaryDiv = document.getElementById("summary");

  if (!summaryDiv || summaryDiv.innerHTML.trim() === "") {
    alert("No summary data available to export!");
    return;
  }

  const clonedSummary = summaryDiv.cloneNode(true);
  const pdfContainer = document.createElement("div");
  pdfContainer.appendChild(clonedSummary);

  // Force **white mode** for PDF
  pdfContainer.style.padding = "20px";
  pdfContainer.style.fontFamily = "Arial, sans-serif";
  pdfContainer.style.fontSize = "12px";
  pdfContainer.style.backgroundColor = "#ffffff"; // White background
  pdfContainer.style.color = "#000000"; // Black text (default)

  // Ensure all tables are formatted correctly
  const tables = pdfContainer.querySelectorAll("table");
  tables.forEach((table) => {
    table.style.borderCollapse = "collapse";
    table.style.width = "100%";
  });

  // Format all table headers (th)
  const ths = pdfContainer.querySelectorAll("th");
  ths.forEach((th) => {
    th.style.backgroundColor = "#141048"; // Dark gray/black header
    th.style.color = "#ffffff"; // White text
    th.style.padding = "15px";
    th.style.border = "1px solid #141048"; // White border
  });

  // Format all table data cells (td)
  const tds = pdfContainer.querySelectorAll("td");
  tds.forEach((td) => {
    td.style.backgroundColor = "#F3F2F3"; // White cell background
    td.style.color = "#000000"; // Black text
    td.style.padding = "10px";
    td.style.border = "1px solid #F3F2F3"; // White border
  });

  html2pdf()
    .set({
      margin: 10,
      filename: "Split_Bill_Summary.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(pdfContainer)
    .save()
    .then(() => console.log("PDF Export Completed!"))
    .catch((error) => console.error("Error exporting PDF: ", error));
}
