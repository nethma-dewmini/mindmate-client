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
  ExpertUploadResourcesPage,
  ExpertResourceUploadPage,
  ExpertResourceLibraryPage,
  ExpertSessionsPage,
} from "./pages";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    authService.isAuthenticated(),
  );
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const location = useLocation();
  const navigate = useNavigate();

  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    message: "",
    type: "info",
  });

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
      const msgStr = String(message);
      const type = getAlertType(msgStr);
      setAlertConfig({
        isOpen: true,
        message: msgStr,
        type: type,
      });
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

  // Global Inactivity Timeout (5 minutes)
  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId;
    const TIMEOUT_DURATION = 5 * 60 * 1000; // 5 minutes

    const handleInactivity = () => {
      authService.logout();
      setIsAuthenticated(false);
      setUser(null);
      alert("Session expired due to inactivity. Please log in again.");
      navigate("/login");
    };

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(handleInactivity, TIMEOUT_DURATION);
    };

    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];

    resetTimer();

    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [isAuthenticated, navigate]);

  // Pages where we don't show navbar/footer
  const authPages = ["/login", "/register", "/forgot-password"];
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
    location.pathname !== "/about";

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
        </Routes>
      </main>

      {showFooter && <Footer />}

      {alertConfig.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
          />

          {/* Dialog Box */}
          <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-gray-100 text-center flex flex-col items-center transform scale-100 transition-all duration-300 animate-in fade-in zoom-in-95">
            {/* Color-coded Icon Circle */}
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                alertConfig.type === "success"
                  ? "bg-emerald-50 text-emerald-500"
                  : alertConfig.type === "warning"
                    ? "bg-amber-50 text-amber-500"
                    : alertConfig.type === "error"
                      ? "bg-rose-50 text-rose-500"
                      : "bg-teal-50 text-teal-500"
              }`}
            >
              {alertConfig.type === "success" && (
                <FaCheckCircle className="w-8 h-8" />
              )}
              {alertConfig.type === "warning" && (
                <FaClock className="w-8 h-8" />
              )}
              {alertConfig.type === "error" && (
                <FaExclamationCircle className="w-8 h-8" />
              )}
              {alertConfig.type === "info" && (
                <FaInfoCircle className="w-8 h-8" />
              )}
            </div>

            {/* Header/Title */}
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {alertConfig.type === "success"
                ? "Success"
                : alertConfig.type === "warning"
                  ? "Session Timeout"
                  : alertConfig.type === "error"
                    ? "Notice"
                    : "Notification"}
            </h3>

            {/* Alert Message Text */}
            <p className="text-sm text-gray-500 mb-6 leading-relaxed whitespace-pre-wrap">
              {alertConfig.message}
            </p>

            {/* Action Button */}
            <button
              onClick={() => {
                setAlertConfig((prev) => ({ ...prev, isOpen: false }));
              }}
              className={`w-full py-3 px-6 rounded-xl text-white font-semibold shadow-md transition-all duration-200 hover:shadow-lg active:scale-95 cursor-pointer ${
                alertConfig.type === "success"
                  ? "bg-emerald-500 hover:bg-emerald-600"
                  : alertConfig.type === "warning"
                    ? "bg-amber-500 hover:bg-amber-600"
                    : alertConfig.type === "error"
                      ? "bg-rose-500 hover:bg-rose-600"
                      : "bg-[#5bb5a1] hover:bg-[#4a9d8b]"
              }`}
            >
              {alertConfig.type === "warning" ? "Sign In Again" : "OK"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
