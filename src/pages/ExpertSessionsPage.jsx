import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
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

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: { duration: 0.15 },
  },
};

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f5e7] py-10 px-6 relative overflow-hidden flex items-center justify-center">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-80 h-80 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2c6e5f] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-[#2c6e5f] animate-pulse">Loading availability...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f5e7] py-10 px-6 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Page Header */}
      <div className="max-w-6xl mx-auto mb-8 pb-4 border-b border-[#2c6e5f]/10">
        <h1 className="text-3xl font-extrabold text-[#1b4d42] tracking-tight flex items-center gap-2">
          <FaCalendarAlt className="text-[#2c6e5f] shrink-0 animate-float" /> Availability & Sessions
        </h1>
        <p className="text-[#2c6e5f]/80 mt-1 font-medium max-w-2xl leading-relaxed text-sm md:text-base">
          Schedule upcoming sessions held so university students can view, book, and join them.
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Status Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 rounded-2xl px-4 py-3.5 text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-100 shadow-sm"
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 rounded-2xl px-4 py-3.5 text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100 shadow-sm"
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Session Form */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-3xl p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 pb-3 border-b border-gray-100">
                <FaPlusCircle className="text-[#2c6e5f]" /> Schedule a Session
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Session Date *
                  </label>
                  <input
                    type="date"
                    name="sessionDate"
                    value={formData.sessionDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#2c6e5f] focus:ring-4 focus:ring-[#2c6e5f]/10 focus:outline-none bg-white font-medium text-gray-700 transition-all duration-300 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#2c6e5f] focus:ring-4 focus:ring-[#2c6e5f]/10 focus:outline-none bg-white font-medium text-gray-700 transition-all duration-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      End Time *
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#2c6e5f] focus:ring-4 focus:ring-[#2c6e5f]/10 focus:outline-none bg-white font-medium text-gray-700 transition-all duration-300 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Topic / Title *
                  </label>
                  <input
                    type="text"
                    name="topic"
                    placeholder="e.g. Mindfulness & Stress Relief"
                    value={formData.topic}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#2c6e5f] focus:ring-4 focus:ring-[#2c6e5f]/10 focus:outline-none bg-white font-medium text-gray-700 transition-all duration-300 placeholder-gray-450 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Meeting Link (optional)
                  </label>
                  <input
                    type="url"
                    name="meetingLink"
                    placeholder="e.g. https://zoom.us/j/..."
                    value={formData.meetingLink}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#2c6e5f] focus:ring-4 focus:ring-[#2c6e5f]/10 focus:outline-none bg-white font-medium text-gray-700 transition-all duration-300 placeholder-gray-450 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Joining Instructions (optional)
                  </label>
                  <textarea
                    name="meetingDetails"
                    rows={2}
                    placeholder="e.g. Enter password '123' to join the waiting room."
                    value={formData.meetingDetails}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#2c6e5f] focus:ring-4 focus:ring-[#2c6e5f]/10 focus:outline-none bg-white font-medium text-gray-700 transition-all duration-300 placeholder-gray-450 text-xs resize-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Description / Content
                  </label>
                  <textarea
                    name="content"
                    rows={3}
                    placeholder="Provide details about what will be covered in the session..."
                    value={formData.content}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#2c6e5f] focus:ring-4 focus:ring-[#2c6e5f]/10 focus:outline-none bg-white font-medium text-gray-700 transition-all duration-300 placeholder-gray-450 text-xs resize-none leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-full py-3 rounded-xl bg-[#2c6e5f] hover:bg-[#1b4d42] active:scale-95 text-white font-extrabold text-xs shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {submitLoading ? "Scheduling..." : "Schedule Session"}
                </button>
              </form>
            </div>
          </div>

          {/* Scheduled Sessions List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-3xl p-6">
              <div className="mb-6 pb-3 border-b border-gray-100">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#2c6e5f]">
                  Upcoming Schedule
                </p>
                <h2 className="text-2xl font-bold text-gray-805 mt-0.5">
                  Sessions you are holding
                </h2>
              </div>

              {sessions.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl bg-gray-50/20 shadow-sm flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-[#2c6e5f]/5 flex items-center justify-center text-xl mb-4 text-[#2c6e5f]">
                    📅
                  </div>
                  <h3 className="text-sm font-bold text-gray-850 mb-1">No sessions scheduled yet</h3>
                  <p className="text-xs text-gray-400 max-w-xs">
                    Use the form on the left to add and schedule your first session.
                  </p>
                </div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="space-y-6"
                >
                  <AnimatePresence mode="popLayout">
                    {sessions.map((session) => (
                      <motion.div
                        layout
                        variants={cardVariants}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                        whileHover={{ y: -4 }}
                        key={session.id}
                        className="border border-gray-150 rounded-2xl p-5 shadow-sm hover:shadow-md bg-white hover:border-[#2c6e5f]/30 transition-all duration-300 relative group flex flex-col justify-between"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-2 flex-grow">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 transition-colors duration-250 group-hover:text-[#2c6e5f]">
                              <FaBookOpen className="text-[#2c6e5f] shrink-0" size={16} />
                              {session.topic}
                            </h3>
                            
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-450 font-semibold">
                              <span className="flex items-center gap-1.5">
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
                              <span className="flex items-center gap-1.5">
                                <FaClock className="text-gray-400" />
                                {session.session_time}
                              </span>
                            </div>

                            {session.content && (
                              <p className="text-xs text-gray-600 mt-2 whitespace-pre-line leading-relaxed bg-gray-50/50 rounded-xl p-3.5 border border-gray-100">
                                {session.content}
                              </p>
                            )}

                            {/* Meeting Link / Instructions Block */}
                            <div className="mt-4 pt-3 border-t border-gray-100">
                              {editingSessionId === session.id ? (
                                <div className="space-y-3 bg-gray-50/60 p-4 rounded-xl border border-gray-150">
                                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Update Meeting Details</h4>
                                  <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Meeting Link</label>
                                    <input
                                      type="url"
                                      name="meetingLink"
                                      placeholder="https://zoom.us/j/..."
                                      value={editMeetingData.meetingLink}
                                      onChange={handleEditChange}
                                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2c6e5f] bg-white font-medium text-gray-700"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Instructions / Details</label>
                                    <textarea
                                      name="meetingDetails"
                                      rows={2}
                                      placeholder="Enter access details or codes..."
                                      value={editMeetingData.meetingDetails}
                                      onChange={handleEditChange}
                                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2c6e5f] bg-white font-medium text-gray-750 resize-none leading-relaxed"
                                    />
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => setEditingSessionId(null)}
                                      className="px-3 py-1.5 text-xs font-bold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
                                    >
                                      <FaTimes size={10} /> Cancel
                                    </button>
                                    <button
                                      onClick={() => handleEditMeetingSubmit(session.id)}
                                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#2c6e5f] text-white hover:bg-[#1b4d42] flex items-center gap-1 cursor-pointer active:scale-95 transition-all shadow-sm"
                                    >
                                      <FaCheck size={10} /> Save
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col gap-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                      <FaVideo className="text-[#2c6e5f]" /> Meeting Details
                                    </span>
                                    <button
                                      onClick={() => startEditingMeeting(session)}
                                      className="text-xs text-[#2c6e5f] hover:text-[#1b4d42] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                                    >
                                      <FaEdit size={11} /> {session.meeting_link ? "Edit Link" : "Add Link"}
                                    </button>
                                  </div>
                                  
                                  {session.meeting_link ? (
                                    <div className="text-xs bg-teal-50/20 border border-teal-100/30 p-3.5 rounded-xl">
                                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Meeting Link:</p>
                                      <a
                                        href={session.meeting_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-[#2c6e5f] hover:text-[#1b4d42] hover:underline font-bold break-all block mt-1"
                                      >
                                        {session.meeting_link}
                                      </a>
                                      {session.meeting_details && (
                                        <div className="mt-2 text-xs text-gray-650 leading-relaxed">
                                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Instructions:</p>
                                          <p className="mt-1 whitespace-pre-line bg-white/40 p-2 rounded-lg border border-gray-100/80">{session.meeting_details}</p>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-gray-400 italic font-medium">No meeting link provided yet.</p>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Booked Students List */}
                            <div className="mt-4 pt-3 border-t border-gray-100 bg-gray-50/30 p-4 rounded-xl">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-3">
                                <FaUsers className="text-[#2c6e5f]" /> Booked Students ({session.attendees?.length || 0})
                              </span>
                              {session.attendees && session.attendees.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
                                  {session.attendees.map((attendee) => (
                                    <div
                                      key={attendee.id}
                                      className="bg-white border border-gray-150 rounded-xl p-2.5 flex items-center gap-2.5 shadow-sm transition-colors hover:bg-slate-50"
                                    >
                                      <div className="w-8 h-8 rounded-full bg-teal-50 text-[#2c6e5f] flex items-center justify-center font-bold text-xs shrink-0">
                                        {attendee.name.charAt(0)}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-xs font-bold text-gray-700 truncate">{attendee.name}</p>
                                        <p className="text-[10px] text-gray-400 truncate flex items-center gap-1 mt-0.5 font-medium">
                                          <FaEnvelope size={9} /> {attendee.email}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-gray-400 italic font-medium">No student bookings yet.</p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDelete(session.id)}
                            className="p-2.5 text-rose-400 hover:text-rose-650 hover:bg-rose-50 rounded-xl transition-all shrink-0 active:scale-90 cursor-pointer"
                            title="Cancel Session"
                          >
                            <FaTrashAlt size={15} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Session Modal */}
      <AnimatePresence>
        {deleteSessionId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/55 backdrop-blur-sm"
              onClick={() => setDeleteSessionId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl z-50 border border-gray-100 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-4 mx-auto text-xl animate-pulse">
                🗑️
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Cancel Session?</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Are you sure you want to cancel this scheduled session? This action will permanently remove it.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteSessionId(null)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200 cursor-pointer"
                >
                  Go Back
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteSession}
                  className="px-4 py-2.5 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg active:scale-95"
                >
                  Cancel Session
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExpertSessionsPage;
