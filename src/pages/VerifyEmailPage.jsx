import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { authService } from "../services/authService";
import { FaCheckCircle, FaTimesCircle, FaSpinner } from "react-icons/fa";

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState("loading"); // 'loading', 'success', 'error'
  const [message, setMessage] = useState("Verifying your email address...");
  const hasAttempted = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid or missing verification token.");
      return;
    }

    if (hasAttempted.current) return;
    hasAttempted.current = true;

    const verify = async () => {
      try {
        await authService.verifyEmail(token);
        setStatus("success");
        setMessage("Your email has been successfully verified! You can now log in.");
      } catch (err) {
        setStatus("error");
        setMessage(err.message || "Email verification failed. The link may have expired.");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center gradient-teal py-12">
      <div className="w-full max-w-md mx-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          
          <div className="flex justify-center mb-6">
            {status === "loading" && (
              <FaSpinner className="text-5xl text-teal-500 animate-spin" />
            )}
            {status === "success" && (
              <FaCheckCircle className="text-5xl text-green-500" />
            )}
            {status === "error" && (
              <FaTimesCircle className="text-5xl text-red-500" />
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {status === "loading" ? "Verifying Email" : status === "success" ? "Email Verified" : "Verification Failed"}
          </h1>
          
          <p className="text-gray-600 mb-8">
            {message}
          </p>

          {status !== "loading" && (
            <Link
              to="/login"
              className="inline-block w-full py-3 bg-[#5bb5a1] text-white rounded-xl font-medium hover:bg-[#4a9d8b] transition-colors"
            >
              Go to Login
            </Link>
          )}

        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
