let people = [];
let who = [];

// function addPerson() {
//   const nameInput = document.getElementById("personName");
//   const name = nameInput.value.trim();

//   if (name && !people.includes(name)) {
//     people.push(name);
//     nameInput.value = "";
//     renderPeople();
//     updateDropdowns();
//     renderAvatars();
//   }
// }

function addPerson() {
  const nameInput = document.getElementById("personName");
  const names = nameInput.value
    .split(",")
    .map((n) => n.trim())
    .filter((n) => n !== "");

  if (names.length === 0) {
    alert("Masukkan minimal satu nama.");
    return;
  }

  names.forEach((name) => {
    if (name && !people.includes(name)) {
      people.push(name);
    }
  });

  nameInput.value = "";
  renderPeople();
  updateDropdowns();
  renderAvatars();
}

function renderPeople() {
  const tbody = document.getElementById("peopleTableBody");
  const table = document.getElementById("peopleTable"); // ✅ Tambahkan ini untuk akses ke elemen tabel
  tbody.innerHTML = "";

  if (people.length === 0) {
    table.style.display = "none"; // ✅ Sembunyikan tabel kalau kosong
    return;
  }

  table.style.display = "table"; // ✅ Tampilkan tabel kalau ada isi

  people.forEach((name, index) => {
    const row = document.createElement("tr");

    const noCell = document.createElement("td");
    noCell.textContent = index + 1;

    const nameCell = document.createElement("td");
    nameCell.textContent = name;

    const actionCell = document.createElement("td");
    const removeBtn = document.createElement("button");

    removeBtn.innerHTML = `<i class="fa-regular fa-trash-can"></i> Hapus`;
    removeBtn.className = "delete-btn";

    removeBtn.onclick = () => {
      // Hapus berdasarkan index
      people.splice(index, 1);
      // Hapus dari list yang dipilih juga
      who = who.filter((n) => n !== name);

      renderPeople();
      updateDropdowns();
      renderAvatars();
    };

    actionCell.appendChild(removeBtn);

    row.appendChild(noCell);
    row.appendChild(nameCell);
    row.appendChild(actionCell);

    tbody.appendChild(row);
  });
}

function updateDropdowns() {
  const paidBySelect = document.getElementById("paidBy");
  paidBySelect.innerHTML = "";

  people.forEach((person) => {
    const paidOption = document.createElement("option");
    paidOption.value = person;
    paidOption.textContent = person;
    paidBySelect.appendChild(paidOption);
  });
}

function renderAvatars() {
  const container = document.getElementById("avatarContainer");
  container.innerHTML = "";

  // ✅ Tambahkan pengecekan jika belum ada orang
  if (people.length === 0) {
    const emptyText = document.createElement("div");
    emptyText.className = "empty-text";
    emptyText.textContent = "Tambahkan teman terlebih dahulu";
    container.appendChild(emptyText);
    return; // Stop di sini, gak perlu lanjut render avatar
  }

  people.forEach((person) => {
    const avatarWrapper = document.createElement("div");
    avatarWrapper.className = "avatar-wrapper";

    const initials = getInitials(person);
    const bgColor = getColorForName(person);

    const avatar = document.createElement("div");
    avatar.className = `avatar ${who.includes(person) ? "selected" : ""}`;
    avatar.textContent = initials;
    avatar.style.backgroundColor = bgColor;
    avatar.style.fontSize = initials.length > 2 ? "14px" : "18px";

    const nameLabel = document.createElement("div");
    nameLabel.className = "avatar-name";
    nameLabel.textContent = person;

    avatar.onclick = () => {
      if (who.includes(person)) {
        who = who.filter((name) => name !== person);
      } else {
        who.push(person);
      }
      renderAvatars();
    };

    avatarWrapper.appendChild(avatar);
    avatarWrapper.appendChild(nameLabel);
    container.appendChild(avatarWrapper);
  });
}

function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n.charAt(0).toUpperCase())
    .join("");
}

function getColorForName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color =
    "#" +
    ((hash >> 24) & 0xff).toString(16).padStart(2, "0") +
    ((hash >> 16) & 0xff).toString(16).padStart(2, "0") +
    ((hash >> 8) & 0xff).toString(16).padStart(2, "0");
  return color.slice(0, 7);
}

// // FORMAT CURRENCY when user input
// const amountFormattedInput = document.getElementById("amountFormatted");
// const amountHiddenInput = document.getElementById("amount");

// // new fixing 10 April 2025 handle negative value for input amount (handle case discount)
// amountFormattedInput.addEventListener("input", () => {
//   let inputValue = amountFormattedInput.value;

//   // Jika hanya "-" saja, jangan proses format
//   if (inputValue === "-") {
//     amountHiddenInput.value = "";
//     return;
//   }
//   // Cek apakah nilai diawali dengan minus
//   const isNegative = inputValue.trim().startsWith("-");
//   // Ambil hanya digit
//   let numericOnly = inputValue.replace(/[^0-9]/g, "");
//   if (numericOnly === "") {
//     amountHiddenInput.value = "";
//     amountFormattedInput.value = isNegative ? "-" : "";
//     return;
//   }
//   // Tambahkan minus jika ada
//   if (isNegative) numericOnly = "-" + numericOnly;

//   amountHiddenInput.value = numericOnly;
//   amountFormattedInput.value = formatToIDR(numericOnly);
// });

function setupCurrencyFormatter(formattedInputId, hiddenInputId) {
  const formattedInput = document.getElementById(formattedInputId);
  const hiddenInput = document.getElementById(hiddenInputId);

  if (!formattedInput || !hiddenInput) return;

  formattedInput.addEventListener("input", () => {
    let inputValue = formattedInput.value;

    if (inputValue === "-") {
      hiddenInput.value = "";
      return;
    }

    const isNegative = inputValue.trim().startsWith("-");
    let numericOnly = inputValue.replace(/[^0-9]/g, "");
    if (numericOnly === "") {
      hiddenInput.value = "";
      formattedInput.value = isNegative ? "-" : "";
      return;
    }

    if (isNegative) numericOnly = "-" + numericOnly;

    hiddenInput.value = numericOnly;
    formattedInput.value = formatToIDR(numericOnly);
  });
}

function formatToIDR(number) {
  if (!number) return "";
  const isNegative = parseFloat(number) < 0;
  const absolute = Math.abs(parseFloat(number));
  const formatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(absolute);

  return isNegative ? `- ${formatted}` : formatted;
}

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

renderAvatars();
