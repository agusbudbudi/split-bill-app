let people = [];
let who = [];

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
  closeBottomSheet("addPersonBottomSheet");

  showToast("Teman berhasil ditambahkan!", "success", 2000);
}

function renderPeople() {
  const container = document.getElementById("peopleList");
  const table = document.getElementById("peopleTable"); // table tetap bisa disembunyikan
  table.style.display = "none"; // kita sembunyikan karena sekarang pakai div

  container.innerHTML = "";

  if (people.length === 0) {
    return;
  }

  people.forEach((name, index) => {
    const personDiv = document.createElement("div");
    personDiv.className = "person-item";

    personDiv.innerHTML = `
  <img src="https://api.dicebear.com/9.x/personas/svg?backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=32&scale=100&seed=${encodeURIComponent(
    name
  )}" class="person-img" />
  <span class="person-name">${name}</span>
  <button class="remove-avatar-btn" onclick="removePerson(${index}, '${name}')"><i class="fa-solid fa-minus"></i></button>
`;

    container.appendChild(personDiv);
  });
}

//Remove Person at section Manual Add Expense
function removePerson(index, name) {
  people.splice(index, 1);
  who = who.filter((n) => n !== name);

  renderPeople();
  updateDropdowns();
  renderAvatars();

  showToast("Teman berhasil dihapus!", "success", 5000);
}

//Update Dropdown Paid By at section Manual Add Expense
function updateDropdowns() {
  const paidBySelect = document.getElementById("paidBy");
  paidBySelect.innerHTML = "";

  if (people.length === 0) {
    console.log("People masih kosong, tampilkan placeholder.");
    const placeholderOption = document.createElement("option");
    placeholderOption.textContent = "Tambahkan teman terlebih dahulu";
    placeholderOption.disabled = true;
    placeholderOption.selected = true;
    paidBySelect.appendChild(placeholderOption);
    return;
  }

  people.forEach((person) => {
    const paidOption = document.createElement("option");
    paidOption.value = person;
    paidOption.textContent = person;
    paidBySelect.appendChild(paidOption);
  });
}

//NEW USED AVATAR IMAGE
function renderAvatars() {
  const container = document.getElementById("avatarContainer");
  if (!container) return; // Cegah error jika container tidak ditemukan
  container.innerHTML = "";

  // ✅ Tambahkan pengecekan jika belum ada orang
  if (people.length === 0) {
    const emptyText = document.createElement("div");
    emptyText.className = "empty-text";
    emptyText.textContent = "Tambahkan teman terlebih dahulu";
    container.appendChild(emptyText);
    return;
  }

  people.forEach((person) => {
    const avatarWrapper = document.createElement("div");
    avatarWrapper.className = "avatar-wrapper";

    // Ganti avatar teks dengan avatar gambar dari Dicebear Dylan
    const avatar = document.createElement("img");
    avatar.className = `avatar-img ${who.includes(person) ? "selected" : ""}`;
    avatar.src = `https://api.dicebear.com/9.x/personas/svg?backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=32&scale=100&seed=${encodeURIComponent(
      person
    )}`;
    avatar.alt = person;

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

document.addEventListener("DOMContentLoaded", () => {
  updateDropdowns(); // ⬅️ ini harus dipanggil setelah DOM siap
  renderAvatars();
});
