import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { authService } from "../services/authService";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      const response = await authService.login(formData.email, formData.password);

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

  const handleResendVerification = async () => {
    try {
      setIsLoading(true);
      await authService.resendVerification(formData.email);
      setErrors({
        general: "Verification email resent successfully! Please check your inbox.",
        type: "success",
      });
    } catch (err) {
      setErrors({ general: err.message || "Failed to resend verification email." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-teal">
      <div className="w-full max-w-md mx-4">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to MindMate</h1>
            <p className="text-gray-500">Sign in to access your mental health support</p>
          </div>

          {errors.general && (
            <div
              className={`mb-6 p-4 rounded-xl text-sm border ${errors.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-600"}`}
            >
              {errors.general}
              {errors.general === "Please verify your email address to log in." && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  className="mt-2 block text-sm font-semibold underline text-red-700 hover:text-red-800 cursor-pointer"
                >
                  Resend Verification Email
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
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
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-4 pr-12 py-3 rounded-xl border ${
                    errors.password ? "border-red-300" : "border-gray-200"
                  } focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                  placeholder=""
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
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
            <Link to="/register" className="text-[#5bb5a1] hover:underline font-medium">
              Register here
            </Link>
          </p>

          <p className="mt-6 text-center text-gray-60">
            <Link
              to={`/forgot-password${formData.email ? `?email=${encodeURIComponent(formData.email)}` : ""}`}
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
