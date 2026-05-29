import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaUserCheck, FaUsers, FaHandshake } from "react-icons/fa";
import { authService } from "../services/authService";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser() || {
    name: "Admin",
    role: "admin",
  };

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate("/login");
    } else if (user.role !== "admin") {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const adminActions = [
    {
      title: "Expert Applications",
      description: "Review expert submissions, inspect attached documents, and approve or reject applications.",
      icon: FaUserCheck,
      path: "/admin/expert-applications",
      linkText: "Review Applications",
    },
    {
      title: "Student Registry",
      description: "Manage approved student registry entries and import records in bulk using CSV.",
      icon: FaUsers,
      path: "/admin/student-registry",
      linkText: "Manage Registry",
    },
    {
      title: "Peer Support Groups",
      description: "Create and moderate peer support groups for students.",
      icon: FaHandshake,
      path: "/admin/peer-groups",
      linkText: "Manage Groups",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f9f5e7]">
      {/* Header Banner */}
      <div className="gradient-teal py-8 px-6 mb-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
              Admin Workspace
            </p>
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome back, {user.name}!
            </h1>
            <p className="text-gray-600">
              Your professional workspace for managing student wellness.
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
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {adminActions.map((action, index) => {
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

export default AdminDashboard;
