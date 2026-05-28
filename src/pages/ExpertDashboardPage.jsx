import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import { authService } from "../services/authService";

const ExpertDashboardPage = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser() || {
    name: "Expert",
    role: "expert",
  };
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/login");
    } else if (user.role !== "expert") {
      navigate("/dashboard");
    }
  }, [navigate, user.role]);

  if (!authService.isAuthenticated() || user.role !== "expert") {
    return null;
  }

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  const quickActions = [
    {
      category: "Client Messages",
      title: "Review conversations and respond to students",
      description: "View ongoing chats, moderate messages, and keep in touch with university students seeking support.",
      buttonText: "Open Messages",
      path: "/chat",
    },
    {
      category: "Schedule",
      title: "Manage availability and upcoming sessions",
      description: "Define your student support hours, coordinate check-ins, and schedule upcoming sessions held.",
      buttonText: "Manage Sessions",
      path: "/expert/sessions",
    },
    {
      category: "Resource Management",
      title: "Upload materials for student resource library",
      description: "Contribute clinical sheets, guidebooks, and self-help articles for the student dashboard.",
      buttonText: "Manage Resources",
      path: "/expert/upload-resources",
    },
    {
      category: "Expert Profile",
      title: "Review your profile and professional details",
      description: "Update your credentials, bio, contact info, and profile settings.",
      buttonText: "View Profile",
      path: "/profile",
    },
  ];





  return (
    <div className="min-h-screen bg-[#f9f5e7]">
      <div className="gradient-teal py-8 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
              Expert Dashboard
            </p>
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome back, {user.name}!
            </h1>
            <p className="text-gray-600">
              Your professional workspace for student support.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-[#5bb5a1]">
              {user.name.charAt(0)}
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white text-red-400 rounded-lg flex items-center space-x-2 hover:bg-red-300"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#5bb5a1]">
              Your Assessments
            </p>
            <h2 className="text-2xl font-bold text-gray-800 mt-1">
              Manage the assessments you publish
            </h2>
            <p className="text-gray-500 mt-2 max-w-2xl">
              Open your assessment library to view every assessment, then click
              one to see its details and manage it from a dedicated page.
            </p>
          </div>
          <Link
            to="/expert/assessments"
            className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-[#5bb5a1] text-white font-medium hover:bg-[#4a9d8b]"
          >
            Open Assessments
          </Link>
        </div>



        <div className="mb-8">
          <div className="space-y-6">
            {quickActions.map((action) => (
              <div
                key={action.category}
                className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-[#5bb5a1]">
                    {action.category}
                  </p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">
                    {action.title}
                  </h3>
                  <p className="text-gray-500 mt-2 max-w-2xl">
                    {action.description}
                  </p>
                </div>
                <Link
                  to={action.path}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-[#5bb5a1] text-white font-medium hover:bg-[#4a9d8b] shrink-0"
                >
                  {action.buttonText}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertDashboardPage;
