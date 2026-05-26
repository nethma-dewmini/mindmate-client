import { useEffect, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Navbar, Footer } from "./components";
import { authService } from "./services/authService";
import {
  LandingPage,
  LoginPage,
  RegisterPage,
  DashboardPage,
  ExpertDashboardPage,
  ChatPage,
  AssessmentPage,
  ProfilePage,
  MoodTrackerPage,
  ResourcesPage,
  ExpertsPage,
  PeerSupportPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  AdminStudentRegistry,
  AdminEntry,
  AdminLoginPage,
  AdminDashboard,
  AdminExpertApplicationsPage,
  AdminStudentRegistryPage,
  ExpertAccountRegisterPage,
  AboutPage,
} from "./pages";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    authService.isAuthenticated(),
  );
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const location = useLocation();
  const navigate = useNavigate();

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

  // Pages where we don't show navbar/footer
  const authPages = ["/login", "/register", "/forgot-password"];
  const expertPages = ["/expert/register"];
  const appPages = [
    "/dashboard",
    "/expert/dashboard",
    "/chat",
    "/assessment",
    "/profile",
    "/mood",
    "/resources",
    "/experts",
    "/peer-support",
    "/admin",
    "/admin/login",
    "/admin/dashboard",
    "/admin/expert-applications",
    "/admin/student-registry",
    ...expertPages,
  ];
  const showNavbar =
    !authPages.includes(location.pathname) &&
    !appPages.includes(location.pathname);
  const showFooter =
    !authPages.includes(location.pathname) &&
    !appPages.includes(location.pathname) &&
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
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/assessment" element={<AssessmentPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminEntry />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route
            path="/admin/expert-applications"
            element={<AdminExpertApplicationsPage />}
          />
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
    </div>
  );
}

export default App;
