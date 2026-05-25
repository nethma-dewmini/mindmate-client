import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGraduationCap, FaUserMd, FaArrowLeft } from "react-icons/fa";
import mindmateLogo from "../assets/mindmate_logo.png";
import { authService } from "../services/authService";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("select"); // 'select', 'student', 'expert'
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const isValidUomEmail = (value) =>
    /^[^\s@]+@uom\.lk$/i.test(String(value || "").trim());

  const isValidRegistrationNo = (value) =>
    /^\d{6}[A-Za-z]$/.test(String(value || "").trim());

  const getFriendlyErrorMessage = (message, role) => {
    const normalizedMessage = String(message || "").toLowerCase();

    if (role === "student") {
      if (
        normalizedMessage.includes(
          "student record not found in university registry",
        ) ||
        normalizedMessage.includes(
          "no matching student record was found for the entered registration number and email",
        )
      ) {
        return "No matching student record was found for the entered registration number and email. Please check your details and try again.";
      }

      if (normalizedMessage.includes("user with that email already exists")) {
        return "This email is already registered. Please sign in instead.";
      }

      if (
        normalizedMessage.includes("this registration no is already registered")
      ) {
        return "This registration number is already linked to an account. Please sign in instead.";
      }
    }

    return message || "Registration failed. Please try again.";
  };

  const [studentData, setStudentData] = useState({
    title: "",
    name: "",
    email: "",
    studentId: "",
    password: "",
    confirmPassword: "",
  });

  const [expertData, setExpertData] = useState({
    title: "",
    name: "",
    email: "",
    specialization: "",
    experience: "",
  });
  const [expertDocuments, setExpertDocuments] = useState([]);

  const handleStudentChange = (e) => {
    const { name, value } = e.target;
    setStudentData((prev) => ({ ...prev, [name]: value }));

    if (name === "email") {
      setErrors((prev) => ({
        ...prev,
        email:
          value && !isValidUomEmail(value)
            ? "Enter a valid University of Moratuwa email ending with @uom.lk"
            : "",
      }));
      return;
    }

    if (name === "studentId") {
      setErrors((prev) => ({
        ...prev,
        studentId:
          value && !isValidRegistrationNo(value)
            ? "Enter a valid registration number like 221234X"
            : "",
      }));
      return;
    }

    if (name === "name") {
      setErrors((prev) => ({ ...prev, name: value ? "" : prev.name }));
      return;
    }

    setErrors((prev) => ({ ...prev, general: "" }));
  };

  const handleExpertChange = (e) => {
    const { name, value } = e.target;
    setExpertData((prev) => ({ ...prev, [name]: value }));
  };

  const handleExpertDocumentChange = (e) => {
    setExpertDocuments(Array.from(e.target.files || []));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setSuccessMessage("");

    try {
      if (step === "student") {
        // Validate form
        const nextErrors = {};

        if (!studentData.name) {
          nextErrors.name = "Name is required";
        }

        if (!studentData.email) {
          nextErrors.email = "Email is required";
        } else if (!isValidUomEmail(studentData.email)) {
          nextErrors.email =
            "Enter a valid University of Moratuwa email ending with @uom.lk";
        }

        if (!studentData.studentId) {
          nextErrors.studentId = "Registration number is required";
        } else if (!isValidRegistrationNo(studentData.studentId)) {
          nextErrors.studentId =
            "Enter a valid registration number like 221234X";
        }

        if (!studentData.password || !studentData.confirmPassword) {
          nextErrors.general = "All fields are required";
        }

        if (Object.keys(nextErrors).length > 0) {
          setErrors(nextErrors);
          setIsLoading(false);
          return;
        }

        if (studentData.password !== studentData.confirmPassword) {
          setErrors({ general: "Passwords do not match" });
          setIsLoading(false);
          return;
        }

        // Prepare name with title and call backend
        const studentDisplayName = `${studentData.title ? studentData.title + " " : ""}${studentData.name}`;
        const response = await authService.registerStudent(
          studentDisplayName,
          studentData.email,
          studentData.studentId,
          studentData.password,
        );

        // Success - redirect to login or dashboard
        navigate("/login");
      } else if (step === "expert") {
        // Validate form
        if (
          !expertData.name ||
          !expertData.email ||
          !expertData.specialization ||
          !expertData.experience ||
          !expertDocuments.length
        ) {
          setErrors({
            general:
              "Name, email, specialization, experience, and at least one document are required",
          });
          setIsLoading(false);
          return;
        }

        // Submit expert application with documents (include title)
        const expertDisplayName = `${expertData.title ? expertData.title + " " : ""}${expertData.name}`;
        const response = await authService.submitExpertApplication({
          name: expertDisplayName,
          email: expertData.email,
          specialization: expertData.specialization,
          experience: expertData.experience,
          documents: expertDocuments,
        });

        // Success - show message and redirect to login
        setSuccessMessage(
          response.message ||
            "Application submitted successfully. Please wait for admin review.",
        );
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (error) {
      setErrors({
        general: getFriendlyErrorMessage(error.message, step),
      });
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
              <p className="text-gray-500">
                Register as University of Moratuwa Student
              </p>
              <button
                onClick={() => setStep("select")}
                className="text-[#5bb5a1] text-sm mt-2 hover:underline flex items-center justify-center mx-auto"
              >
                <FaArrowLeft className="mr-1" /> Change account type
              </button>
            </div>

            {errors.general && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errors.general}
              </div>
            )}

            {successMessage && (
              <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <select
                    name="title"
                    value={studentData.title}
                    onChange={handleStudentChange}
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select</option>
                    <option value="Mr">Mr</option>
                    <option value="Ms">Ms</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Miss">Miss</option>
                    <option value="Dr">Dr</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name with Initials
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={studentData.name}
                    onChange={handleStudentChange}
                    placeholder="R.M.N.D. Rathnayaka"
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors.name ? "border-red-300" : "border-gray-200"
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
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
                  placeholder="rathnayakarmnd.22@uom.lk"
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.email ? "border-red-300" : "border-gray-200"
                  }`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use your University of Moratuwa email address
                </p>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration No
                </label>
                <input
                  type="text"
                  name="studentId"
                  value={studentData.studentId}
                  onChange={handleStudentChange}
                  placeholder="221234X"
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.studentId ? "border-red-300" : "border-gray-200"
                  }`}
                />
                {errors.studentId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.studentId}
                  </p>
                )}
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

            {errors.general && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <select
                    name="title"
                    value={expertData.title}
                    onChange={handleExpertChange}
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select</option>
                    <option value="Mr">Mr</option>
                    <option value="Ms">Ms</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Miss">Miss</option>
                    <option value="Dr">Dr</option>
                  </select>
                </div>

                <div className="col-span-2">
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

              {/* <div>
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
              </div> */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supporting Documents
                </label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  onChange={handleExpertDocumentChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload your CV, license, certificates, or other verification
                  documents.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#e74c3c] text-white rounded-xl font-medium hover:bg-[#c0392b] transition-colors disabled:opacity-50"
              >
                {isLoading ? "Submitting Application..." : "Submit Application"}
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
