import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import { authService } from "../services/authService";
import AdminSectionCard from "../components/AdminSectionCard";

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

      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex flex-col gap-6 max-w-3xl">
          <AdminSectionCard
            title="Expert Applications"
            description="Review expert submissions, inspect attached documents, and approve or reject applications."
            onClick={() => navigate("/admin/expert-applications")}
          />

          <AdminSectionCard
            title="Student Registry"
            description="Manage approved student registry entries and import records in bulk using CSV."
            onClick={() => navigate("/admin/student-registry")}
          />

          <AdminSectionCard
            title="Peer Support Groups"
            description="Create and moderate peer support groups for students."
            onClick={() => navigate("/admin/peer-groups")}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
