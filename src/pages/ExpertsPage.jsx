import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaCalendarAlt, FaClock, FaVideo, FaExternalLinkAlt, FaInfoCircle } from "react-icons/fa";
import { authService } from "../services/authService";
import { SkeletonCard } from "../components";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const ExpertsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // State for tabs
  const [activeTab, setActiveTab] = useState("all"); // "all", "booked", "available"
  
  // State for cancellation modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  const currentUser = authService.getCurrentUser();
  const isStudent = currentUser?.role === "student";

  const loadSessions = async () => {
    try {
      setSessionsLoading(true);
      const data = await authService.getSessions();
      setSessions(Array.isArray(data.sessions) ? data.sessions : []);
      setError("");
    } catch (err) {
      console.error("Failed to load sessions:", err);
      setError("Failed to load live sessions. Please try again.");
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleBookingToggle = async (sessionId, isBooked) => {
    if (!authService.isAuthenticated()) {
      alert("Please log in to book a session.");
      return;
    }

    if (!isStudent) {
      alert("Only students can book sessions.");
      return;
    }

    setBookingLoading((prev) => ({ ...prev, [sessionId]: true }));
    setError("");
    setSuccess("");

    try {
      if (isBooked) {
        handleCancelClick(sessionId);
      } else {
        // Book Session
        await authService.bookSession(sessionId);
        setSuccess("Session booked successfully! Meeting details are now available.");
        await loadSessions();
      }
    } catch (err) {
      setError(err.message || "Failed to update booking.");
    } finally {
      if (!isBooked) {
        setBookingLoading((prev) => ({ ...prev, [sessionId]: false }));
      }
    }
  };

  const handleCancelClick = (sessionId) => {
    setSelectedSessionId(sessionId);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const handleCancelSubmit = async () => {
    if (!selectedSessionId) return;

    setBookingLoading((prev) => ({ ...prev, [selectedSessionId]: true }));
    setError("");
    setSuccess("");
    setShowCancelModal(false);

    try {
      await authService.cancelSessionBooking(selectedSessionId, cancelReason);
      setSuccess("Session booking cancelled successfully. Notification email sent to the expert.");
      await loadSessions();
    } catch (err) {
      setError(err.message || "Failed to cancel booking.");
    } finally {
      setBookingLoading((prev) => ({ ...prev, [selectedSessionId]: false }));
      setSelectedSessionId(null);
      setCancelReason("");
    }
  };

  // Filter sessions based on tab
  const filteredSessions = sessions.filter((session) => {
    if (activeTab === "booked") return session.is_booked;
    if (activeTab === "available") return !session.is_booked;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f9f5e7] py-10 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-4 border-b border-[#2c6e5f]/10">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1b4d42] tracking-tight">
              Live Group Sessions
            </h1>
            <p className="text-[#2c6e5f]/80 mt-1 font-medium max-w-2xl leading-relaxed text-sm md:text-base">
              Engage in supportive live group sessions hosted by licensed professionals to nurture your emotional resilience and mental wellness.
            </p>
          </div>
          
          {/* Dynamic Tab Filter Bar */}
          {!sessionsLoading && sessions.length > 0 && (
            <div className="bg-white/60 p-1 border border-[#2c6e5f]/15 rounded-2xl relative flex space-x-1 shadow-sm shrink-0">
              {["all", "booked", "available"].map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="relative px-4 py-2.5 rounded-xl text-xs font-extrabold capitalize transition-colors cursor-pointer z-10"
                    style={{ color: isActive ? "#ffffff" : "#2c6e5f" }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTabPill"
                        className="absolute inset-0 bg-[#2c6e5f] rounded-xl -z-10 shadow-sm"
                        transition={{ type: "spring", stiffness: 320, damping: 24 }}
                      />
                    )}
                    {tab === "all" ? "All" : tab === "booked" ? "Booked" : "Available"}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Status Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 rounded-2xl px-4 py-3.5 text-sm bg-rose-50 text-rose-800 border border-rose-100 shadow-sm font-semibold"
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 rounded-2xl px-4 py-3.5 text-sm bg-emerald-50 text-emerald-800 border border-emerald-100 shadow-sm font-semibold"
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sessions list */}
        {sessionsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SkeletonCard count={4} />
          </div>
        ) : filteredSessions.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-16 border-2 border-dashed border-[#2c6e5f]/15 text-center text-gray-400 shadow-sm"
          >
            <p className="font-bold mb-1 text-gray-600">No matching group sessions found.</p>
            <p className="text-xs">
              {activeTab === "booked"
                ? "You haven't booked any upcoming sessions yet."
                : "Check back later for upcoming professional webinars."}
            </p>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {filteredSessions.map((session) => (
              <motion.div
                key={session.id}
                variants={cardVariants}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`glass-card p-6 rounded-3xl flex flex-col justify-between ${
                  session.is_booked ? "hover-glow-emerald border-emerald-100/40 bg-white" : "hover-glow-teal bg-white"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-3.5">
                    <span className={`px-3 py-1 text-[10px] rounded-full font-bold flex items-center gap-1.5 ${
                      session.is_booked ? "bg-emerald-50 text-emerald-600" : "bg-[#2c6e5f]/10 text-[#2c6e5f]"
                    }`}>
                      <FaVideo size={9} /> Live Group Session
                    </span>
                    {session.is_booked && (
                      <span className="px-3 py-1 text-[10px] rounded-full bg-emerald-100 text-emerald-800 font-extrabold shadow-sm animate-pulse">
                        ✓ Booked
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-extrabold text-gray-800 mb-1 leading-tight group-hover:text-[#2c6e5f] transition-colors">
                    {session.topic}
                  </h3>
                  <p className="text-xs text-gray-500 font-semibold mb-4">
                    Hosted by {session.expert_name || "Mental Health Expert"}
                  </p>

                  <div className="flex flex-wrap gap-4 text-[10px] text-gray-400 font-bold mb-4">
                    <span className="flex items-center gap-1 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-xl">
                      <FaCalendarAlt className="text-slate-400" />
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
                    <span className="flex items-center gap-1 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-xl">
                      <FaClock className="text-slate-400" />
                      {session.session_time}
                    </span>
                  </div>

                  {session.content && (
                    <p className="text-sm text-gray-600 mb-5 whitespace-pre-line leading-relaxed font-medium">
                      {session.content}
                    </p>
                  )}

                  {/* Booking details: only visible if student is booked */}
                  {session.is_booked && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/60 mb-6 space-y-2.5 shadow-inner"
                    >
                      <p className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                        <FaVideo /> Joining Information
                      </p>
                      {session.meeting_link ? (
                        <div className="space-y-2">
                          <a
                            href={session.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 hover:underline font-bold bg-white px-3 py-1.5 rounded-xl border border-emerald-100 shadow-sm transition-all active:scale-95"
                          >
                            Join Live Meeting <FaExternalLinkAlt size={10} className="text-emerald-600" />
                          </a>
                          {session.meeting_details && (
                            <p className="text-[11px] text-gray-600 bg-white/70 p-2 rounded-xl border border-gray-100 mt-1.5 whitespace-pre-line leading-relaxed">
                              {session.meeting_details}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-[11px] text-gray-500 italic flex items-center gap-1.5 font-medium">
                          <FaInfoCircle className="text-emerald-600" /> Meeting link will be updated by the expert before the session.
                        </p>
                      )}
                    </motion.div>
                  )}
                </div>

                {session.is_booked ? (
                  <div className="space-y-3">
                    <div className="w-full py-3 px-4 rounded-2xl bg-emerald-500 text-white font-extrabold text-center border border-emerald-600 flex items-center justify-center gap-2 shadow-sm">
                      <span className="text-lg leading-none">✓</span> Booked the session
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-3 bg-gray-50 rounded-2xl border border-gray-100 text-[11px]">
                      <span className="text-gray-500 font-semibold">Do you want to cancel the booking?</span>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCancelClick(session.id)}
                        disabled={bookingLoading[session.id]}
                        className="text-red-500 hover:text-white font-extrabold py-1.5 px-3 hover:bg-red-500 bg-red-50 rounded-xl border border-red-100 transition-all disabled:opacity-50 shrink-0 shadow-sm cursor-pointer"
                      >
                        {bookingLoading[session.id] ? "Cancelling..." : "Cancel Booking"}
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleBookingToggle(session.id, false)}
                    disabled={bookingLoading[session.id] || !isStudent}
                    className={`w-full py-3.5 rounded-2xl font-bold transition-all shadow-md active:scale-95 cursor-pointer text-sm ${
                      bookingLoading[session.id] || !isStudent
                        ? "bg-gray-100 text-gray-400 shadow-none cursor-not-allowed"
                        : "bg-[#2c6e5f] text-white hover:bg-[#1b4d42] hover:shadow-lg"
                    }`}
                  >
                    {bookingLoading[session.id]
                      ? "Booking..."
                      : !isStudent
                      ? "Log in as student to book"
                      : "Book Session"}
                  </motion.button>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Cancellation Modal */}
        <AnimatePresence>
          {showCancelModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-45 backdrop-blur-sm transition-opacity"
                onClick={() => setShowCancelModal(false)}
              />
              
              {/* Modal Content */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="relative w-full max-w-md mx-auto my-6 p-6 bg-white rounded-3xl shadow-xl z-50 border border-gray-100"
              >
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800">
                    Cancel Session Booking
                  </h3>
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="text-gray-400 hover:text-gray-650 transition-colors text-2xl font-bold cursor-pointer"
                  >
                    &times;
                  </button>
                </div>

                <div className="my-4">
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed font-semibold">
                    Please let the expert know why you are cancelling your booking for this session. Your feedback helps them prepare or adjust future sessions.
                  </p>
                  <label htmlFor="cancel-reason" className="block text-[10px] font-extrabold text-gray-700 uppercase tracking-wide mb-1.5">
                    Reason for Cancellation
                  </label>
                  <textarea
                    id="cancel-reason"
                    rows="4"
                    className="w-full px-4 py-2.5 text-xs text-gray-700 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2c6e5f]/15 focus:border-[#2c6e5f]/30 resize-none font-semibold leading-relaxed"
                    placeholder="e.g. I have an academic clash / family emergency / won't be able to attend at this time."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCancelSubmit}
                    disabled={bookingLoading[selectedSessionId]}
                    className="px-4 py-2 text-xs font-bold text-white bg-red-500 hover:bg-red-650 rounded-xl shadow-md transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {bookingLoading[selectedSessionId] ? "Cancelling..." : "Cancel Booking"}
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ExpertsPage;
