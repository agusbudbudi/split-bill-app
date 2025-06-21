//Remove Payment
function removePayment(index) {
  if (confirm("Yakin ingin menghapus metode ini?")) {
    paymentMethods.splice(index, 1);
    localStorage.setItem("paymentMethods", JSON.stringify(paymentMethods));

    try {
      renderCards(); // jika error, akan ditangkap
    } catch (e) {
      console.error("Gagal menjalankan renderCards:", e);
    }

    // ini tetap dijalankan meskipun renderCards error
    renderPaymentCards();

    showToast("Metode pembayaran berhasil dihapus", "success", 5000);
  }
}

//Back FUnction
function goBack() {
  // Redirect to main page or use history.back()
  window.history.back();
}
