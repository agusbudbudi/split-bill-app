async function processImage() {
  const file = document.getElementById("bill-image").files[0];
  if (!file) {
    alert("Pilih gambar terlebih dahulu");
    return;
  }

  const {
    data: { text },
  } = await Tesseract.recognize(file, "eng", {
    logger: (m) => console.log(m),
  });

  console.log("OCR Result:", text);
  const items = parseBillText(text);
  renderParsedItems(items);
  updateCalculateButton();
}

function parseBillText(text) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l);

  const items = [];
  let currentItem = "";

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].replace(/[^\w\sRp.,0-9x]/g, "").trim(); // bersihkan noise seperti ¥, ;, dll

    // ===== CASE 1: One-line (item + price, possible quantity in middle) =====
    const oneLineMatch = line.match(/(.+?)\s+Rp[\s.]?([\d.,]+)/i);
    const isQtyLine = /\d+\s*x\s*Rp[\d.,]+.*Rp[\d.,]+/i.test(line);

    if (oneLineMatch && !isQtyLine) {
      let name = oneLineMatch[1].trim();
      let rawAmount = oneLineMatch[2];

      // Hapus angka trailing dari nama jika ada (e.g. "Melts Pizza 1" -> "Melts Pizza")
      name = name.replace(/\s+\d+$/, "").trim();

      // Pisahkan berdasarkan koma
      const commaParts = rawAmount.split(",");

      let numericAmount = "";

      if (commaParts.length === 2) {
        const integerPart = commaParts[0].replace(/\./g, "");
        const decimalPart = commaParts[1];

        if (decimalPart.length === 2) {
          // Jika 2 digit setelah koma, abaikan bagian koma
          numericAmount = integerPart;
        } else if (decimalPart.length > 2) {
          // Jika lebih dari 2 digit setelah koma, gabungkan semua bagian
          numericAmount = integerPart + decimalPart;
        } else {
          // Jika hanya 1 digit atau tidak sesuai, abaikan bagian koma
          numericAmount = integerPart;
        }
      } else {
        // Jika tidak ada koma, buang semua pemisah
        numericAmount = rawAmount.replace(/[.,]/g, "");
      }

      const cleanAmount = parseInt(numericAmount, 10);

      if (!isNaN(cleanAmount)) {
        items.push({ name, amount: cleanAmount });
      }

      currentItem = "";
    }

    // ===== CASE 2: Dua baris - item di atas, harga di bawah =====
    else if (isQtyLine && currentItem) {
      const priceMatches = [...line.matchAll(/Rp[\s.]?([\d.,]+)/g)];
      if (priceMatches.length > 0) {
        const lastPrice = priceMatches[priceMatches.length - 1][1];

        // Pisahkan berdasarkan koma
        const commaParts = lastPrice.split(",");

        let numericAmount = "";

        if (commaParts.length === 2) {
          const integerPart = commaParts[0].replace(/\./g, "");
          const decimalPart = commaParts[1];

          if (decimalPart.length === 2) {
            // Jika 2 digit setelah koma, abaikan
            numericAmount = integerPart;
          } else if (decimalPart.length > 2) {
            // Jika lebih dari 2 digit, gabungkan tanpa koma
            numericAmount = integerPart + decimalPart;
          } else {
            // Jika hanya 1 digit atau tidak valid, abaikan bagian koma
            numericAmount = integerPart;
          }
        } else {
          // Jika tidak ada koma, hapus titik dan koma
          numericAmount = lastPrice.replace(/[.,]/g, "");
        }

        const cleanAmount = parseInt(numericAmount, 10);

        if (!isNaN(cleanAmount)) {
          items.push({
            name: currentItem,
            amount: cleanAmount,
          });
        }

        currentItem = "";
      }
    }

    // ===== CASE 3: Nama item saja (asumsi baris berikutnya qty & harga) =====
    else if (!isQtyLine && !line.match(/^Rp/)) {
      currentItem = line.replace(/\s+\d+$/, "").trim(); // hapus trailing angka
    }
  }

  return items;
}

function renderParsedItems(items) {
  items.forEach((item) => {
    expenses.push({
      item: item.name,
      amount: item.amount,
      who: [], // bisa diisi manual nanti
      paidBy: "", // bisa diisi manual juga
    });
  });

  // Gantikan ini dengan pemanggilan fungsi render list card
  updateExpenseCards(); // atau nama fungsi kamu yang menampilkan list card
}

const fileInput = document.getElementById("bill-image");
const fileName = document.getElementById("fileName");
const removeBtn = document.getElementById("removeBtn");

fileInput.addEventListener("change", function () {
  if (this.files.length > 0) {
    fileName.textContent = this.files[0].name;
  }
});

removeBtn.addEventListener("click", function () {
  fileInput.value = "";
  fileName.textContent = "No selected File";
});

// Truncate Nama File uploaded
function truncateFileName(fileName, maxLength = 10) {
  if (fileName.length <= maxLength) return fileName;

  const dotIndex = fileName.lastIndexOf(".");
  const ext = dotIndex !== -1 ? fileName.slice(dotIndex) : "";
  const nameOnly = dotIndex !== -1 ? fileName.slice(0, dotIndex) : fileName;

  const truncatedName = nameOnly.slice(0, maxLength - ext.length - 3);
  return truncatedName + "..." + ext;
}

document.getElementById("bill-image").addEventListener("change", function (e) {
  const file = e.target.files[0];
  const fileInfo = document.getElementById("fileInfo");
  const fileNameSpan = document.getElementById("fileName");

  if (file) {
    fileInfo.style.display = "flex";
    fileNameSpan.textContent = truncateFileName(file.name);
  }
});

document.getElementById("removeBtn").addEventListener("click", function () {
  const input = document.getElementById("bill-image");
  input.value = ""; // Clear input
  document.getElementById("fileInfo").style.display = "none";
});
