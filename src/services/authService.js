// API service for authentication endpoints
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const USER_STORAGE_KEY = "mindmate_user";
const TOKEN_STORAGE_KEY = "mindmate_token";

function emitAuthChange() {
  window.dispatchEvent(new Event("mindmate-auth-change"));
}

export const authService = {
  /**
   * Register a new student
   */
  async registerStudent(name, email, studentId, password) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
        studentId,
        role: "student",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    if (data.user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
    }

    if (data.token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    }

    emitAuthChange();

    return data;
  },

  /**
   * Register a new expert
   */
  async registerExpert(
    name,
    email,
    password,
    specialization,
    qualifications,
    licenseNumber,
  ) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
        specialization,
        qualifications,
        licenseNumber,
        role: "expert",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    return data;
  },

  /**
   * Login user
   */
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    if (data.token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    }

    if (data.user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
    }

    emitAuthChange();

    return data;
  },

  /**
   * Request password reset link
   */
  async forgotPassword(email) {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Request failed");
    return data;
  },

  /**
   * Reset password using token
   */
  async resetPassword(token, password) {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Reset failed");
    return data;
  },

  /**
   * Fetch student registry entries for admins
   */
  async getStudentRegistry({ q = "", limit = 50, offset = 0 } = {}) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("limit", String(limit));
    params.set("offset", String(offset));

    const response = await fetch(
      `${API_BASE_URL}/student-registry?${params.toString()}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),
        },
      },
    );

    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to fetch registry");
    return data;
  },

  /**
   * Add a student registry entry for admins
   */
  async createStudentRegistryEntry(registrationNo, email) {
    const response = await fetch(`${API_BASE_URL}/student-registry`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ registration_no: registrationNo, email }),
    });

    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to create registry entry");
    return data;
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser() {
    const user = localStorage.getItem(USER_STORAGE_KEY);
    return user ? JSON.parse(user) : null;
  },

  /**
   * Get the stored JWT token
   */
  getToken() {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  },

  /**
   * Return auth headers for authenticated requests
   */
  getAuthHeaders() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    emitAuthChange();
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getToken();
  },
};
