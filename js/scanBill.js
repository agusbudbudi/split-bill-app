// OCR Scanner Functions
function preprocessImage(img) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = img.width;
  canvas.height = img.height;

  ctx.filter = "grayscale(100%) contrast(150%) brightness(110%)";
  ctx.drawImage(img, 0, 0);

  return canvas.toDataURL(); // hasilnya: data:image/png;base64,...
}

// Fungsi utama proses OCR
async function processImage() {
  const file = document.getElementById("bill-image").files[0];
  if (!file) {
    alert("Pilih gambar terlebih dahulu");
    return;
  }

  const imageUrl = URL.createObjectURL(file);
  const img = new Image();
  img.src = imageUrl;

  await new Promise((resolve) => {
    img.onload = resolve;
  });

  console.log("Image loaded");
  const preprocessedDataUrl = preprocessImage(img);
  console.log(
    "Preprocessed image data URL start:",
    preprocessedDataUrl.substring(0, 50)
  );

  // Gunakan langsung Tesseract.recognize (versi 4+)
  const {
    data: { text },
  } = await Tesseract.recognize(
    preprocessedDataUrl,
    "eng", // bahasa
    {
      logger: (m) => console.log(m),
    }
  );

  console.log("OCR Result:", text);

  const items = parseBillText(text); // pastikan fungsi ini sudah ada
  renderParsedItems(items); // tampilkan hasil

  if (typeof window.updateCalculateButton === "function") {
    window.updateCalculateButton(); // update UI
  }

  URL.revokeObjectURL(imageUrl);
}

function normalizeAmount(rawAmount) {
  // Handle jika ada spasi dalam angka
  const cleanAmount = rawAmount.replace(/\s+/g, "");

  const commaParts = cleanAmount.split(",");
  let numericAmount = "";

  if (commaParts.length === 2) {
    const integerPart = commaParts[0].replace(/\./g, "");
    const decimalPart = commaParts[1];

    // Handle kasus seperti "30.000,00" -> "30000"
    if (decimalPart.length === 2 || decimalPart === "00") {
      numericAmount = integerPart;
    }
    // Handle kasus seperti "30.000,500" -> "30000500"
    else if (decimalPart.length > 2) {
      numericAmount = integerPart + decimalPart;
    }
    // Handle kasus seperti "30.000,5" -> "300005"
    else {
      numericAmount = integerPart + decimalPart;
    }
  } else {
    // Handle kasus tanpa koma seperti "30.000" -> "30000"
    numericAmount = cleanAmount.replace(/[.,]/g, "");
  }

  // Handle kasus angka "0" atau string kosong
  if (!numericAmount || numericAmount === "0") {
    return 0;
  }

  return parseInt(numericAmount, 10);
}

function parseBillText(text) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const items = [];
  let pendingItemName = null;
  let lastItemIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    console.log("Line", i, JSON.stringify(line));

    // Skip "Case n" dan baris yang hanya berisi "Rp" saja
    if (/^Case\s*\d+/i.test(line) || line === "Rp" || /^Total/i.test(line))
      continue;

    // Handle kasus OCR yang salah mengenali 'Rp' menjadi karakter lain (1p, 8p, dll)
    const normalizedLine = line
      .replace(/(\d+|\b)[pP]\s*(\d)/g, "$1p $2")
      .replace(/[rR][pP]\s*/gi, "Rp");

    // 1. Jika line hanya nama item (tidak ada angka dan tidak ada "Rp")
    if (
      !normalizedLine.match(/\d/) &&
      !normalizedLine.toLowerCase().includes("rp")
    ) {
      // Jika sebelumnya sudah ada pendingItemName, gabungkan
      if (pendingItemName) {
        pendingItemName += " " + normalizedLine;
      } else {
        pendingItemName = normalizedLine;
      }
      continue;
    }

    // 2. Format: "2x Rp30.000,00 Rp60.000,00" atau "2 x Rp30.000,00 Rp60.000,00"
    const qtyLineMatch = normalizedLine.match(
      /(\d+)\s*[xX]\s*(?:Rp\s*)?([\d\s.,]+)\s+(?:Rp\s*)?([\d\s.,]+)/i
    );
    if (qtyLineMatch) {
      const qty = parseInt(qtyLineMatch[1], 10);
      const unitPrice = normalizeAmount(qtyLineMatch[2]);
      const totalAmount = normalizeAmount(qtyLineMatch[3]);

      console.log({ qty, unitPrice, totalAmount });

      items.push({
        item: pendingItemName || `Item ${i}`, // fallback kalau pendingItemName null
        amount: totalAmount,
        who: [],
        paidBy: "",
      });

      pendingItemName = null; // reset hanya setelah digunakan
      lastItemIndex = items.length - 1;
      continue;
    }

    // 3. Format: "Item @ Rp.30.000,00" (format harga per unit)
    const perUnitMatch = normalizedLine.match(
      /^(.+?)\s*@\s*(?:Rp\s*)?([\d\s.,]+)$/i
    );
    if (perUnitMatch) {
      let itemName = perUnitMatch[1].trim();
      const unitPrice = normalizeAmount(perUnitMatch[2]);

      // Cek baris berikutnya untuk jumlah atau total
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        const qtyMatch = nextLine.match(/^(\d+)\s*(?:[xX])?$/);
        const totalMatch = nextLine.match(/^(?:Rp\s*)?([\d\s.,]+)$/);

        if (qtyMatch) {
          // Ada qty di baris berikutnya
          const qty = parseInt(qtyMatch[1], 10);
          items.push({
            item: itemName,
            amount: unitPrice * qty, // hitung total
            who: [],
            paidBy: "",
          });
          i++; // skip baris berikutnya
        } else if (totalMatch) {
          // Ada total di baris berikutnya
          items.push({
            item: itemName,
            amount: normalizeAmount(totalMatch[1]),
            who: [],
            paidBy: "",
          });
          i++; // skip baris berikutnya
        } else {
          // Tidak ada info tambahan, gunakan unit price
          items.push({
            item: itemName,
            amount: unitPrice,
            who: [],
            paidBy: "",
          });
        }
      } else {
        // Tidak ada baris berikutnya, gunakan unit price
        items.push({
          item: itemName,
          amount: unitPrice,
          who: [],
          paidBy: "",
        });
      }

      pendingItemName = null;
      lastItemIndex = items.length - 1;
      continue;
    }

    // 4. Format inline: "Makan Malam 2x Rp30.000,00" → ekstrak nama tanpa "2x"
    const inlineMatch = normalizedLine.match(
      /^(.+?)\s*(\d+\s*[xX])\s*(?:Rp\s*)?([\d\s.,]+)$/i
    );
    if (inlineMatch) {
      let itemName = inlineMatch[1].trim();
      const amount = normalizeAmount(inlineMatch[3]);
      items.push({
        item: itemName,
        amount,
        who: [],
        paidBy: "",
      });
      pendingItemName = null;
      lastItemIndex = items.length - 1;
      continue;
    }

    // 5. Format inline dengan harga: "Makan Malam Rp30.000,00"
    const simplePriceMatch = normalizedLine.match(
      /^(.+?)\s+(?:Rp\s*)?([\d\s.,]+)$/i
    );
    if (simplePriceMatch) {
      let itemName = simplePriceMatch[1].trim();
      const amount = normalizeAmount(simplePriceMatch[2]);

      // Pastikan ini bukan format qty saja (misalnya "2 x") tanpa nama item
      if (!/^\d+\s*[xX]$/.test(itemName)) {
        items.push({
          item: itemName,
          amount,
          who: [],
          paidBy: "",
        });
        pendingItemName = null;
        lastItemIndex = items.length - 1;
        continue;
      }
    }

    // 6. Format noisy inline: "Melts Pizza 1 Rp53,637 3"
    const noisyMatch = normalizedLine.match(
      /^(.+?)\s+(?:\d+\s+)?Rp([\d\s.,]+)(?:\s+\S*)*$/i
    );
    if (noisyMatch) {
      let rawItemName = noisyMatch[1].trim();
      const amount = normalizeAmount(noisyMatch[2]);

      // Bersihkan trailing angka (qty atau noise) dari nama item
      rawItemName = rawItemName.replace(/\s*\d+$/, ""); // misalnya "Melts Pizza 1" -> "Melts Pizza"

      items.push({
        item: rawItemName,
        amount,
        who: [],
        paidBy: "",
      });
      pendingItemName = null;
      lastItemIndex = items.length - 1;
      continue;
    }

    // 7. Harga saja di baris, gunakan pendingItemName
    const priceOnlyMatch = normalizedLine.match(/^(?:Rp\s*)?([\d\s.,]+)$/);
    if (priceOnlyMatch && pendingItemName) {
      const amount = normalizeAmount(priceOnlyMatch[1]);
      items.push({
        item: pendingItemName,
        amount,
        who: [],
        paidBy: "",
      });
      pendingItemName = null;
      lastItemIndex = items.length - 1;
      continue;
    }

    // 8. Format: qty dan satuan terpisah (misalnya "2 pcs")
    const qtyOnlyMatch = normalizedLine.match(
      /^(\d+)\s*(?:pcs|x|pc|buah|item|porsi)?$/i
    );
    if (qtyOnlyMatch && pendingItemName) {
      // Hanya ada qty, kemungkinan harga ada di baris berikutnya
      const qty = parseInt(qtyOnlyMatch[1], 10);

      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        const nextPriceMatch = nextLine.match(/^(?:Rp\s*)?([\d\s.,]+)$/);

        if (nextPriceMatch) {
          const unitPrice = normalizeAmount(nextPriceMatch[1]);
          items.push({
            item: pendingItemName,
            amount: unitPrice * qty, // perkirakan total
            who: [],
            paidBy: "",
            qty: qty, // tambahkan info qty
          });
          i++; // skip nextLine
          pendingItemName = null;
          lastItemIndex = items.length - 1;
          continue;
        }
      }
    }

    // 9. Format "QTY x ITEM" tanpa harga di baris ini
    const qtyItemMatch = normalizedLine.match(/^(\d+)\s*[xX]\s*(.+)$/i);
    if (qtyItemMatch) {
      pendingItemName = qtyItemMatch[2].trim();
      // Kemungkinan harga ada di baris berikutnya
      continue;
    }

    // 10. Fallback: cari angka besar di baris
    const fallbackMatch = normalizedLine.match(/(?:Rp)?\s*([\d\s.,]{4,})/);
    if (fallbackMatch) {
      const amount = normalizeAmount(fallbackMatch[1]);
      if (amount >= 1000) {
        // Extract item name by removing the price part
        const rawItem = normalizedLine.replace(fallbackMatch[0], "").trim();

        items.push({
          item: rawItem || pendingItemName || `Item ${i}`,
          amount,
          who: [],
          paidBy: "",
        });

        pendingItemName = null;
        lastItemIndex = items.length - 1;
        continue;
      }
    }

    // 11. Jika baris mengandung "diskon" atau "disc", update item terakhir
    if (
      normalizedLine.toLowerCase().includes("disc") ||
      normalizedLine.toLowerCase().includes("diskon")
    ) {
      const discountMatch = normalizedLine.match(/(?:Rp)?\s*([\d\s.,]+)/);
      if (discountMatch && lastItemIndex >= 0) {
        const discount = normalizeAmount(discountMatch[1]);
        if (items[lastItemIndex].amount > discount) {
          items[lastItemIndex].amount -= discount;
          items[lastItemIndex].discount = discount;
        }
        continue;
      }
    }

    // Jika semua pattern tidak cocok, tambahkan ke pendingItemName
    if (pendingItemName) {
      pendingItemName += " " + normalizedLine;
    } else {
      pendingItemName = normalizedLine;
    }
  }

  return items;
}

function renderParsedItems(items) {
  // Add parsed items to global expenses array
  if (typeof window.expenses !== "undefined") {
    items.forEach((item) => {
      window.expenses.push({
        item: item.item,
        amount: item.amount,
        who: [],
        paidBy: "",
      });
    });
  } else {
    // Initialize expenses array if it doesn't exist
    window.expenses = items.map((item) => ({
      item: item.item,
      amount: item.amount,
      who: [],
      paidBy: "",
    }));
  }

  // Update display using shared function
  if (typeof window.updateExpenseCards === "function") {
    window.updateExpenseCards();
  }

  // Show success message
  if (typeof window.showToast === "function") {
    window.showToast(
      "Bill kamu berhasil discan. Cek datanya di bawah, ya!",
      "success",
      5000
    );
  }
}

// File handling for OCR scanner
function truncateFileName(fileName, maxLength = 10) {
  if (fileName.length <= maxLength) return fileName;

  const dotIndex = fileName.lastIndexOf(".");
  const ext = dotIndex !== -1 ? fileName.slice(dotIndex) : "";
  const nameOnly = dotIndex !== -1 ? fileName.slice(0, dotIndex) : fileName;

  const truncatedName = nameOnly.slice(0, maxLength - ext.length - 3);
  return truncatedName + "..." + ext;
}

// Initialize OCR file handling
document.addEventListener("DOMContentLoaded", () => {
  const billImageInput = document.getElementById("bill-image");
  const fileNameElement = document.getElementById("fileNameOcr");
  const removeBtn = document.getElementById("removeBtn");
  const fileInfo = document.getElementById("fileInfoOcr");

  if (billImageInput) {
    billImageInput.addEventListener("change", function (e) {
      const file = e.target.files[0];

      if (file && fileNameElement) {
        fileNameElement.textContent = truncateFileName(file.name);
        if (fileInfo) {
          fileInfo.style.display = "flex";
        }
      }
    });
  }

  if (removeBtn) {
    removeBtn.addEventListener("click", function () {
      if (billImageInput) {
        billImageInput.value = ""; // Clear input
      }
      if (fileInfo) {
        fileInfo.style.display = "none";
      }
    });
  }
});
