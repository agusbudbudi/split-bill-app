// API Configuration
const API_BASE_URL = "https://split-bill-backend-vercel.vercel.app";

// Authentication service
class AuthService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem("accessToken");
    this.refreshToken = localStorage.getItem("refreshToken");
  }

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
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Request failed");
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
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
    localStorage.setItem("refreshToken", refreshToken);
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

// UI Functions
function showLogin() {
  document.getElementById("loginForm").classList.remove("hidden");
  document.getElementById("registerForm").classList.add("hidden");
  document.getElementById("userDashboard").classList.add("hidden");
  clearMessages();
}

function showRegister() {
  document.getElementById("loginForm").classList.add("hidden");
  document.getElementById("registerForm").classList.remove("hidden");
  document.getElementById("userDashboard").classList.add("hidden");
  clearMessages();
}

function showDashboard(user) {
  document.getElementById("loginForm").classList.add("hidden");
  document.getElementById("registerForm").classList.add("hidden");
  document.getElementById("userDashboard").classList.remove("hidden");
  document.getElementById("userName").textContent = user.name;
  document.getElementById("userEmail").textContent = user.email;
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
  element.textContent = message;
  element.classList.remove("hidden");
}

function showSuccess(elementId, message) {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.classList.remove("hidden");
}

function clearMessages() {
  const messages = document.querySelectorAll(
    ".error-message, .success-message"
  );
  messages.forEach((msg) => msg.classList.add("hidden"));
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

// Event Listeners
document
  .getElementById("loginFormElement")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMessages();
    setLoading("loginBtn", "loginLoader", true);

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      const response = await authService.login({ email, password });
      showDashboard(response.user);
    } catch (error) {
      showError("loginError", error.message);
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

    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
      showError("registerError", "Password tidak cocok");
      setLoading("registerBtn", "registerLoader", false);
      return;
    }

    try {
      const response = await authService.register({
        name,
        email,
        password,
      });
      showSuccess(
        "registerSuccess",
        "Registrasi berhasil! Anda akan diarahkan ke dashboard..."
      );
      setTimeout(() => {
        showDashboard(response.user);
      }, 2000);
    } catch (error) {
      showError("registerError", error.message);
    } finally {
      setLoading("registerBtn", "registerLoader", false);
    }
  });

async function logout() {
  try {
    await authService.logout();
    showLogin();
  } catch (error) {
    console.error("Logout failed:", error);
    // Still logout locally even if server request fails
    authService.clearTokens();
    showLogin();
  }
}

// Initialize app
async function initApp() {
  if (authService.isLoggedIn()) {
    try {
      const response = await authService.getCurrentUser();
      showDashboard(response.user);
    } catch (error) {
      console.error("Failed to get current user:", error);
      authService.clearTokens();
      showLogin();
    }
  } else {
    showLogin();
  }
}

// Start the app
initApp();
