import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

const ExpertAccountRegisterPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [application, setApplication] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const checkStatus = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    setApplication(null);

    try {
      const response = await authService.getExpertApplicationStatus(email);
      setApplication(response.application);

      if (response.application?.status === "approved") {
        setMessage("You are approved. Create your expert account below.");
      } else if (response.application?.status === "pending") {
        setMessage("Your application is still pending admin approval.");
      } else if (response.application?.status === "rejected") {
        setMessage("Your application was rejected. Please contact admin.");
      }
    } catch (err) {
      setError(err.message || "Unable to check application status");
    } finally {
      setLoading(false);
    }
  };

  const registerAccount = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!application || application.status !== "approved") {
      setError("Your application must be approved before registration.");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Password and confirm password are required.");
      return;
    }

    const isValidPassword = (value) =>
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value);

    if (!isValidPassword(password)) {
      setError("Password must be at least 8 characters, containing at least one uppercase letter, one lowercase letter, and one number.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setRegistering(true);
    try {
      const response = await authService.registerExpert(
        application.name,
        application.title,
        application.email,
        password,
      );

      setMessage(
        response.message || "You are approved. Account created successfully.",
      );
      navigate("/login");
    } catch (err) {
      setError(err.message || "Unable to create expert account");
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-teal py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">
              Expert Account Registration
            </h1>
            <p className="text-gray-500">
              Approved experts can create their login here
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </div>
          )}

          <form onSubmit={checkStatus} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Approved Application Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#5bb5a1] text-white rounded-xl font-medium hover:bg-[#4a9d8b] transition-colors disabled:opacity-50"
            >
              {loading ? "Checking status..." : "Check Approval Status"}
            </button>
          </form>

          {application?.status === "approved" && (
            <form onSubmit={registerAccount} className="space-y-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                You are approved. Set a password to create your expert account.
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={application.name || ""}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={application.title || ""}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={registering}
                className="w-full py-3 bg-[#e74c3c] text-white rounded-xl font-medium hover:bg-[#c0392b] transition-colors disabled:opacity-50"
              >
                {registering ? "Creating Account..." : "Create Expert Account"}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-gray-600">
            Back to{" "}
            <Link
              to="/login"
              className="text-[#5bb5a1] hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExpertAccountRegisterPage;
