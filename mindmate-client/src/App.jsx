import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Navbar, Footer } from "./components";
import {
  LandingPage,
  LoginPage,
  RegisterPage,
  DashboardPage,
  ChatPage,
  AssessmentPage,
  ProfilePage,
  MoodTrackerPage,
  ResourcesPage,
  ExpertsPage,
  PeerSupportPage,
  ForgotPasswordPage,
} from "./pages";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();

  // Pages where we don't show navbar/footer
  const authPages = ["/login", "/register", "/forgot-password"];
  const appPages = [
    "/dashboard",
    "/chat",
    "/assessment",
    "/profile",
    "/mood",
    "/resources",
    "/experts",
    "/peer-support",
  ];
  const showNavbar =
    !authPages.includes(location.pathname) &&
    !appPages.includes(location.pathname);
  const showFooter =
    !authPages.includes(location.pathname) &&
    !appPages.includes(location.pathname) &&
    location.pathname !== "/";

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
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
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/assessment" element={<AssessmentPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/mood" element={<MoodTrackerPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/experts" element={<ExpertsPage />} />
          <Route path="/peer-support" element={<PeerSupportPage />} />
        </Routes>
      </main>

      {showFooter && <Footer />}
    </div>
  );
}

export default App;
