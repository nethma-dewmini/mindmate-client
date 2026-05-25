import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { authService } from "../services/authService";
import AdminExpertApplications from "./AdminExpertApplications";

const AdminExpertApplicationsPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate("/admin/login");
      return;
    }
    if (user.role !== "admin") {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#f7faf8] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto mb-6">
        <Link to="/admin/dashboard" className="text-sm text-[#5bb5a1] hover:underline">
          ← Back to Admin Dashboard
        </Link>
      </div>

      <div className="max-w-6xl mx-auto">
        <AdminExpertApplications />
      </div>
    </div>
  );
};

export default AdminExpertApplicationsPage;