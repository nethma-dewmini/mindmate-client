import AdminStudentRegistry from "./AdminStudentRegistry";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { useEffect } from "react";

const AdminDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate("/admin/login");
    } else if (user.role !== "admin") {
      navigate("/");
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#f7faf8] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
        </div>

        <div className="space-y-6">
          {/* Student registry as a component within admin dashboard */}
          <AdminStudentRegistry />

          {/* Future admin components can be added here */}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
