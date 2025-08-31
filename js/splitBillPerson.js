let people = loadFromLocalStorage("people") || [];
let who = []; // Gunakan cara serupa jika ingin menyimpan ini juga

/**
 * Adds one or more person names to the list of people.
 *
 * This function retrieves the input value from the "personName" input field,
 * splits the value by commas, trims whitespace, and filters out any empty strings.
 * It then checks if each non-empty name is not already in the 'people' list;
 * if not, the name is added. If at least one name is successfully added,
 * the updated 'people' list is saved to local storage, and the UI is refreshed
 * by rendering the people, updating dropdowns, and avatars. A success toast is shown.
 * If no new name is added, a warning toast is shown instead.
 * Finally, the input field is cleared and the "addPersonBottomSheet" is closed.
 */

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

  let added = false;

  names.forEach((name) => {
    if (name && !people.includes(name)) {
      people.push(name);
      added = true;
    }
  });

  if (added) {
    saveToLocalStorage("people", people);
    renderPeople();
    updateDropdowns();
    renderAvatars();
    updateAllAdditionalExpenseAvatars();
    showToast("Teman berhasil ditambahkan!", "success", 5000);
  } else {
    showToast(`${names} sudah ditambahkan.`, "warning", 5000);
  }

  nameInput.value = "";
  closeBottomSheet("addPersonBottomSheet");
}

/**
 * Renders the list of people in the UI.
 *
 * This function retrieves the list of people from localStorage,
 * clears the container for the people list, and renders each person
 * as a div with a Dicebear avatar, the person's name, and a remove button.
 * If the list of people is empty, this function does nothing.
 */
function renderPeople() {
  const container = document.getElementById("peopleList");
  const table = document.getElementById("peopleTable");
  table.style.display = "none"; // disembunyikan karena pakai div

  container.innerHTML = "";

  // Ambil ulang data dari localStorage jika belum tersedia
  people = loadFromLocalStorage("people") || [];

  if (people.length === 0) return;

  people
    .slice()
    .reverse()
    .forEach((name, index) => {
      const personDiv = document.createElement("div");
      personDiv.className = "person-item";

      personDiv.innerHTML = `
      <img src="https://api.dicebear.com/9.x/personas/svg?backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=32&scale=100&seed=${encodeURIComponent(
        name
      )}" class="person-img" />
      <span class="person-name">${name}</span>
      <button class="remove-avatar-btn" onclick="removePerson(${index}, '${name}')">
        <i class="fa-solid fa-minus"></i>
      </button>
    `;

      container.appendChild(personDiv);
    });
}

/**
 * Removes a person from the list of people.
 *
 * This function takes an index and name of the person to be removed,
 * and does the following:
 * 1. Calculates the real index (since the list is reversed).
 * 2. Removes the person from the 'people' array.
 * 3. Removes the person from the 'who' array if it exists.
 * 4. Saves the updated 'people' and 'who' arrays to local storage.
 * 5. Updates the UI by re-rendering the people list, updating the paid-by dropdown,
 *    and re-rendering the avatars.
 * 6. Shows a success toast message.
 */
function removePerson(index, name) {
  // Hitung index sebenarnya karena list ditampilkan secara reversed
  const realIndex = people.length - 1 - index;

  // Hapus dari array people
  people.splice(realIndex, 1);

  // Hapus dari array who (jika digunakan)
  who = who.filter((n) => n !== name);

  // Simpan pembaruan ke localStorage
  saveToLocalStorage("people", people);
  saveToLocalStorage("who", who);

  // Perbarui tampilan
  renderPeople();
  updateDropdowns();
  renderAvatars();
  updateAllAdditionalExpenseAvatars();

  showToast("Teman berhasil dihapus!", "success", 5000);
}

/**
 * Updates the "paidBy" dropdown with the list of people from local storage.
 *
 * This function does the following:
 * 1. Retrieves the list of people from local storage.
 * 2. Clears the "paidBy" dropdown.
 * 3. If the list of people is empty, adds a disabled option to the dropdown.
 * 4. Otherwise, adds an option to the dropdown for each person in the list.
 * 5. Updates the UI by re-rendering the dropdown.
 */
function updateDropdowns() {
  const paidBySelect = document.getElementById("paidBy");
  paidBySelect.innerHTML = "";

  // Ambil ulang data people dari localStorage
  people = loadFromLocalStorage("people") || [];

  if (people.length === 0) {
    const placeholderOption = document.createElement("option");
    placeholderOption.textContent = "Tambahkan teman terlebih dahulu";
    placeholderOption.disabled = true;
    placeholderOption.selected = true;
    paidBySelect.appendChild(placeholderOption);
    return;
  }

  people
    .slice()
    .reverse()
    .forEach((person) => {
      const paidOption = document.createElement("option");
      paidOption.value = person;
      paidOption.textContent = person;
      paidBySelect.appendChild(paidOption);
    });
}

/**
 * Renders a list of avatars in the "#avatarContainer" element.
 *
 * This function retrieves the list of people and the currently selected people
 * from local storage and updates the avatar container with their avatars and names.
 * Each avatar is generated using the Dicebear API and is clickable to toggle its selection
 * state. The selected state is indicated with a visual change, and selections are saved
 * back to local storage. If there are no people in the list, a message prompting the user
 * to add friends is displayed instead.
 */

function renderAvatars() {
  const container = document.getElementById("avatarContainer");
  if (!container) return;

  // Ambil ulang data dari localStorage
  people = loadFromLocalStorage("people") || [];
  who = loadFromLocalStorage("who") || [];

  container.innerHTML = "";

  if (people.length === 0) {
    const emptyText = document.createElement("div");
    emptyText.className = "empty-text";
    emptyText.textContent = "Tambahkan teman terlebih dahulu";
    container.appendChild(emptyText);
    return;
  }

  people
    .slice()
    .reverse()
    .forEach((person) => {
      const avatarWrapper = document.createElement("div");
      avatarWrapper.className = "avatar-wrapper";

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

        // Simpan update ke localStorage
        saveToLocalStorage("who", who);
        renderAvatars(); // render ulang
        renderAvatarsEdit(); // render ulang list on the edit form
      };

      avatarWrapper.appendChild(avatar);
      avatarWrapper.appendChild(nameLabel);
      container.appendChild(avatarWrapper);
    });
}

function renderAvatarsEdit() {
  const container = document.getElementById("avatarContainerEdit");
  if (!container) return;

  // Ambil ulang data dari localStorage
  people = loadFromLocalStorage("people") || [];
  who = loadFromLocalStorage("who") || [];

  container.innerHTML = "";

  if (people.length === 0) {
    const emptyText = document.createElement("div");
    emptyText.className = "empty-text";
    emptyText.textContent = "Tambahkan teman terlebih dahulu";
    container.appendChild(emptyText);
    return;
  }

  people
    .slice()
    .reverse()
    .forEach((person) => {
      const avatarWrapper = document.createElement("div");
      avatarWrapper.className = "avatar-wrapper";

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

        // Simpan update ke localStorage
        saveToLocalStorage("who", who);
        renderAvatars(); // render ulang
        renderAvatarsEdit(); // render ulang list on the edit form
        updateWhoField(); //update selection from avatar to field on the edit form
      };

      avatarWrapper.appendChild(avatar);
      avatarWrapper.appendChild(nameLabel);
      container.appendChild(avatarWrapper);
    });
}

function updateWhoField() {
  const whoField = document.getElementById("editWho");
  if (!whoField) return;

  // Update field dengan nama-nama yang dipilih dari avatar
  whoField.value = who.join(", ");
}

/**
 * Updates all additional expense avatar containers.
 * This function finds all additional expense avatar containers and re-renders them
 * to ensure they reflect the current list of people.
 */
function updateAllAdditionalExpenseAvatars() {
  // Find all additional expense avatar containers
  const avatarContainers = document.querySelectorAll(
    '[id^="avatarContainerAdditional-"]'
  );

  avatarContainers.forEach((container) => {
    const containerId = container.id;
    const uniqueId = containerId.replace("avatarContainerAdditional-", "");
    const hiddenInputId = `selectedPeopleAdditional-${uniqueId}`;

    // Check if the corresponding function exists before calling it
    if (typeof renderAvatarsForAdditionalExpense === "function") {
      renderAvatarsForAdditionalExpense(containerId, hiddenInputId);
    }
  });

  // Also update all additional expense paid-by dropdowns
  const paidBySelects = document.querySelectorAll(
    '[id^="additionalExpensePaidBy-"]'
  );
  paidBySelects.forEach((select) => {
    if (typeof populateAdditionalExpensePaidByDropdown === "function") {
      populateAdditionalExpensePaidByDropdown(select.id);
    }
  });
}

// 🔁 Helper functions

function saveToLocalStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadFromLocalStorage(key) {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : null;
}

//Panggil fungsi saat pertama render halaman
document.addEventListener("DOMContentLoaded", () => {
  updateDropdowns(); // ⬅️ ini harus dipanggil setelah DOM siap
  renderAvatars();
  renderPeople();
});

/**
 * Renders a list of avatars in the "#editPaidByContainer" element for single selection.
 *
 * This function retrieves the list of people from local storage and updates the container
 * with their avatars and names. Each avatar is generated using the Dicebear API and is clickable
 * to toggle its selection state. Only one avatar can be selected at a time. The selected state
 * is indicated with a visual change, and the selected person is saved back to local storage
 * as the 'paidBy' value for the edited expense.
 * If there are no people in the list, a message prompting the user to add friends is displayed instead.
 */
function renderAvatarsPaidBy(currentPaidBy) {
  const container = document.getElementById("editPaidByContainer");
  if (!container) return;

  people = loadFromLocalStorage("people") || [];
  container.innerHTML = "";

  if (people.length === 0) {
    const emptyText = document.createElement("div");
    emptyText.className = "empty-text";
    emptyText.textContent = "Tambahkan teman terlebih dahulu";
    container.appendChild(emptyText);
    return;
  }

  people
    .slice()
    .reverse()
    .forEach((person) => {
      const avatarWrapper = document.createElement("div");
      avatarWrapper.className = "avatar-wrapper";

      const avatar = document.createElement("img");
      avatar.className = `avatar-img ${
        currentPaidBy === person ? "selected" : ""
      }`;
      avatar.src = `https://api.dicebear.com/9.x/personas/svg?backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&size=32&scale=100&seed=${encodeURIComponent(
        person
      )}`;
      avatar.alt = person;

      const nameLabel = document.createElement("div");
      nameLabel.className = "avatar-name";
      nameLabel.textContent = person;

      avatar.onclick = () => {
        // Deselect all other avatars
        const allAvatars = container.querySelectorAll(".avatar-img");
        allAvatars.forEach((img) => img.classList.remove("selected"));

        // Select the clicked avatar
        avatar.classList.add("selected");

        // Update the hidden input or a global variable for paidBy
        // For now, we'll just update a data attribute on the container
        container.dataset.paidBy = person;
      };

      avatarWrapper.appendChild(avatar);
      avatarWrapper.appendChild(nameLabel);
      container.appendChild(avatarWrapper);
    });
}
