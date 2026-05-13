import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGraduationCap, FaUserMd, FaArrowLeft } from "react-icons/fa";
import mindmateLogo from "../assets/mindmate_logo.png";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("select"); // 'select', 'student', 'expert'
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [studentData, setStudentData] = useState({
    name: "",
    email: "",
    university: "",
    password: "",
    confirmPassword: "",
  });

  const [expertData, setExpertData] = useState({
    name: "",
    email: "",
    specialization: "",
    qualifications: "",
    experience: "",
    licenseNumber: "",
    password: "",
    confirmPassword: "",
  });

  const handleStudentChange = (e) => {
    const { name, value } = e.target;
    setStudentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleExpertChange = (e) => {
    const { name, value } = e.target;
    setExpertData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      navigate("/dashboard");
    } catch (error) {
      setErrors({ general: "Registration failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Role Selection Screen
  if (step === "select") {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-teal py-12">
        <div className="w-full max-w-lg mx-4">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Join MindMate
              </h1>
              <p className="text-gray-500">
                Select your account type to continue
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => setStep("student")}
                className="w-full p-6 border-2 border-gray-200 rounded-2xl hover:border-[#5bb5a1] hover:bg-teal-50 transition-all text-left group"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-[#5bb5a1] group-hover:bg-[#5bb5a1] group-hover:text-white transition-colors">
                    <FaGraduationCap className="text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#5bb5a1]">
                      I'm a Student
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                      Access mental health support, connect with experts, and
                      join peer support groups
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setStep("expert")}
                className="w-full p-6 border-2 border-gray-200 rounded-2xl hover:border-[#5bb5a1] hover:bg-teal-50 transition-all text-left group"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-[#5bb5a1] group-hover:bg-[#5bb5a1] group-hover:text-white transition-colors">
                    <FaUserMd className="text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#5bb5a1]">
                      I'm a Mental Health Expert
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                      Provide professional counseling, manage appointments, and
                      support students
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Illustration placeholder */}
            <div className="mt-8 flex justify-center">
              <div className="w-48 h-32 bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl flex items-center justify-center">
                <img src={mindmateLogo} alt="MindMate" className="w-40 h-40" />
              </div>
            </div>

            <p className="mt-6 text-center text-gray-600">
              Already have an account?{" "}
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
  }

  // Student Registration Form
  if (step === "student") {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-teal py-12">
        <div className="w-full max-w-lg mx-4">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-1">
                Create Your Account
              </h1>
              <p className="text-gray-500">Register as Student</p>
              <button
                onClick={() => setStep("select")}
                className="text-[#5bb5a1] text-sm mt-2 hover:underline flex items-center justify-center mx-auto"
              >
                <FaArrowLeft className="mr-1" /> Change account type
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={studentData.name}
                  onChange={handleStudentChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  University Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={studentData.email}
                  onChange={handleStudentChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  University
                </label>
                <input
                  type="text"
                  name="university"
                  value={studentData.university}
                  onChange={handleStudentChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={studentData.password}
                    onChange={handleStudentChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={studentData.confirmPassword}
                    onChange={handleStudentChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#5bb5a1] text-white rounded-xl font-medium hover:bg-[#4a9d8b] transition-colors disabled:opacity-50"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <p className="mt-6 text-center text-gray-600">
              Already have an account?{" "}
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
  }

  // Expert Registration Form
  if (step === "expert") {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-teal py-12">
        <div className="w-full max-w-lg mx-4">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-1">
                Create Your Account
              </h1>
              <p className="text-gray-500">Register as Mental Health Expert</p>
              <button
                onClick={() => setStep("select")}
                className="text-[#5bb5a1] text-sm mt-2 hover:underline flex items-center justify-center mx-auto"
              >
                <FaArrowLeft className="mr-1" /> Change account type
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={expertData.name}
                  onChange={handleExpertChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={expertData.email}
                  onChange={handleExpertChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={expertData.specialization}
                  onChange={handleExpertChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualifications
                </label>
                <input
                  type="text"
                  name="qualifications"
                  value={expertData.qualifications}
                  onChange={handleExpertChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience
                </label>
                <input
                  type="text"
                  name="experience"
                  value={expertData.experience}
                  onChange={handleExpertChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Number
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={expertData.licenseNumber}
                  onChange={handleExpertChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={expertData.password}
                    onChange={handleExpertChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={expertData.confirmPassword}
                    onChange={handleExpertChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#e74c3c] text-white rounded-xl font-medium hover:bg-[#c0392b] transition-colors disabled:opacity-50"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <p className="mt-6 text-center text-gray-600">
              Already have an account?{" "}
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
  }

  return null;
};

export default RegisterPage;
