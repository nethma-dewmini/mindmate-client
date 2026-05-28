import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import AdminSectionCard from "../components/AdminSectionCard";

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

        <div className="flex flex-col gap-4 mb-6 max-w-3xl">
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

          <AdminSectionCard
            title="Mental Health Assessments"
            description="Build and manage assessment templates that students can take from the public assessment flow."
            onClick={() => navigate("/admin/assessments")}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
