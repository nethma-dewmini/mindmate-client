import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

const AdminEntry = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user && user.role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/admin/login");
    }
  }, []);

  return null;
};

export default AdminEntry;
