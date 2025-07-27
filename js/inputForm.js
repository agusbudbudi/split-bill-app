// handle payment method change
function handlePaymentMethodChange() {
  const method = document.getElementById("paymentMethod").value;
  const bankForm = document.getElementById("bankForm");
  const ewalletForm = document.getElementById("ewalletForm");
  const detailsContainer = document.getElementById("paymentDetails");

  // Tampilkan container form
  detailsContainer.style.display = method ? "block" : "none";

  if (method === "BankTransfer") {
    bankForm.style.display = "block";
    ewalletForm.style.display = "none";
  } else if (
    ["OVO", "GoPay", "DANA", "ShopeePay", "LinkAja"].includes(method)
  ) {
    bankForm.style.display = "none";
    ewalletForm.style.display = "block";
  } else {
    bankForm.style.display = "none";
    ewalletForm.style.display = "none";
  }
}
