import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBook,
  FaCalendarAlt,
  FaClipboardList,
  FaComments,
  FaSignOutAlt,
  FaUserMd,
  FaUsers,
} from "react-icons/fa";
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
      icon: FaComments,
      title: "Client Messages",
      description: "Review conversations and respond to students",
      path: "/chat",
    },
    {
      icon: FaCalendarAlt,
      title: "Schedule",
      description: "Manage availability and upcoming sessions",
      path: "/profile",
    },
    {
      icon: FaClipboardList,
      title: "Consultation Notes",
      description: "Capture session notes and follow-up actions",
      path: "/resources",
    },
    {
      icon: FaUsers,
      title: "Support Groups",
      description: "Monitor moderated peer support activity",
      path: "/peer-support",
    },
    {
      icon: FaBook,
      title: "Clinical Resources",
      description: "Upload materials for the student resource library",
      path: "/expert/upload-resources",
    },
    {
      icon: FaUserMd,
      title: "Expert Profile",
      description: "Review your profile and professional details",
      path: "/profile",
    },
  ];

  const stats = [
    { label: "Today’s Sessions", value: "3 scheduled" },
    { label: "Open Requests", value: "2 pending" },
    { label: "Active Students", value: "14 supported" },
  ];

  const upcomingSessions = [
    { time: "09:30 AM", student: "Anonymous Student", type: "Check-in" },
    { time: "01:00 PM", student: "Peer Support Review", type: "Moderation" },
    { time: "04:15 PM", student: "Follow-up Session", type: "Consultation" },
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
            >
              <p className="text-sm text-[#5bb5a1] font-medium">{stat.label}</p>
              <p className="text-lg font-semibold text-gray-800">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <Link key={action.title} to={action.path}>
                    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 h-full">
                      <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#5bb5a1] flex items-center justify-center mb-4">
                        <Icon />
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {action.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Upcoming Sessions
            </h2>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
              {upcomingSessions.map((session) => (
                <div
                  key={`${session.time}-${session.student}`}
                  className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <p className="font-semibold text-gray-800">
                      {session.time}
                    </p>
                    <span className="text-xs px-2 py-1 rounded-full bg-teal-50 text-[#5bb5a1]">
                      {session.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{session.student}</p>
                </div>
              ))}
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default ExpertDashboardPage;
