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
}

// function parseBillText(text) {
//   const lines = text
//     .split("\n")
//     .map((l) => l.trim())
//     .filter((l) => l);
//   const items = [];

//   let currentItem = null;

//   for (let i = 0; i < lines.length; i++) {
//     const line = lines[i];

//     // Jika baris mengandung "Rp", anggap ini baris detail harga
//     if (line.includes("Rp")) {
//       const rupiahMatches = [...line.matchAll(/Rp[\s.]?([\d.,]+)/g)];
//       if (currentItem && rupiahMatches.length > 0) {
//         // Ambil angka terakhir di baris (kolom paling kanan)
//         const lastMatch = rupiahMatches[rupiahMatches.length - 1][1];
//         const cleanAmount = parseFloat(
//           lastMatch.replace(/\./g, "").replace(",", ".")
//         );
//         items.push({ name: currentItem, amount: cleanAmount });
//         currentItem = null; // reset
//       }
//     } else if (line && !line.match(/^\d+\s*x/i)) {
//       // Ini baris item name, simpan sementara
//       currentItem = line;
//     }
//   }

//   return items;
// }

// function parseBillText(text) {
//   const lines = text
//     .split("\n")
//     .map((l) => l.trim())
//     .filter((l) => l);

//   const items = [];
//   let currentItem = "";

//   lines.forEach((line, i) => {
//     const priceMatch = line.match(/Rp[\s.]?([\d.,]+)/g);
//     const quantityMatch = line.match(/(\d+)\s*x/gi); // cari format "1 x" atau "2x"

//     // Deteksi baris item + harga dalam satu baris
//     if (priceMatch && !line.startsWith("Rp")) {
//       const namePart = line.split("Rp")[0].trim();
//       const pricePart = priceMatch[priceMatch.length - 1];
//       const cleanPrice = parseFloat(
//         pricePart.replace(/[^\d,]/g, "").replace(",", ".")
//       );

//       items.push({
//         name: namePart,
//         amount: cleanPrice,
//       });
//       currentItem = "";
//     } else if (!priceMatch && !quantityMatch) {
//       // Simpan item name sementara
//       currentItem = line;
//     } else if (priceMatch && currentItem) {
//       // Deteksi harga di baris terpisah setelah item
//       const cleanPrice = parseFloat(
//         priceMatch[priceMatch.length - 1]
//           .replace(/[^\d,]/g, "")
//           .replace(",", ".")
//       );
//       items.push({
//         name: currentItem,
//         amount: cleanPrice,
//       });
//       currentItem = "";
//     }
//   });

//   return items;
// }

// NEW BERFUNGSI DIBAWAH

// function parseBillText(text) {
//   const lines = text
//     .split("\n")
//     .map((l) => l.trim())
//     .filter((l) => l);

//   const items = [];
//   let currentItem = "";

//   for (let i = 0; i < lines.length; i++) {
//     const line = lines[i];

//     // ===== CASE 1: One-line: "Jagung Rebus Rp34.000,00" =====
//     const oneLineMatch = line.match(/(.+?)\s+Rp[\s.]?([\d.,]+)/i);
//     const isQtyLine = /\d+\s*x\s*Rp[\d.,]+.*Rp[\d.,]+/i.test(line);

//     if (oneLineMatch && !isQtyLine) {
//       const name = oneLineMatch[1].trim();
//       const amount = parseFloat(
//         oneLineMatch[2].replace(/\./g, "").replace(",", ".")
//       );
//       items.push({ name, amount });
//       currentItem = "";
//     }

//     // ===== CASE 2: Detail line (e.g. "2x Rp34.000,00 Rp68.000,00") =====
//     else if (isQtyLine && currentItem) {
//       const priceMatches = [...line.matchAll(/Rp[\s.]?([\d.,]+)/g)];
//       if (priceMatches.length > 0) {
//         const lastPrice = priceMatches[priceMatches.length - 1][1];
//         const cleanPrice = parseFloat(
//           lastPrice.replace(/\./g, "").replace(",", ".")
//         );
//         items.push({
//           name: currentItem,
//           amount: cleanPrice,
//         });
//         currentItem = "";
//       }
//     }

//     // ===== CASE 3: Baris kemungkinan nama item =====
//     else if (!isQtyLine && !line.match(/^Rp/)) {
//       currentItem = line;
//     }
//   }

//   return items;
// }

// // NEW BERHASIL
// function parseBillText(text) {
//   const lines = text
//     .split("\n")
//     .map((l) => l.trim())
//     .filter((l) => l);

//   const items = [];
//   let currentItem = "";

//   for (let i = 0; i < lines.length; i++) {
//     const line = lines[i].replace(/[^\w\sRp.,x]/g, "").trim(); // bersihkan noise: « ¥ ; etc

//     // ===== CASE 1: One-line (item + price, possible quantity in middle) =====
//     const oneLineMatch = line.match(/(.+?)\s+Rp[\s.]?([\d.,]+)/i);
//     const isQtyLine = /\d+\s*x\s*Rp[\d.,]+.*Rp[\d.,]+/i.test(line);

//     if (oneLineMatch && !isQtyLine) {
//       let name = oneLineMatch[1].trim();
//       let rawAmount = oneLineMatch[2];

//       // Hapus angka trailing dari nama jika ada (e.g. "Melts Pizza 1" -> "Melts Pizza")
//       name = name.replace(/\s+\d+$/, "").trim();

//       const cleanAmount = parseFloat(
//         rawAmount.replace(/\./g, "").replace(",", ".")
//       );

//       // Jika jumlahnya valid, tambahkan
//       if (!isNaN(cleanAmount)) {
//         items.push({ name, amount: cleanAmount });
//       }

//       currentItem = "";
//     }

//     // ===== CASE 2: Dua baris - item di atas, harga di bawah =====
//     else if (isQtyLine && currentItem) {
//       const priceMatches = [...line.matchAll(/Rp[\s.]?([\d.,]+)/g)];
//       if (priceMatches.length > 0) {
//         const lastPrice = priceMatches[priceMatches.length - 1][1];
//         const cleanPrice = parseFloat(
//           lastPrice.replace(/\./g, "").replace(",", ".")
//         );
//         items.push({
//           name: currentItem,
//           amount: cleanPrice,
//         });
//         currentItem = "";
//       }
//     }

//     // ===== CASE 3: Nama item saja (asumsi baris berikutnya qty & harga) =====
//     else if (!isQtyLine && !line.match(/^Rp/)) {
//       currentItem = line.replace(/\s+\d+$/, "").trim(); // hapus trailing angka
//     }
//   }

//   return items;
// }

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

      // Perbaiki jumlah yang terpotong dengan memeriksa adanya angka terpisah
      let cleanedAmount = rawAmount.replace(/\./g, "").replace(",", ".");

      // Jika terdapat koma sebelum angka ribuan, kita pastikan untuk memisahkannya dengan benar
      if (cleanedAmount.includes(",")) {
        const parts = cleanedAmount.split(",");
        if (parts.length === 2 && parts[1].length < 3) {
          cleanedAmount = parts[0] + "." + parts[1].padEnd(3, "0"); // Menjaga angka dengan format yang benar
        }
      }

      // Pastikan bahwa angka yang dihasilkan sudah benar
      const cleanAmount = parseFloat(cleanedAmount);

      // Jika jumlahnya valid, tambahkan
      if (!isNaN(cleanAmount)) {
        // Ubah menjadi format yang sesuai
        const formattedAmount = cleanAmount
          .toLocaleString("id-ID", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
          .replace(",", "."); // Ganti koma dengan titik untuk format yang benar

        items.push({ name, amount: formattedAmount });
      }

      currentItem = "";
    }

    // ===== CASE 2: Dua baris - item di atas, harga di bawah =====
    else if (isQtyLine && currentItem) {
      const priceMatches = [...line.matchAll(/Rp[\s.]?([\d.,]+)/g)];
      if (priceMatches.length > 0) {
        const lastPrice = priceMatches[priceMatches.length - 1][1];
        const cleanPrice = parseFloat(
          lastPrice.replace(/\./g, "").replace(",", ".")
        );

        // Format harga sesuai dengan standar
        const formattedPrice = cleanPrice
          .toLocaleString("id-ID", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
          .replace(",", "."); // Ganti koma dengan titik untuk format yang benar

        items.push({
          name: currentItem,
          amount: formattedPrice,
        });
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
      who: [], // kosong, bisa diisi manual dari UI kamu
      paidBy: "", // kosong juga
    });
  });

  updateTable(); // render ulang tabel dengan data baru
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
