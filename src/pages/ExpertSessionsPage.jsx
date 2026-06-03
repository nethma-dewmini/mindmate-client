import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaBookOpen,
  FaTrashAlt,
  FaPlusCircle,
  FaVideo,
  FaUsers,
  FaEdit,
  FaCheck,
  FaTimes,
  FaEnvelope,
} from "react-icons/fa";
import { authService } from "../services/authService";

const ExpertSessionsPage = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states for creating a new session
  const [formData, setFormData] = useState({
    sessionDate: "",
    startTime: "",
    endTime: "",
    topic: "",
    content: "",
    meetingLink: "",
    meetingDetails: "",
  });

  // States for inline editing meeting details of an existing session
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editMeetingData, setEditMeetingData] = useState({
    meetingLink: "",
    meetingDetails: "",
  });
  const [deleteSessionId, setDeleteSessionId] = useState(null);

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

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditMeetingData((prev) => ({
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
        meetingLink: formData.meetingLink,
        meetingDetails: formData.meetingDetails,
      });

      setSuccess("Session scheduled successfully!");
      setFormData({
        sessionDate: "",
        startTime: "",
        endTime: "",
        topic: "",
        content: "",
        meetingLink: "",
        meetingDetails: "",
      });
      await loadSessions();
    } catch (err) {
      setError(err.message || "Failed to create session.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditMeetingSubmit = async (sessionId) => {
    setError("");
    setSuccess("");

    try {
      await authService.updateSessionMeeting(sessionId, {
        meetingLink: editMeetingData.meetingLink,
        meetingDetails: editMeetingData.meetingDetails,
      });
      setSuccess("Meeting link and joining details updated successfully!");
      setEditingSessionId(null);
      await loadSessions();
    } catch (err) {
      setError(err.message || "Failed to update meeting details.");
    }
  };

  const startEditingMeeting = (session) => {
    setEditingSessionId(session.id);
    setEditMeetingData({
      meetingLink: session.meeting_link || "",
      meetingDetails: session.meeting_details || "",
    });
  };

  const handleDelete = (sessionId) => {
    setDeleteSessionId(sessionId);
  };

  const confirmDeleteSession = async () => {
    if (!deleteSessionId) return;

    setError("");
    setSuccess("");

    try {
      await authService.deleteSession(deleteSessionId);
      setSuccess("Session cancelled successfully.");
      await loadSessions();
    } catch (err) {
      setError(err.message || "Failed to delete session.");
    } finally {
      setDeleteSessionId(null);
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
              Schedule upcoming sessions held so university students can view, book, and join them.
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
                    Meeting Link (optional)
                  </label>
                  <input
                    type="url"
                    name="meetingLink"
                    placeholder="e.g. https://zoom.us/j/..."
                    value={formData.meetingLink}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5bb5a1] bg-[#fdfbf7] placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Joining Instructions (optional)
                  </label>
                  <textarea
                    name="meetingDetails"
                    rows={2}
                    placeholder="e.g. Enter password '123' to join the waiting room."
                    value={formData.meetingDetails}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5bb5a1] bg-[#fdfbf7] placeholder-gray-400 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Description / Content
                  </label>
                  <textarea
                    name="content"
                    rows={3}
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
                <div className="space-y-6">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow bg-[#fdfbf7]"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-2 flex-grow">
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
                            <p className="text-sm text-gray-600 mt-2 whitespace-pre-line leading-relaxed">
                              {session.content}
                            </p>
                          )}

                          {/* Meeting Link / Instructions Block */}
                          <div className="mt-4 pt-3 border-t border-gray-100">
                            {editingSessionId === session.id ? (
                              <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <h4 className="text-sm font-semibold text-gray-700">Update Meeting Details</h4>
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">Meeting Link</label>
                                  <input
                                    type="url"
                                    name="meetingLink"
                                    placeholder="https://zoom.us/j/..."
                                    value={editMeetingData.meetingLink}
                                    onChange={handleEditChange}
                                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5bb5a1]"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">Instructions / Details</label>
                                  <textarea
                                    name="meetingDetails"
                                    rows={2}
                                    placeholder="Enter access details or codes..."
                                    value={editMeetingData.meetingDetails}
                                    onChange={handleEditChange}
                                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5bb5a1] resize-none"
                                  />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => setEditingSessionId(null)}
                                    className="px-3 py-1 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 flex items-center gap-1"
                                  >
                                    <FaTimes size={10} /> Cancel
                                  </button>
                                  <button
                                    onClick={() => handleEditMeetingSubmit(session.id)}
                                    className="px-3 py-1 text-xs font-medium rounded-lg bg-[#5bb5a1] text-white hover:bg-[#4a9d8b] flex items-center gap-1"
                                  >
                                    <FaCheck size={10} /> Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                    <FaVideo className="text-[#5bb5a1]" /> Meeting Details
                                  </span>
                                  <button
                                    onClick={() => startEditingMeeting(session)}
                                    className="text-xs text-[#5bb5a1] hover:underline flex items-center gap-1"
                                  >
                                    <FaEdit size={11} /> {session.meeting_link ? "Edit Link" : "Add Link"}
                                  </button>
                                </div>
                                {session.meeting_link ? (
                                  <div className="text-sm bg-teal-50/30 border border-teal-100/50 p-3 rounded-xl">
                                    <p className="text-xs text-gray-400">Meeting Link:</p>
                                    <a
                                      href={session.meeting_link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-[#5bb5a1] hover:underline font-medium break-all block mt-0.5"
                                    >
                                      {session.meeting_link}
                                    </a>
                                    {session.meeting_details && (
                                      <div className="mt-2 text-xs text-gray-600">
                                        <p className="text-gray-400">Instructions:</p>
                                        <p className="mt-0.5 whitespace-pre-line">{session.meeting_details}</p>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-xs text-gray-400 italic">No link provided yet.</p>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Booked Students List */}
                          <div className="mt-4 pt-3 border-t border-gray-100 bg-gray-50/50 p-4 rounded-xl">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1 mb-2">
                              <FaUsers className="text-[#5bb5a1]" /> Booked Students ({session.attendees?.length || 0})
                            </span>
                            {session.attendees && session.attendees.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                {session.attendees.map((attendee) => (
                                  <div
                                    key={attendee.id}
                                    className="bg-white border border-gray-100 rounded-lg p-2.5 flex items-center gap-2 shadow-xs"
                                  >
                                    <div className="w-8 h-8 rounded-full bg-teal-50 text-[#5bb5a1] flex items-center justify-center font-bold text-xs shrink-0">
                                      {attendee.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold text-gray-700 truncate">{attendee.name}</p>
                                      <p className="text-[10px] text-gray-400 truncate flex items-center gap-0.5 mt-0.5">
                                        <FaEnvelope size={9} /> {attendee.email}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-400 italic">No student bookings yet.</p>
                            )}
                          </div>
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

      {deleteSessionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
          <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm transition-opacity" onClick={() => setDeleteSessionId(null)}></div>
          <div className="relative w-full max-w-sm mx-auto my-6 p-6 bg-white rounded-2xl shadow-xl z-50 border border-gray-100 animate-in fade-in zoom-in-95 duration-200 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4 mx-auto">
              <span className="text-xl font-bold">🗑️</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Cancel Session?</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Are you sure you want to cancel this scheduled session? This action will permanently remove it.
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteSessionId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={confirmDeleteSession}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors"
              >
                Cancel Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpertSessionsPage;
