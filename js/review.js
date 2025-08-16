// Rating System Variables
let selectedRating = 0;

// Initialize rating system
document.addEventListener("DOMContentLoaded", function () {
  const stars = document.querySelectorAll(".rating-star");

  stars.forEach((star, index) => {
    // Click event for rating selection
    star.addEventListener("click", function () {
      selectedRating = parseInt(this.getAttribute("data-rating"));
      updateStarDisplay(selectedRating);
    });

    // Hover effects
    star.addEventListener("mouseenter", function () {
      const hoverRating = parseInt(this.getAttribute("data-rating"));
      updateStarHover(hoverRating);
    });
  });

  // Reset hover effect when leaving rating container
  document
    .getElementById("ratingContainer")
    .addEventListener("mouseleave", function () {
      updateStarDisplay(selectedRating);
    });
});

// Update star display based on rating
function updateStarDisplay(rating) {
  const stars = document.querySelectorAll(".rating-star");
  stars.forEach((star, index) => {
    star.classList.remove("active", "hover-effect");
    if (index < rating) {
      star.classList.add("active");
    }
  });
}

// Update star hover effect
function updateStarHover(rating) {
  const stars = document.querySelectorAll(".rating-star");
  stars.forEach((star, index) => {
    star.classList.remove("hover-effect");
    if (index < rating) {
      star.classList.add("hover-effect");
    }
  });
}

// Toggle contact fields visibility
function toggleContactFields() {
  const checkbox = document.getElementById("contactPermission");
  const contactFields = document.getElementById("contactFields");

  if (checkbox.checked) {
    contactFields.style.display = "block";
  } else {
    contactFields.style.display = "none";
    // Clear contact fields when hidden
    document.getElementById("contactEmail").value = "";
    document.getElementById("contactPhone").value = "";
  }
}

// API Configuration
const API_CONFIG = {
  baseURL: "https://split-bill-backend-vercel.vercel.app/api",
  endpoints: {
    reviews: "/reviews",
  },
};

// Submit review function
async function submitReview() {
  const reviewerName = document.getElementById("reviewerName").value.trim();
  const reviewText = document.getElementById("reviewText").value.trim();
  const contactPermission =
    document.getElementById("contactPermission").checked;
  const contactEmail = document.getElementById("contactEmail").value.trim();
  const contactPhone = document.getElementById("contactPhone").value.trim();

  // Validation
  if (selectedRating === 0) {
    showToast("Silakan pilih rating terlebih dahulu", "error");
    return;
  }

  if (reviewText === "") {
    showToast("Silakan tulis ulasan dan feedback", "error");
    return;
  }

  // Validate contact fields if permission is given
  if (contactPermission) {
    if (contactEmail === "" || contactPhone === "") {
      showToast("Silakan lengkapi email dan nomor telepon", "error");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      showToast("Format email tidak valid", "error");
      return;
    }

    // Basic phone validation (Indonesian format)
    const phoneRegex = /^(08|62)[0-9]{8,13}$/;
    if (!phoneRegex.test(contactPhone.replace(/\s+/g, ""))) {
      showToast("Format nomor telepon tidak valid", "error");
      return;
    }
  }

  // Create review object for API
  const reviewData = {
    rating: selectedRating,
    name: reviewerName || "Anonim",
    review: reviewText,
    contactPermission: contactPermission,
    email: contactPermission ? contactEmail : null,
    phone: contactPermission ? contactPhone : null,
  };

  // Show loading state
  setSubmitButtonLoading(true);

  try {
    // Send to API
    const response = await fetch(
      `${API_CONFIG.baseURL}${API_CONFIG.endpoints.reviews}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    // Show success message
    showToast(
      "Terima kasih! Ulasan dan feedback kamu sudah tersimpan 🙏",
      "success"
    );

    // Reset form
    resetReviewForm();
  } catch (error) {
    console.error("Error submitting review:", error);

    // Fallback to localStorage if API fails
    try {
      let reviews = JSON.parse(
        localStorage.getItem("splitBillReviews") || "[]"
      );
      reviews.push({
        ...reviewData,
        timestamp: new Date().toISOString(),
        synced: false, // Mark as not synced with server
      });
      localStorage.setItem("splitBillReviews", JSON.stringify(reviews));

      showToast(
        "Review tersimpan secara lokal. Akan disinkronkan saat koneksi tersedia.",
        "warning"
      );

      resetReviewForm();
    } catch (localError) {
      showToast(
        "Terjadi kesalahan saat mengirim review. Silakan coba lagi.",
        "error"
      );
    }
  } finally {
    setSubmitButtonLoading(false);
  }
}

// Set loading state for submit button
function setSubmitButtonLoading(isLoading) {
  const submitBtn = document.querySelector(".save-btn");
  if (isLoading) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
    submitBtn.style.opacity = "0.7";
  } else {
    submitBtn.disabled = false;
    submitBtn.innerHTML = "Simpan";
    submitBtn.style.opacity = "1";
  }
}

// Sync offline reviews when connection is restored
async function syncOfflineReviews() {
  try {
    const offlineReviews = JSON.parse(
      localStorage.getItem("splitBillReviews") || "[]"
    );
    const unsyncedReviews = offlineReviews.filter((review) => !review.synced);

    if (unsyncedReviews.length === 0) return;

    for (const review of unsyncedReviews) {
      try {
        const response = await fetch(
          `${API_CONFIG.baseURL}${API_CONFIG.endpoints.reviews}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              rating: review.rating,
              name: review.name,
              review: review.review,
              contactPermission: review.contactPermission,
              email: review.email,
              phone: review.phone,
            }),
          }
        );

        if (response.ok) {
          // Mark as synced
          review.synced = true;
        }
      } catch (error) {
        console.error("Error syncing review:", error);
        break; // Stop syncing if there's an error
      }
    }

    // Update localStorage with synced status
    localStorage.setItem("splitBillReviews", JSON.stringify(offlineReviews));

    // Remove synced reviews from localStorage
    const remainingReviews = offlineReviews.filter((review) => !review.synced);
    localStorage.setItem("splitBillReviews", JSON.stringify(remainingReviews));
  } catch (error) {
    console.error("Error during sync:", error);
  }
}

// Check connection and sync when online
window.addEventListener("online", syncOfflineReviews);

// Try to sync on page load if online
document.addEventListener("DOMContentLoaded", function () {
  if (navigator.onLine) {
    syncOfflineReviews();
  }
});

// Reset review form
function resetReviewForm() {
  selectedRating = 0;
  updateStarDisplay(0);
  document.getElementById("reviewerName").value = "";
  document.getElementById("reviewText").value = "";
  document.getElementById("contactPermission").checked = false;
  document.getElementById("contactFields").style.display = "none";
  document.getElementById("contactEmail").value = "";
  document.getElementById("contactPhone").value = "";
}
