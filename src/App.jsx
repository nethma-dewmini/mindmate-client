import { useEffect, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Navbar, Footer } from "./components";
import { authService } from "./services/authService";
import { FaClock, FaExclamationCircle, FaInfoCircle, FaCheckCircle } from "react-icons/fa";
import {
  LandingPage,
  LoginPage,
  RegisterPage,
  DashboardPage,
  ExpertDashboardPage,
  ExpertAssessmentsPage,
  ExpertAssessmentDetailPage,
  ChatPage,
  AssessmentPage,
  AssessmentTaking,
  ProfilePage,
  MoodTrackerPage,
  ResourcesPage,
  ExpertsPage,
  PeerSupportPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  AdminEntry,
  AdminDashboard,
  AdminExpertApplicationsPage,
  AdminPeerGroups,
  AdminStudentRegistryPage,
  ExpertAccountRegisterPage,
  AboutPage,
  ContactPage,
  ExpertUploadResourcesPage,
  ExpertResourceUploadPage,
  ExpertResourceLibraryPage,
  ExpertSessionsPage,
  VerifyEmailPage,
} from "./pages";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    authService.isAuthenticated(),
  );
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const location = useLocation();
  const navigate = useNavigate();

  const [toasts, setToasts] = useState([]);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [timeoutCountdown, setTimeoutCountdown] = useState(60);

  const addToast = (message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, isFading: false }]);
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isFading: true } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 300);
    }, 4000);
  };

  const getAlertType = (message) => {
    const msg = message.toLowerCase();
    if (
      msg.includes("expired") ||
      msg.includes("timeout") ||
      msg.includes("inactivity")
    ) {
      return "warning";
    }
    if (
      msg.includes("failed") ||
      msg.includes("error") ||
      msg.includes("invalid") ||
      msg.includes("please log in") ||
      msg.includes("only students")
    ) {
      return "error";
    }
    if (
      msg.includes("success") ||
      msg.includes("successful") ||
      msg.includes("booked") ||
      msg.includes("cancelled")
    ) {
      return "success";
    }
    return "info";
  };

  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (message) => {
      if (!message) return;
      const msgStr = String(message);
      const type = getAlertType(msgStr);
      addToast(msgStr, type);
    };
    return () => {
      window.alert = originalAlert;
    };
  }, []);

  useEffect(() => {
    const syncAuthState = () => {
      setIsAuthenticated(authService.isAuthenticated());
      setUser(authService.getCurrentUser());
    };

    syncAuthState();
    window.addEventListener("mindmate-auth-change", syncAuthState);

    return () => {
      window.removeEventListener("mindmate-auth-change", syncAuthState);
    };
  }, []);

  // Warm Inactivity Timeout (15 minutes total: 14m inactivity + 60s countdown warning)
  useEffect(() => {
    if (!isAuthenticated) return;

    let activeTimer;
    let countdownInterval;
    const WARNING_TIMEOUT = 14 * 60 * 1000; // 14 minutes

    const logoutUser = () => {
      authService.logout();
      setIsAuthenticated(false);
      setUser(null);
      setShowTimeoutWarning(false);
      addToast("Session expired due to inactivity.", "warning");
      navigate("/login");
    };

    const startInactivityTimer = () => {
      if (activeTimer) clearTimeout(activeTimer);
      if (countdownInterval) clearInterval(countdownInterval);

      activeTimer = setTimeout(() => {
        setShowTimeoutWarning(true);
        setTimeoutCountdown(60);
      }, WARNING_TIMEOUT);
    };

    if (showTimeoutWarning) {
      countdownInterval = setInterval(() => {
        setTimeoutCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            logoutUser();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      startInactivityTimer();
    }

    const resetTimer = () => {
      if (!showTimeoutWarning) {
        startInactivityTimer();
      }
    };

    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];

    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    return () => {
      if (activeTimer) clearTimeout(activeTimer);
      if (countdownInterval) clearInterval(countdownInterval);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [isAuthenticated, showTimeoutWarning, navigate]);

  const handleKeepLoggedIn = () => {
    setShowTimeoutWarning(false);
    addToast("Session extended. Welcome back!", "success");
  };

  // Pages where we don't show navbar/footer
  const authPages = ["/login", "/register", "/forgot-password", "/verify-email"];
  const expertPages = ["/expert/register"];
  const appPages = [
    "/dashboard",
    "/expert/dashboard",
    "/expert/upload-resources",
    "/expert/resource-upload",
    "/expert/resource-library",
    "/expert/assessments",
    "/expert/sessions",
    "/chat",
    "/assessment",
    "/profile",
    "/mood",
    "/resources",
    "/experts",
    "/peer-support",
    "/admin",
    "/admin/dashboard",
    "/admin/expert-applications",
    "/admin/peer-groups",
    "/admin/student-registry",
    ...expertPages,
  ];
  const showNavbar =
    !authPages.includes(location.pathname) &&
    !appPages.includes(location.pathname) &&
    !location.pathname.startsWith("/assessment/") &&
    !location.pathname.startsWith("/expert/assessments/");
  const showFooter =
    !authPages.includes(location.pathname) &&
    !appPages.includes(location.pathname) &&
    !location.pathname.startsWith("/assessment/") &&
    !location.pathname.startsWith("/expert/assessments/") &&
    location.pathname !== "/" &&
    location.pathname !== "/about" &&
    location.pathname !== "/contact";

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {showNavbar && (
        <Navbar
          isAuthenticated={isAuthenticated}
          user={user}
          onLogout={handleLogout}
        />
      )}

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/expert/register"
            element={<ExpertAccountRegisterPage />}
          />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/expert/dashboard" element={<ExpertDashboardPage />} />
          <Route
            path="/expert/assessments"
            element={<ExpertAssessmentsPage />}
          />
          <Route
            path="/expert/assessments/:id"
            element={<ExpertAssessmentDetailPage />}
          />
          <Route
            path="/expert/upload-resources"
            element={<ExpertUploadResourcesPage />}
          />
          <Route
            path="/expert/resource-upload"
            element={<ExpertResourceUploadPage />}
          />
          <Route
            path="/expert/resource-library"
            element={<ExpertResourceLibraryPage />}
          />
          <Route
            path="/expert/sessions"
            element={<ExpertSessionsPage />}
          />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/assessment" element={<AssessmentPage />} />
          <Route path="/assessment/:id" element={<AssessmentTaking />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminEntry />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route
            path="/admin/expert-applications"
            element={<AdminExpertApplicationsPage />}
          />
          <Route path="/admin/peer-groups" element={<AdminPeerGroups />} />
          <Route
            path="/admin/student-registry"
            element={<AdminStudentRegistryPage />}
          />
          <Route path="/mood" element={<MoodTrackerPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/experts" element={<ExpertsPage />} />
          <Route path="/peer-support" element={<PeerSupportPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </main>

      {showFooter && <Footer />}

      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 bg-white border border-gray-100 rounded-2xl p-4 shadow-xl w-full transition-all duration-300 ${
              toast.isFading ? "animate-toast-out" : "animate-toast-in"
            }`}
          >
            {/* Color-coded Icon Circle */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                toast.type === "success"
                  ? "bg-emerald-50 text-emerald-500"
                  : toast.type === "warning"
                    ? "bg-amber-50 text-amber-500"
                    : toast.type === "error"
                      ? "bg-rose-50 text-rose-500"
                      : "bg-[#2c6e5f]/10 text-[#2c6e5f]"
              }`}
            >
              {toast.type === "success" && <FaCheckCircle className="w-5 h-5" />}
              {toast.type === "warning" && <FaClock className="w-5 h-5" />}
              {toast.type === "error" && <FaExclamationCircle className="w-5 h-5" />}
              {toast.type === "info" && <FaInfoCircle className="w-5 h-5" />}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-800 capitalize">
                {toast.type === "info" ? "notification" : toast.type}
              </h4>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed whitespace-pre-wrap">
                {toast.message}
              </p>
            </div>
            
            <button
              onClick={() => {
                setToasts((prev) => prev.filter((t) => t.id !== toast.id));
              }}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Warm Inactivity Warning Countdown Modal */}
      {showTimeoutWarning && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" />
          <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-gray-100 text-center flex flex-col items-center transform scale-100 transition-all duration-300 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-4">
              <FaClock className="w-8 h-8 animate-pulse" />
            </div>

            <h3 className="text-lg font-bold text-gray-800 mb-2">Are you still there?</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              We care about your safety. For security, your session will automatically lock in{" "}
              <span className="font-semibold text-amber-600 text-base">{timeoutCountdown} seconds</span> due to inactivity.
            </p>

            <div className="w-full flex flex-col gap-3">
              <button
                onClick={handleKeepLoggedIn}
                className="w-full py-3 px-6 rounded-xl bg-[#2c6e5f] hover:bg-[#1b4d42] text-white font-semibold shadow-md transition-all duration-200 hover:shadow-lg active:scale-95 cursor-pointer"
              >
                Keep me logged in
              </button>
              <button
                onClick={() => {
                  authService.logout();
                  setIsAuthenticated(false);
                  setUser(null);
                  setShowTimeoutWarning(false);
                  navigate("/login");
                }}
                className="w-full py-3 px-6 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-all duration-200 cursor-pointer"
              >
                Logout Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
