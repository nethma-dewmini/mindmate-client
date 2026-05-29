import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaClipboardList, FaCalendarAlt, FaBookOpen } from "react-icons/fa";
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

  const expertActions = [
    {
      title: "Manage Assessments",
      description: "Open your assessment library to view every assessment, see details, and manage publishing options.",
      icon: FaClipboardList,
      path: "/expert/assessments",
      linkText: "Open Assessments",
    },

    {
      title: "Sessions Schedule",
      description: "Define your student support hours, coordinate check-ins, and schedule upcoming sessions held.",
      icon: FaCalendarAlt,
      path: "/expert/sessions",
      linkText: "Manage Sessions",
    },
    {
      title: "Resource Management",
      description: "Contribute clinical sheets, guidebooks, and self-help articles for the student resource library.",
      icon: FaBookOpen,
      path: "/expert/upload-resources",
      linkText: "Manage Resources",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f9f5e7]">
      {/* Header Banner */}
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
            <Link
              to="/profile"
              title="View Profile"
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-[#5bb5a1] hover:scale-105 transition-all shadow-sm cursor-pointer"
            >
              {user.name.charAt(0).toUpperCase()}
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white text-red-400 rounded-lg flex items-center space-x-2 hover:bg-red-50 border border-gray-100 shadow-sm transition-all cursor-pointer"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {expertActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={index} to={action.path} className="group">
                <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-gray-100 h-full flex flex-col justify-between">
                  <div>
                    <div className="bg-[#5bb5a1]/10 text-[#5bb5a1] w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-xl group-hover:scale-110 transition-transform duration-300">
                      <Icon size={20} />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-1 group-hover:text-[#5bb5a1] transition-colors duration-200 text-lg">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                  <div className="mt-5 text-xs font-semibold text-[#5bb5a1] flex items-center gap-1 group-hover:gap-2 transition-all duration-300">
                    {action.linkText} <span>→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ExpertDashboardPage;
