import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await authService.login(
        formData.email,
        formData.password,
      );

      if (response.user) {
        // Redirect users by role
        if (response.user.role === "admin") {
          navigate("/admin/dashboard");
        } else if (response.user.role === "expert") {
          navigate("/expert/dashboard");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error) {
      setErrors({ general: error.message || "Invalid email or password" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-teal">
      <div className="w-full max-w-md mx-4">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome to MindMate
            </h1>
            <p className="text-gray-500">
              Sign in to access your mental health support
            </p>
          </div>

          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.email ? "border-red-300" : "border-gray-200"
                } focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                placeholder=""
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.password ? "border-red-300" : "border-gray-200"
                } focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                placeholder=""
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#5bb5a1] text-white rounded-xl font-medium hover:bg-[#4a9d8b] transition-colors disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-[#5bb5a1] hover:underline font-medium"
            >
              Register here
            </Link>
          </p>
          <p className="mt-3 text-center text-gray-600">
            Approved expert?{" "}
            <Link
              to="/expert/register"
              className="text-[#5bb5a1] hover:underline font-medium"
            >
              Create your expert account
            </Link>
          </p>
          <p className="mt-6 text-center text-gray-60">
            <Link
              to="/forgot-password"
              className="text-[#5bb5a1] hover:underline font-medium"
            >
              Forgot Password
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
