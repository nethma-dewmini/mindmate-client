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
    audioUrl,
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
    } else if (audioUrl) {
      formData.append("audioUrl", audioUrl);
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
      audioUrl,
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
    } else if (audioUrl) {
      formData.append("audioUrl", audioUrl);
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
   * Fetch public assessments for students
   */
  async getPublicAssessments() {
    const response = await fetch(`${API_BASE_URL}/assessments/public`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load assessments");
    }

    return data;
  },

  /**
   * Fetch a single assessment by id
   */
  async getAssessmentById(id) {
    const response = await fetch(`${API_BASE_URL}/assessments/${id}`, {
      method: "GET",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || "Failed to load assessment");
      error.status = response.status;
      throw error;
    }

    return data;
  },

  /**
   * Fetch assessments created by the current expert
   */
  async getMyAssessments() {
    const response = await fetch(`${API_BASE_URL}/assessments/me`, {
      method: "GET",
      headers: {
        ...this.getAuthHeaders(),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load your assessments");
    }

    return data;
  },

  /**
   * Create a new assessment
   */
  async createAssessment(payload) {
    const response = await fetch(`${API_BASE_URL}/assessments`, {
      method: "POST",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create assessment");
    }

    return data;
  },

  /**
   * Update an existing assessment
   */
  async updateAssessment(id, payload) {
    const response = await fetch(`${API_BASE_URL}/assessments/${id}`, {
      method: "PATCH",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update assessment");
    }

    return data;
  },

  /**
   * Delete an assessment
   */
  async deleteAssessment(id) {
    const response = await fetch(`${API_BASE_URL}/assessments/${id}`, {
      method: "DELETE",
      headers: {
        ...this.getAuthHeaders(),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete assessment");
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
  /**
   * Public: fetch peer groups (optionally publicOnly)
   */
  async getPeerGroups({ publicOnly = true } = {}) {
    const params = new URLSearchParams();
    if (publicOnly) params.set("publicOnly", "true");
    const resp = await fetch(
      `${API_BASE_URL}/peer-groups?${params.toString()}`,
    );
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.message || "Failed to load groups");
    return data;
  },

  // Admin: list all groups
  async adminGetPeerGroups() {
    const resp = await fetch(`${API_BASE_URL}/peer-groups`, {
      headers: { ...this.getAuthHeaders(), "Content-Type": "application/json" },
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.message || "Failed to load groups");
    return data;
  },

  async adminCreatePeerGroup({ name, description, is_public = true }) {
    const resp = await fetch(`${API_BASE_URL}/peer-groups`, {
      method: "POST",
      headers: { ...this.getAuthHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, is_public }),
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.message || "Failed to create group");
    return data;
  },

  async adminUpdatePeerGroup(id, updates) {
    const resp = await fetch(`${API_BASE_URL}/peer-groups/${id}`, {
      method: "PATCH",
      headers: { ...this.getAuthHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.message || "Failed to update group");
    return data;
  },

  async adminDeletePeerGroup(id) {
    const resp = await fetch(`${API_BASE_URL}/peer-groups/${id}`, {
      method: "DELETE",
      headers: { ...this.getAuthHeaders(), "Content-Type": "application/json" },
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.message || "Failed to delete group");
    return data;
  },

  async getPeerGroup(id) {
    const resp = await fetch(`${API_BASE_URL}/peer-groups/${id}`);
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.message || "Failed to load group");
    return data;
  },

  async getPeerGroupMessages(id) {
    const resp = await fetch(`${API_BASE_URL}/peer-groups/${id}/messages`);
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.message || "Failed to load messages");
    return data;
  },

  async joinPeerGroup(id, userId) {
    const resp = await fetch(`${API_BASE_URL}/peer-groups/${id}/join`, {
      method: "POST",
      headers: { ...this.getAuthHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.message || "Failed to join group");
    return data;
  },

  async leavePeerGroup(id, userId) {
    const resp = await fetch(`${API_BASE_URL}/peer-groups/${id}/leave`, {
      method: "POST",
      headers: { ...this.getAuthHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.message || "Failed to leave group");
    return data;
  },

  async postPeerGroupMessage(id, { userId, content, metadata = {} }) {
    const resp = await fetch(`${API_BASE_URL}/peer-groups/${id}/messages`, {
      method: "POST",
      headers: { ...this.getAuthHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, content, metadata }),
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.message || "Failed to post message");
    return data;
  },

  async reactToPeerGroupMessage(id, messageId, { userId, type }) {
    const resp = await fetch(
      `${API_BASE_URL}/peer-groups/${id}/messages/${messageId}/reactions`,
      {
        method: "POST",
        headers: {
          ...this.getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId, type }),
      },
    );
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.message || "Failed to react");
    return data;
  },

  async adminDeletePeerGroupMessage(groupId, messageId) {
    const resp = await fetch(
      `${API_BASE_URL}/peer-groups/${groupId}/messages/${messageId}`,
      {
        method: "DELETE",
        headers: {
          ...this.getAuthHeaders(),
          "Content-Type": "application/json",
        },
      },
    );
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.message || "Failed to delete message");
    return data;
  },

  /**
   * Create a new group session (expert)
   */
  async createSession({ sessionDate, sessionTime, topic, content, meetingLink, meetingDetails }) {
    const response = await fetch(`${API_BASE_URL}/sessions`, {
      method: "POST",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_date: sessionDate,
        session_time: sessionTime,
        topic,
        content,
        meeting_link: meetingLink,
        meeting_details: meetingDetails,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to create session");
    }

    return data;
  },

  /**
   * Retrieve group sessions created by the current expert
   */
  async getMySessions() {
    const response = await fetch(`${API_BASE_URL}/sessions/me`, {
      method: "GET",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to load sessions");
    }

    return data;
  },

  /**
   * Delete a group session by ID (expert/admin)
   */
  async deleteSession(sessionId) {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
      method: "DELETE",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to delete session");
    }

    return data;
  },

  /**
   * Fetch all group sessions (public)
   */
  async getSessions() {
    const response = await fetch(`${API_BASE_URL}/sessions`, {
      method: "GET",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to load sessions");
    }

    return data;
  },

  /**
   * Book a group session (student)
   */
  async bookSession(sessionId) {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/book`, {
      method: "POST",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to book session");
    }

    return data;
  },

  /**
   * Cancel a group session booking (student)
   */
  async cancelSessionBooking(sessionId) {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/cancel`, {
      method: "POST",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to cancel booking");
    }

    return data;
  },

  /**
   * Update session meeting link and details (expert)
   */
  async updateSessionMeeting(sessionId, { meetingLink, meetingDetails }) {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
      method: "PATCH",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        meeting_link: meetingLink,
        meeting_details: meetingDetails,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to update meeting details");
    }

    return data;
  },

  /**
   * Create a new mood entry (student)
   */
  async createMoodEntry({ mood, note }) {
    const response = await fetch(`${API_BASE_URL}/moods`, {
      method: "POST",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mood,
        note,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to save mood entry");
    }

    return data;
  },

  /**
   * Fetch recent mood entries for the current student
   */
  async getMoodEntries(limit = 50) {
    const response = await fetch(`${API_BASE_URL}/moods?limit=${limit}`, {
      method: "GET",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to load mood entries");
    }

    return data;
  },

  /**
   * Fetch mood summary statistics (student)
   */
  async getMoodSummary(days = 30) {
    const response = await fetch(`${API_BASE_URL}/moods/summary?days=${days}`, {
      method: "GET",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to load mood summary");
    }

    return data;
  },

  /**
   * Delete a mood entry (student)
   */
  async deleteMoodEntry(id) {
    const response = await fetch(`${API_BASE_URL}/moods/${id}`, {
      method: "DELETE",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to delete mood entry");
    }

    return data;
  },

  /**
   * Register a new admin
   */
  async registerAdmin(name, email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
        role: "admin",
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Admin registration failed");
    }

    return data;
  },
};
