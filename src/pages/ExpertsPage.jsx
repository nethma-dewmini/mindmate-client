import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaCalendarAlt, FaClock, FaVideo, FaExternalLinkAlt, FaInfoCircle } from "react-icons/fa";
import { authService } from "../services/authService";
import { SkeletonCard } from "../components";

const ExpertsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
        // Cancel Booking
        await authService.cancelSessionBooking(sessionId);
        setSuccess("Session booking cancelled successfully.");
      } else {
        // Book Session
        await authService.bookSession(sessionId);
        setSuccess("Session booked successfully! Meeting details are now available.");
      }
      await loadSessions();
    } catch (err) {
      setError(err.message || "Failed to update booking.");
    } finally {
      setBookingLoading((prev) => ({ ...prev, [sessionId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f5e7] py-8 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-sm text-[#5bb5a1] hover:text-[#4a9d8b] font-medium transition-colors"
          >
            <span className="mr-1.5">←</span> Back to Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Live Group Sessions
            </h1>
            <p className="text-gray-500 mt-1">
              Engage in supportive live group sessions hosted by licensed professionals to nurture your emotional resilience and mental wellness.
            </p>
          </div>
        </div>

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

        {/* Sessions list */}
        {sessionsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SkeletonCard count={4} />
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border-2 border-dashed border-gray-100 text-center text-gray-400">
            <p className="font-semibold mb-1">No group sessions scheduled at the moment.</p>
            <p className="text-sm">Check back later for upcoming professional webinars.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-1 text-xs rounded-full bg-teal-50 text-[#5bb5a1] font-semibold flex items-center gap-1.5">
                      <FaVideo size={10} /> Live Group Session
                    </span>
                    {session.is_booked && (
                      <span className="px-2.5 py-1 text-xs rounded-full bg-green-50 text-green-700 font-semibold">
                        ✓ Booked
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    {session.topic}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium mb-3">
                    Hosted by {session.expert_name || "Mental Health Expert"}
                  </p>

                  <div className="flex flex-wrap gap-4 text-xs text-gray-400 mb-4">
                    <span className="flex items-center gap-1">
                      <FaCalendarAlt />
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
                      <FaClock />
                      {session.session_time}
                    </span>
                  </div>

                  {session.content && (
                    <p className="text-sm text-gray-600 mb-4 whitespace-pre-line leading-relaxed">
                      {session.content}
                    </p>
                  )}

                  {/* Booking details: only visible if student is booked */}
                  {session.is_booked && (
                    <div className="mt-4 p-4 rounded-xl bg-teal-50/40 border border-teal-100/50 mb-6 space-y-2">
                      <p className="text-xs font-bold text-teal-800 uppercase tracking-wide flex items-center gap-1">
                        <FaVideo /> Joining Information
                      </p>
                      {session.meeting_link ? (
                        <div className="space-y-1.5">
                          <a
                            href={session.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-[#5bb5a1] hover:underline font-semibold"
                          >
                            Join Live Meeting <FaExternalLinkAlt size={11} />
                          </a>
                          {session.meeting_details && (
                            <p className="text-xs text-gray-600 bg-white/70 p-2 rounded border border-gray-100 mt-1 whitespace-pre-line">
                              {session.meeting_details}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 italic flex items-center gap-1">
                          <FaInfoCircle /> Meeting link will be updated by the expert before the session.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {session.is_booked ? (
                  <div className="space-y-3">
                    <div className="w-full py-3 px-4 rounded-xl bg-emerald-50 text-emerald-800 font-semibold text-center border border-emerald-100 flex items-center justify-center gap-2">
                      <span className="text-lg">✓</span> Booked the session
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                      <span className="text-gray-500 font-medium">Do you want to cancel the booking?</span>
                      <button
                        onClick={() => handleBookingToggle(session.id, true)}
                        disabled={bookingLoading[session.id]}
                        className="text-red-500 hover:text-red-700 font-bold hover:underline py-1.5 px-3 bg-red-50 rounded-lg border border-red-100 transition-colors disabled:opacity-50 shrink-0"
                      >
                        {bookingLoading[session.id] ? "Cancelling..." : "Cancel Booking"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleBookingToggle(session.id, false)}
                    disabled={bookingLoading[session.id] || !isStudent}
                    className="w-full py-3 rounded-xl bg-[#5bb5a1] text-white font-medium hover:bg-[#4a9d8b] transition-all disabled:opacity-50"
                  >
                    {bookingLoading[session.id]
                      ? "Booking..."
                      : !isStudent
                      ? "Log in as student to book"
                      : "Book Session"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpertsPage;
