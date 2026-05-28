import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaBookOpen,
  FaTrashAlt,
  FaPlusCircle,
} from "react-icons/fa";
import { authService } from "../services/authService";

const ExpertSessionsPage = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [formData, setFormData] = useState({
    sessionDate: "",
    startTime: "",
    endTime: "",
    topic: "",
    content: "",
  });

  const currentUser = authService.getCurrentUser();

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await authService.getMySessions();
      setSessions(Array.isArray(data.sessions) ? data.sessions : []);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load sessions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/login");
      return;
    }

    if (currentUser?.role !== "expert" && currentUser?.role !== "admin") {
      navigate("/dashboard");
      return;
    }

    loadSessions();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.sessionDate || !formData.startTime || !formData.endTime || !formData.topic) {
      setError("Please fill in all required fields (Date, Start Time, End Time, Topic).");
      return;
    }

    setSubmitLoading(true);
    setError("");
    setSuccess("");

    // Helper function to format 24h string (e.g. "14:30") to 12h string (e.g. "02:30 PM")
    const formatTime12Hour = (timeStr) => {
      if (!timeStr) return "";
      const [hoursStr, minutesStr] = timeStr.split(":");
      let hours = parseInt(hoursStr, 10);
      const minutes = minutesStr;
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      const formattedHours = hours < 10 ? `0${hours}` : hours;
      return `${formattedHours}:${minutes} ${ampm}`;
    };

    const sessionTime = `${formatTime12Hour(formData.startTime)} - ${formatTime12Hour(formData.endTime)}`;

    try {
      await authService.createSession({
        sessionDate: formData.sessionDate,
        sessionTime,
        topic: formData.topic,
        content: formData.content,
      });

      setSuccess("Session scheduled successfully!");
      setFormData({
        sessionDate: "",
        startTime: "",
        endTime: "",
        topic: "",
        content: "",
      });
      await loadSessions();
    } catch (err) {
      setError(err.message || "Failed to create session.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (sessionId) => {
    if (!window.confirm("Are you sure you want to cancel this scheduled session?")) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await authService.deleteSession(sessionId);
      setSuccess("Session cancelled successfully.");
      await loadSessions();
    } catch (err) {
      setError(err.message || "Failed to delete session.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f5e7]">
      {/* Page Header */}
      <div className="gradient-teal py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">
              <Link
                to="/expert/dashboard"
                className="hover:text-gray-800 transition-colors flex items-center gap-1.5"
              >
                <FaArrowLeft size={12} /> Dashboard
              </Link>
              <span>/</span>
              <span>Schedule</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FaCalendarAlt className="text-[#5bb5a1]" /> Availability & Sessions
            </h1>
            <p className="text-gray-600">
              Schedule upcoming sessions held so university students can view and join them.
            </p>
          </div>
          <Link
            to="/expert/dashboard"
            className="px-4 py-2 bg-white text-gray-700 rounded-lg flex items-center space-x-2 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all font-medium text-sm"
          >
            <FaArrowLeft />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Status Alerts */}
        {error && (
          <div className="mb-6 rounded-xl px-4 py-3 text-sm bg-rose-50 text-rose-800 border border-rose-100">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 rounded-xl px-4 py-3 text-sm bg-green-50 text-green-800 border border-green-100">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Session Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FaPlusCircle className="text-[#5bb5a1]" /> Schedule a Session
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Session Date *
                  </label>
                  <input
                    type="date"
                    name="sessionDate"
                    value={formData.sessionDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5bb5a1] bg-[#fdfbf7]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5bb5a1] bg-[#fdfbf7]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      End Time *
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5bb5a1] bg-[#fdfbf7]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Topic / Title *
                  </label>
                  <input
                    type="text"
                    name="topic"
                    placeholder="e.g. Mindfulness & Stress Relief"
                    value={formData.topic}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5bb5a1] bg-[#fdfbf7] placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Description / Content
                  </label>
                  <textarea
                    name="content"
                    rows={4}
                    placeholder="Provide details about what will be covered in the session..."
                    value={formData.content}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5bb5a1] bg-[#fdfbf7] placeholder-gray-400 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-full py-3 rounded-xl bg-[#5bb5a1] text-white font-medium hover:bg-[#4a9d8b] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitLoading ? "Scheduling..." : "Schedule Session"}
                </button>
              </form>
            </div>
          </div>

          {/* Scheduled Sessions List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-wide text-[#5bb5a1]">
                  Upcoming Schedule
                </p>
                <h2 className="text-2xl font-bold text-gray-800 mt-1">
                  Sessions you are holding
                </h2>
              </div>

              {loading ? (
                <div className="py-12 text-center text-gray-500 font-medium">
                  Loading scheduled sessions...
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
                  <p className="text-gray-500 font-medium mb-1">
                    No sessions scheduled yet.
                  </p>
                  <p className="text-sm text-gray-400">
                    Use the form on the left to add your first session.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow bg-[#fdfbf7]"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-2">
                          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <FaBookOpen className="text-[#5bb5a1] shrink-0" size={16} />
                            {session.topic}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <FaCalendarAlt className="text-gray-400" />
                              {new Date(session.session_date).toLocaleDateString(
                                undefined,
                                {
                                  weekday: "short",
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </span>
                            <span className="flex items-center gap-1">
                              <FaClock className="text-gray-400" />
                              {session.session_time}
                            </span>
                          </div>
                          {session.content && (
                            <p className="text-sm text-gray-600 mt-3 whitespace-pre-line leading-relaxed">
                              {session.content}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDelete(session.id)}
                          className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shrink-0"
                          title="Cancel Session"
                        >
                          <FaTrashAlt size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertSessionsPage;
