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
  async registerExpert(name, title, email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        title,
        email,
        password,
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
   * Submit an expert application with supporting documents
   */
  async submitExpertApplication({
    name,
    title,
    email,
    specialization,
    experience,
    documents,
  }) {
    const formData = new FormData();
    formData.append("name", name);
    if (title) formData.append("title", title);
    formData.append("email", email);
    if (specialization) formData.append("specialization", specialization);
    if (experience) formData.append("experience", experience);

    (documents || []).forEach((document) => {
      formData.append("documents", document);
    });

    const response = await fetch(`${API_BASE_URL}/expert-applications/apply`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Application submission failed");
    }

    return data;
  },

  /**
   * Check the latest expert application status by email
   */
  async getExpertApplicationStatus(email) {
    const response = await fetch(
      `${API_BASE_URL}/expert-applications/status?email=${encodeURIComponent(email)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to check application status");
    }

    return data;
  },

  /**
   * Upload a clinical resource document
   */
  async addClinicalResource({
    title,
    category,
    summary,
    document,
    videoUrl,
    type = "GUIDE",
  }) {
    const formData = new FormData();
    formData.append("title", title);
    if (category) formData.append("category", category);
    if (summary) formData.append("summary", summary);
    formData.append("type", type);
    formData.append("visibility", "public");

    if (document) {
      formData.append("document", document);
    } else if (videoUrl) {
      formData.append("videoUrl", videoUrl);
    }

    const response = await fetch(`${API_BASE_URL}/resources`, {
      method: "POST",
      headers: {
        ...this.getAuthHeaders(),
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Resource upload failed");
    }

    return data;
  },

  /**
   * Fetch resources uploaded by experts
   */
  async getExpertResources({ category, type } = {}) {
    const params = new URLSearchParams({ authorRole: "expert" });

    if (category) params.set("category", category);
    if (type) params.set("type", type);

    const response = await fetch(
      `${API_BASE_URL}/resources?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load resources");
    }

    return data;
  },

  /**
   * Fetch resources uploaded by the current expert
   */
  async getMyClinicalResources() {
    const response = await fetch(`${API_BASE_URL}/resources/me`, {
      method: "GET",
      headers: {
        ...this.getAuthHeaders(),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load your resources");
    }

    return data;
  },

  /**
   * Update an expert resource
   */
  async updateClinicalResource(
    resourceId,
    {
      title,
      category,
      summary,
      document,
      videoUrl,
      type = "GUIDE",
      visibility = "public",
    },
  ) {
    const formData = new FormData();
    formData.append("title", title);
    if (category !== undefined) formData.append("category", category);
    if (summary !== undefined) formData.append("summary", summary);
    formData.append("type", type);
    formData.append("visibility", visibility);

    if (document) {
      formData.append("document", document);
    } else if (videoUrl) {
      formData.append("videoUrl", videoUrl);
    }

    const response = await fetch(`${API_BASE_URL}/resources/${resourceId}`, {
      method: "PATCH",
      headers: {
        ...this.getAuthHeaders(),
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Resource update failed");
    }

    return data;
  },

  /**
   * Delete an expert resource
   */
  async deleteClinicalResource(resourceId) {
    const response = await fetch(`${API_BASE_URL}/resources/${resourceId}`, {
      method: "DELETE",
      headers: {
        ...this.getAuthHeaders(),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Resource delete failed");
    }

    return data;
  },

  /**
   * Login user
   */
  async login(email, password) {
    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: normalizedEmail,
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
