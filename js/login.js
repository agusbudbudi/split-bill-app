// API Configuration
const API_BASE_URL = "https://split-bill-backend-vercel.vercel.app";

// Enhanced Authentication service
class AuthService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem("accessToken");
    this.refreshToken = localStorage.getItem("refreshToken");
    this.tokenRefreshPromise = null;
  }

  // Enhanced request method with automatic token refresh
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      let response = await fetch(url, config);

      // If token expired, try to refresh
      if (
        response.status === 401 &&
        this.refreshToken &&
        !options.skipRefresh
      ) {
        const refreshed = await this.refreshTokens();
        if (refreshed) {
          config.headers.Authorization = `Bearer ${this.token}`;
          response = await fetch(url, config);
        }
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Request failed");
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Token refresh method
  async refreshTokens() {
    if (!this.refreshToken) return false;

    // Prevent multiple simultaneous refresh requests
    if (this.tokenRefreshPromise) {
      return await this.tokenRefreshPromise;
    }

    this.tokenRefreshPromise = this.performTokenRefresh();
    const result = await this.tokenRefreshPromise;
    this.tokenRefreshPromise = null;
    return result;
  }

  async performTokenRefresh() {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.setTokens(
          data.accessToken,
          data.refreshToken || this.refreshToken
        );
        return true;
      } else {
        this.clearTokens();
        return false;
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      this.clearTokens();
      return false;
    }
  }

  async register(userData) {
    const response = await this.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    if (response.accessToken) {
      this.setTokens(response.accessToken, response.refreshToken);
    }

    return response;
  }

  async login(credentials) {
    const response = await this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (response.accessToken) {
      this.setTokens(response.accessToken, response.refreshToken);
    }

    return response;
  }

  async logout() {
    try {
      await this.request("/api/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });
    } catch (error) {
      console.warn("Logout request failed:", error);
    } finally {
      this.clearTokens();
    }
  }

  async getCurrentUser() {
    return await this.request("/api/auth/me");
  }

  setTokens(accessToken, refreshToken) {
    this.token = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem("accessToken", accessToken);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
  }

  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }

  isLoggedIn() {
    return !!this.token;
  }
}

// Initialize auth service
const authService = new AuthService();

// Enhanced validation functions
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePassword(password) {
  const checks = {
    length: password.length >= 6,
    hasNumber: /\d/.test(password),
    hasLetter: /[a-zA-Z]/.test(password),
  };

  return {
    isValid: checks.length && (checks.hasNumber || checks.hasLetter),
    strength: Object.values(checks).filter(Boolean).length,
    checks,
  };
}

function validateName(name) {
  return name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name.trim());
}

// Enhanced UI Functions
function showLogin() {
  document.getElementById("loginForm").classList.remove("hidden");
  document.getElementById("registerForm").classList.add("hidden");
  document.getElementById("userDashboard").classList.add("hidden");
  clearMessages();
  clearFieldValidation();
}

function showRegister() {
  document.getElementById("loginForm").classList.add("hidden");
  document.getElementById("registerForm").classList.remove("hidden");
  document.getElementById("userDashboard").classList.add("hidden");
  clearMessages();
  clearFieldValidation();
}

function showDashboard(user) {
  document.getElementById("loginForm").classList.remove("hidden");
  document.getElementById("registerForm").classList.add("hidden");
  document.getElementById("userDashboard").classList.remove("hidden");
  document.getElementById("userName").textContent = user.name;
  // document.getElementById("userEmail").textContent = user.email;
}

function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const icon = input.nextElementSibling.querySelector("i");

  if (input.type === "password") {
    input.type = "text";
    icon.classList.remove("uil-eye");
    icon.classList.add("uil-eye-slash");
  } else {
    input.type = "password";
    icon.classList.remove("uil-eye-slash");
    icon.classList.add("uil-eye");
  }
}

function showError(elementId, message) {
  const element = document.getElementById(elementId);
  const span = element.querySelector("span");
  if (span) {
    span.textContent = message;
  } else {
    element.textContent = message;
  }
  element.classList.remove("hidden");
}

function showSuccess(elementId, message) {
  const element = document.getElementById(elementId);
  const span = element.querySelector("span");
  if (span) {
    span.textContent = message;
  } else {
    element.textContent = message;
  }
  element.classList.remove("hidden");
}

function clearMessages() {
  const messages = document.querySelectorAll(
    ".error-message, .success-message"
  );
  messages.forEach((msg) => msg.classList.add("hidden"));
}

function clearFieldValidation() {
  const inputs = document.querySelectorAll("input");
  inputs.forEach((input) => {
    input.classList.remove("field-error", "field-success");
  });
}

function setFieldValidation(fieldId, isValid) {
  const field = document.getElementById(fieldId);
  field.classList.remove("field-error", "field-success");
  field.classList.add(isValid ? "field-success" : "field-error");
}

function setLoading(buttonId, loaderId, isLoading) {
  const button = document.getElementById(buttonId);
  const loader = document.getElementById(loaderId);

  if (isLoading) {
    button.disabled = true;
    loader.classList.remove("hidden");
  } else {
    button.disabled = false;
    loader.classList.add("hidden");
  }
}

function getErrorMessage(error) {
  const message = error.message.toLowerCase();

  if (
    message.includes("401") ||
    message.includes("unauthorized") ||
    message.includes("invalid credentials")
  ) {
    return "Email atau password salah";
  } else if (
    message.includes("409") ||
    message.includes("conflict") ||
    message.includes("already exists")
  ) {
    return "Email sudah terdaftar";
  } else if (message.includes("400") || message.includes("bad request")) {
    return "Data yang dimasukkan tidak valid";
  } else if (message.includes("network") || message.includes("fetch")) {
    return "Koneksi bermasalah, coba lagi";
  } else if (message.includes("server") || message.includes("500")) {
    return "Server sedang bermasalah, coba lagi nanti";
  }

  return error.message || "Terjadi kesalahan, coba lagi";
}

// Real-time validation
document.addEventListener("DOMContentLoaded", function () {
  // Email validation
  const loginEmail = document.getElementById("loginEmail");
  const registerEmail = document.getElementById("registerEmail");

  [loginEmail, registerEmail].forEach((email) => {
    if (email) {
      email.addEventListener("blur", function () {
        if (this.value) {
          setFieldValidation(this.id, validateEmail(this.value));
        }
      });
    }
  });

  // Name validation
  const registerName = document.getElementById("registerName");
  if (registerName) {
    registerName.addEventListener("blur", function () {
      if (this.value) {
        setFieldValidation(this.id, validateName(this.value));
      }
    });
  }

  // Password strength indicator
  const registerPassword = document.getElementById("registerPassword");
  const passwordStrength = document.getElementById("passwordStrength");

  if (registerPassword && passwordStrength) {
    registerPassword.addEventListener("input", function () {
      const validation = validatePassword(this.value);

      if (this.value.length === 0) {
        passwordStrength.textContent = "";
        return;
      }

      let strengthText = "";
      let strengthColor = "";

      if (validation.strength === 1) {
        strengthText = "Lemah";
        strengthColor = "#dc2626";
      } else if (validation.strength === 2) {
        strengthText = "Sedang";
        strengthColor = "#f59e0b";
      } else if (validation.strength === 3) {
        strengthText = "Kuat";
        strengthColor = "#16a34a";
      }

      passwordStrength.textContent = `Kekuatan password: ${strengthText}`;
      passwordStrength.style.color = strengthColor;
    });
  }

  // Confirm password validation
  const confirmPassword = document.getElementById("confirmPassword");
  if (confirmPassword && registerPassword) {
    confirmPassword.addEventListener("input", function () {
      if (this.value) {
        const isMatch = this.value === registerPassword.value;
        setFieldValidation(this.id, isMatch);
      }
    });
  }
});

// Enhanced Event Listeners
document
  .getElementById("loginFormElement")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMessages();
    setLoading("loginBtn", "loginLoader", true);

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    // Client-side validation
    if (!validateEmail(email)) {
      showError("loginError", "Format email tidak valid");
      setFieldValidation("loginEmail", false);
      setLoading("loginBtn", "loginLoader", false);
      return;
    }

    if (password.length < 6) {
      showError("loginError", "Password minimal 6 karakter");
      setFieldValidation("loginPassword", false);
      setLoading("loginBtn", "loginLoader", false);
      return;
    }

    try {
      const response = await authService.login({ email, password });

      // Store user data for profile page
      localStorage.setItem("currentUser", JSON.stringify(response.user));

      // Redirect immediately to index.html after successful login
      window.location.href = "index.html";
    } catch (error) {
      showError("loginError", getErrorMessage(error));
    } finally {
      setLoading("loginBtn", "loginLoader", false);
    }
  });

document
  .getElementById("registerFormElement")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMessages();
    setLoading("registerBtn", "registerLoader", true);

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Enhanced client-side validation
    let hasError = false;

    if (!validateName(name)) {
      showError(
        "registerError",
        "Nama harus minimal 2 karakter dan hanya berisi huruf"
      );
      setFieldValidation("registerName", false);
      hasError = true;
    }

    if (!validateEmail(email)) {
      showError("registerError", "Format email tidak valid");
      setFieldValidation("registerEmail", false);
      hasError = true;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      showError(
        "registerError",
        "Password minimal 6 karakter dan harus mengandung huruf atau angka"
      );
      setFieldValidation("registerPassword", false);
      hasError = true;
    }

    if (password !== confirmPassword) {
      showError("registerError", "Konfirmasi password tidak cocok");
      setFieldValidation("confirmPassword", false);
      hasError = true;
    }

    if (hasError) {
      setLoading("registerBtn", "registerLoader", false);
      return;
    }

    try {
      const response = await authService.register({
        name,
        email,
        password,
      });

      // Store user data for profile page
      localStorage.setItem("currentUser", JSON.stringify(response.user));

      showSuccess("registerSuccess", "Yeay registrasi berhasil...");

      // Redirect to index.html after successful registration
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);
    } catch (error) {
      showError("registerError", getErrorMessage(error));
    } finally {
      setLoading("registerBtn", "registerLoader", false);
    }
  });

async function logout() {
  try {
    setLoading("logoutBtn", "logoutLoader", true);
    await authService.logout();
    showLogin();
  } catch (error) {
    console.error("Logout failed:", error);
    // Still logout locally even if server request fails
    authService.clearTokens();
    showLogin();
  }
}

// Enhanced app initialization
async function initApp() {
  if (authService.isLoggedIn()) {
    try {
      const response = await authService.getCurrentUser();

      showDashboard(response.user);

      // window.location.href = "index.html";
    } catch (error) {
      console.error("Failed to get current user:", error);
      // If token is invalid, clear it and show login
      if (
        error.message.includes("401") ||
        error.message.includes("unauthorized")
      ) {
        authService.clearTokens();
      }
      showLogin();
    }
  } else {
    showLogin();
  }
}

// Auto-save form data to prevent data loss (but not passwords)
function saveFormData() {
  const loginEmail = document.getElementById("loginEmail").value;
  const registerName = document.getElementById("registerName").value;
  const registerEmail = document.getElementById("registerEmail").value;

  if (loginEmail) sessionStorage.setItem("loginEmail", loginEmail);
  if (registerName) sessionStorage.setItem("registerName", registerName);
  if (registerEmail) sessionStorage.setItem("registerEmail", registerEmail);
}

function loadFormData() {
  const loginEmail = sessionStorage.getItem("loginEmail");
  const registerName = sessionStorage.getItem("registerName");
  const registerEmail = sessionStorage.getItem("registerEmail");

  if (loginEmail) document.getElementById("loginEmail").value = loginEmail;
  if (registerName)
    document.getElementById("registerName").value = registerName;
  if (registerEmail)
    document.getElementById("registerEmail").value = registerEmail;
}

// Add form data saving on input
document.addEventListener("DOMContentLoaded", function () {
  loadFormData();

  // Save form data on input (except passwords)
  ["loginEmail", "registerName", "registerEmail"].forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener("input", saveFormData);
    }
  });
});

// Clear saved form data on successful login/register
function clearSavedFormData() {
  sessionStorage.removeItem("loginEmail");
  sessionStorage.removeItem("registerName");
  sessionStorage.removeItem("registerEmail");
}

// Enhanced keyboard navigation
document.addEventListener("keydown", function (e) {
  // Enter key on inputs should move to next field or submit
  if (e.key === "Enter" && e.target.tagName === "INPUT") {
    const form = e.target.closest("form");
    const inputs = Array.from(form.querySelectorAll("input"));
    const currentIndex = inputs.indexOf(e.target);

    if (currentIndex < inputs.length - 1) {
      e.preventDefault();
      inputs[currentIndex + 1].focus();
    }
  }

  // Escape key to clear messages
  if (e.key === "Escape") {
    clearMessages();
  }
});

// Network status handling
function handleNetworkStatus() {
  if (!navigator.onLine) {
    showError("loginError", "Tidak ada koneksi internet");
    showError("registerError", "Tidak ada koneksi internet");
  }
}

window.addEventListener("online", function () {
  clearMessages();
});

window.addEventListener("offline", handleNetworkStatus);

// Session timeout warning
let sessionWarningTimer;
let sessionTimeoutTimer;

function startSessionTimers() {
  clearSessionTimers();

  // Warn user 5 minutes before token expires (assuming 30 min token)
  sessionWarningTimer = setTimeout(() => {
    if (authService.isLoggedIn()) {
      const shouldContinue = confirm(
        "Sesi Anda akan berakhir dalam 5 menit. Klik OK untuk memperpanjang sesi."
      );
      if (shouldContinue) {
        // Try to refresh token
        authService.refreshTokens().catch(() => {
          alert("Gagal memperpanjang sesi. Silakan login kembali.");
          logout();
        });
      }
    }
  }, 25 * 60 * 1000); // 25 minutes

  // Auto logout after 30 minutes of inactivity
  sessionTimeoutTimer = setTimeout(() => {
    if (authService.isLoggedIn()) {
      alert("Sesi Anda telah berakhir. Silakan login kembali.");
      logout();
    }
  }, 30 * 60 * 1000); // 30 minutes
}

function clearSessionTimers() {
  if (sessionWarningTimer) clearTimeout(sessionWarningTimer);
  if (sessionTimeoutTimer) clearTimeout(sessionTimeoutTimer);
}

function resetSessionTimers() {
  if (authService.isLoggedIn()) {
    startSessionTimers();
  }
}

// Reset session timers on user activity
["mousedown", "mousemove", "keypress", "scroll", "touchstart"].forEach(
  (event) => {
    document.addEventListener(event, resetSessionTimers, true);
  }
);

// Enhanced error recovery
window.addEventListener("unhandledrejection", function (event) {
  console.error("Unhandled promise rejection:", event.reason);

  // Handle authentication errors globally
  if (
    event.reason &&
    event.reason.message &&
    event.reason.message.includes("401")
  ) {
    authService.clearTokens();
    showLogin();
    showError("loginError", "Sesi Anda telah berakhir. Silakan login kembali.");
  }
});

// Start the app
initApp();

// Start session timers if user is logged in
if (authService.isLoggedIn()) {
  startSessionTimers();
}

// Export functions for external use if needed
window.SplitBillAuth = {
  authService,
  showLogin,
  showRegister,
  logout,
  isLoggedIn: () => authService.isLoggedIn(),
  getCurrentUser: () => authService.getCurrentUser(),
};
