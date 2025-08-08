class BillScanner {
  // constructor() {
  //   this.selectedFile = null;
  //   // this.apiKey = GEMINI_API_KEY;
  //   this.apiKey = ""; // Remove the hardcoded API key for security
  //   this.initializeEventListeners();
  // }
  // constructor() {
  //   this.selectedFile = null;
  //   // this.apiKey = localStorage.getItem("myApiKey") || ""; move to BE
  //   this.initializeEventListeners();
  // }

  constructor() {
    this.selectedFile = null;
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    const fileInput = document.getElementById("fileInput");
    // const apiKeyInput = document.getElementById("apiKey");
    const scanBtn = document.getElementById("scanBtn");

    if (fileInput)
      fileInput.addEventListener("change", (e) => this.handleFileSelect(e));
    // if (apiKeyInput)
    //   apiKeyInput.addEventListener("input", (e) => this.handleApiKeyInput(e));
    if (scanBtn) scanBtn.addEventListener("click", () => this.scanBill());
  }

  handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;
    this.displayFileInfo(file);
    this.updateScanButton();
  }

  // handleApiKeyInput(event) {
  //   this.apiKey = event.target.value.trim();
  //   this.updateScanButton();
  // }

  displayFileInfo(file) {
    const fileInfo = document.getElementById("fileInfo");
    const fileName = document.getElementById("fileName");
    const previewImage = document.getElementById("previewImage");

    if (fileName) {
      fileName.textContent = `File: ${file.name} (${this.formatFileSize(
        file.size
      )})`;
    }
    if (fileInfo) {
      fileInfo.style.display = "block";
    }

    // Show preview
    if (previewImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImage.src = e.target.result;
        previewImage.style.display = "block";
      };
      reader.readAsDataURL(file);
    }
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  updateScanButton() {
    const scanBtn = document.getElementById("scanBtn");
    if (!scanBtn) return;

    // Hanya hapus class jika ada file
    if (this.selectedFile) {
      scanBtn.classList.remove("disabled-btn");
    } else {
      scanBtn.classList.add("disabled-btn"); // Optional: tambahkan kembali jika tidak ada file
    }
  }

  async scanBill() {
    // if (!this.selectedFile || !this.apiKey) {
    //   this.showError("Pilih file dan masukkan API Key terlebih dahulu");
    //   return;
    // }

    if (!this.selectedFile) {
      this.showError("Pilih file terlebih dahulu");
      return;
    }

    this.showLoading(true);
    this.hideMessages();

    try {
      const base64Image = await this.fileToBase64(this.selectedFile);
      const result = await this.callGeminiAPI(base64Image);
      this.displayResult(result);
      this.showSuccess("🎉 Scan berhasil dilakukan!, cek datanya di bawah ya");
    } catch (error) {
      console.error("Error:", error);
      this.showError(`Error: ${error.message}`);
      this.displayResult({
        error: true,
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    } finally {
      this.showLoading(false);
    }
  }

  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async callGeminiAPI(base64Image) {
    const BASE_API_URL = "https://split-bill-backend-vercel.vercel.app"; // domain backend kamu

    const payload = {
      mime_type: this.selectedFile.type,
      base64Image: base64Image,
    };

    const response = await fetch(`${BASE_API_URL}/api/gemini-scan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json(); // sudah dalam bentuk JSON object hasil parsing dari backend
  }

  //   async callGeminiAPI(base64Image) {
  //     // const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;

  //     const url = `/api/gemini-scan`; // move to BE function

  //     const prompt = `
  // Analyze this bill/receipt image and extract the following information in JSON format:
  // {
  // "merchant_name": "name of the store/restaurant",
  // "date": "transaction date (YYYY-MM-DD format)",
  // "time": "transaction time (HH:MM format)",
  // "items": [
  //   {
  //       "name": "item name",
  //       "quantity": "quantity",
  //       "price": "price per item",
  //       "total": "total price for this item"
  //   }
  // ],
  // "subtotal": "subtotal amount",
  // "tax": "tax amount",
  // "service_charge": "service charge if any",
  // "discount": "discount amount if any",
  // "total_amount": "final total amount",
  // "payment_method": "cash/card/etc",
  // "receipt_number": "receipt/transaction number"
  // }

  // Please extract as much information as possible from the image. If some information is not available, use null as the value. Respond with ONLY the JSON, no additional text.`;

  //     //   const requestBody = {
  //     //     contents: [
  //     //       {
  //     //         parts: [
  //     //           {
  //     //             text: prompt,
  //     //           },
  //     //           {
  //     //             inline_data: {
  //     //               mime_type: this.selectedFile.type,
  //     //               data: base64Image,
  //     //             },
  //     //           },
  //     //         ],
  //     //       },
  //     //     ],
  //     //   };

  //     //   const response = await fetch(url, {
  //     //     method: "POST",
  //     //     headers: {
  //     //       "Content-Type": "application/json",
  //     //     },
  //     //     body: JSON.stringify(requestBody),
  //     //   });

  //     //   if (!response.ok) {
  //     //     const errorData = await response.json();
  //     //     throw new Error(
  //     //       errorData.error?.message || `HTTP error! status: ${response.status}`
  //     //     );
  //     //   }

  //     //   const data = await response.json();

  //     //   if (
  //     //     !data.candidates ||
  //     //     !data.candidates[0] ||
  //     //     !data.candidates[0].content
  //     //   ) {
  //     //     throw new Error("Invalid response from Gemini API");
  //     //   }

  //     //   const textResponse = data.candidates[0].content.parts[0].text;

  //     //   try {
  //     //     // Clean the response to extract JSON
  //     //     const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
  //     //     if (!jsonMatch) {
  //     //       throw new Error("No JSON found in response");
  //     //     }

  //     //     return JSON.parse(jsonMatch[0]);
  //     //   } catch (parseError) {
  //     //     // If JSON parsing fails, return the raw response
  //     //     return {
  //     //       raw_response: textResponse,
  //     //       error: "Failed to parse JSON response",
  //     //       timestamp: new Date().toISOString(),
  //     //     };
  //     //   }
  //     // }

  //     const requestBody = {
  //       contents: [
  //         {
  //           parts: [
  //             { text: prompt },
  //             {
  //               inline_data: {
  //                 mime_type: this.selectedFile.type,
  //                 data: base64Image,
  //               },
  //             },
  //           ],
  //         },
  //       ],
  //     };

  //     const BASE_API_URL = "https://split-bill-backend-vercel.vercel.app";

  //     const response = await fetch(`${BASE_API_URL}/api/gemini-scan`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(requestBody),
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(
  //         errorData.error?.message || `HTTP error! status: ${response.status}`
  //       );
  //     }

  //     const data = await response.json();

  //     const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

  //     try {
  //       const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
  //       if (!jsonMatch) throw new Error("No JSON found in response");

  //       return JSON.parse(jsonMatch[0]);
  //     } catch (parseError) {
  //       return {
  //         raw_response: textResponse,
  //         error: "Failed to parse JSON response",
  //         timestamp: new Date().toISOString(),
  //       };
  //     }
  //   }

  displayResult(result) {
    const jsonOutput = document.getElementById("jsonOutput");
    if (jsonOutput) {
      jsonOutput.textContent = JSON.stringify(result, null, 2);
    }

    // Process and add to expenses if scan was successful
    if (result && !result.error && result.items) {
      this.processScannedData(result);
    }
  }

  processScannedData(scanResult) {
    // Convert scanned items to expense format
    if (scanResult.items && Array.isArray(scanResult.items)) {
      const newExpenses = [];

      scanResult.items.forEach((item) => {
        // Clean price string and convert to number
        const cleanPrice = this.cleanPriceString(item.total);

        const expenseItem = {
          item: item.name,
          amount: cleanPrice,
          who: [], // Empty array initially - user needs to edit
          paidBy: "", // Empty initially - user needs to edit
        };

        newExpenses.push(expenseItem);
      });

      // Add to global expenses array
      if (typeof window.expenses !== "undefined") {
        window.expenses.push(...newExpenses);
      } else {
        // Initialize expenses array if it doesn't exist
        window.expenses = [...newExpenses];
      }

      // Update the expense cards display using the shared function
      if (typeof window.updateExpenseCards === "function") {
        window.updateExpenseCards();
        this.showSuccess(
          `${scanResult.items.length} item berhasil ditambahkan ke expense list!`
        );
      }
    }
  }

  cleanPriceString(priceStr) {
    if (!priceStr) return 0;
    // Remove currency symbols, commas, dots used as thousand separators
    // Handle formats like: 43,000 or 43.000 or Rp 43,000
    return parseInt(priceStr.toString().replace(/[^\d]/g, "")) || 0;
  }

  showLoading(show) {
    const loading = document.getElementById("loading");
    const jsonOutput = document.getElementById("jsonOutput");

    if (loading) {
      loading.style.display = show ? "block" : "none";
    }
    if (jsonOutput) {
      jsonOutput.style.display = show ? "none" : "block";
    }
  }

  // showError(message) {
  //   const errorDiv = document.getElementById("errorMessage");
  //   if (errorDiv) {
  //     errorDiv.textContent = message;
  //     errorDiv.style.display = "block";
  //   }
  // }

  // showSuccess(message) {
  //   const successDiv = document.getElementById("successMessage");
  //   if (successDiv) {
  //     successDiv.textContent = message;
  //     successDiv.style.display = "block";
  //   }
  // }

  // hideMessages() {
  //   const errorDiv = document.getElementById("errorMessage");
  //   const successDiv = document.getElementById("successMessage");

  //   if (errorDiv) errorDiv.style.display = "none";
  //   if (successDiv) successDiv.style.display = "none";
  // }

  showError(message) {
    const errorDiv = document.getElementById("errorMessage");
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = "block";
      // Hide the error message after 5 seconds
      setTimeout(() => {
        errorDiv.style.display = "none";
      }, 5000); // 5000 milliseconds = 5 seconds
    }
  }

  showSuccess(message) {
    const successDiv = document.getElementById("successMessage");
    if (successDiv) {
      successDiv.textContent = message;
      successDiv.style.display = "block";
      // Hide the success message after 5 seconds
      setTimeout(() => {
        successDiv.style.display = "none";
      }, 5000); // 5000 milliseconds = 5 seconds
    }
  }

  // This function is still available if you need to hide messages manually
  hideMessages() {
    const errorDiv = document.getElementById("errorMessage");
    const successDiv = document.getElementById("successMessage");

    if (errorDiv) errorDiv.style.display = "none";
    if (successDiv) successDiv.style.display = "none";
  }
}

// function saveApiKey() {
//   const apiKeyInput = document.getElementById("apiKey");
//   const apiKey = apiKeyInput.value.trim();

//   if (apiKey) {
//     localStorage.setItem("myApiKey", apiKey);

//     showToast("API Key berhasil disimpan", "success", 5000);

//     apiKeyInput.value = ""; // kosongkan input setelah simpan
//     closeBottomSheet("addApiKeyBottomSheet"); // tutup bottom sheet
//   } else {
//     showToast("API Key tidak boleh kosong.", "error", 5000);
//   }
// }

// Initialize the AI scanner when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new BillScanner();
});
