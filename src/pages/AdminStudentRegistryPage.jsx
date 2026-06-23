import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { authService } from "../services/authService";
import AdminStudentRegistry from "./AdminStudentRegistry";

const AdminStudentRegistryPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "admin") {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#f7faf8] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <AdminStudentRegistry />
      </div>
    </div>
  );
};

export default AdminStudentRegistryPage;
