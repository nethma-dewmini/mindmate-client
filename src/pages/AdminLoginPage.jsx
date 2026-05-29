import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleToggleMode = () => {
    setIsRegister(!isRegister);
    setError("");
    setFormData({ name: "", email: "", password: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isRegister) {
        if (!formData.name.trim()) {
          setError("Name is required");
          setLoading(false);
          return;
        }
        await authService.registerAdmin(
          formData.name.trim(),
          formData.email.trim(),
          formData.password,
        );
        alert("Admin account created successfully! You can now sign in.");
        setIsRegister(false);
        setFormData({ name: "", email: "", password: "" });
      } else {
        const res = await authService.login(formData.email, formData.password);
        if (res.user && res.user.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          // Not an admin — sign out and show error
          authService.logout();
          setError("Account does not have admin access");
        }
      }
    } catch (err) {
      setError(
        err.message || (isRegister ? "Registration failed" : "Login failed"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-teal">
      <div className="w-full max-w-md mx-4">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">
              {isRegister ? "Create Admin" : "Admin Sign In"}
            </h2>
            <p className="text-sm text-slate-500">
              {isRegister
                ? "Create a new administrator account"
                : "Sign in with your admin account"}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-sm text-slate-700 mb-1">
                  Name
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#5bb5a1]"
                  placeholder="Admin Name"
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-slate-700 mb-1">Email</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#5bb5a1]"
                placeholder="admin@email.com"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#5bb5a1]"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#5bb5a1] hover:bg-[#4a9d8b] text-white rounded-xl font-semibold shadow-md transition-all duration-200 cursor-pointer active:scale-[0.98] disabled:opacity-60"
            >
              {loading
                ? isRegister
                  ? "Creating account..."
                  : "Signing in..."
                : isRegister
                  ? "Create Admin Account"
                  : "Sign In"}
            </button>
          </form>

          <div className="text-center mt-6">
            <button
              onClick={handleToggleMode}
              className="text-sm text-[#5bb5a1] hover:text-[#4a9d8b] font-medium transition-colors cursor-pointer"
            >
              {isRegister
                ? "Already have an admin account? Sign In"
                : "Create a new admin"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
