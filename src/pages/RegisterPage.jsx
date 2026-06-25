import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGraduationCap, FaUserMd, FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import mindmateLogo from "../assets/mindmate_logo.png";
import { authService } from "../services/authService";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("select"); // 'select', 'student', 'expert'
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [submittedApplication, setSubmittedApplication] = useState(null);
  const [applicationLookupStatus, setApplicationLookupStatus] = useState("");
  const [applicationLookupMessage, setApplicationLookupMessage] = useState("");
  const [checkingApplicationStatus, setCheckingApplicationStatus] = useState(false);
  const [expertAccountPassword, setExpertAccountPassword] = useState("");
  const [expertAccountConfirmPassword, setExpertAccountConfirmPassword] = useState("");
  const [registeringExpertAccount, setRegisteringExpertAccount] = useState(false);
  const [expertAccountMessage, setExpertAccountMessage] = useState("");
  const [showStudentPassword, setShowStudentPassword] = useState(false);
  const [showStudentConfirmPassword, setShowStudentConfirmPassword] = useState(false);
  const [showExpertPassword, setShowExpertPassword] = useState(false);
  const [showExpertConfirmPassword, setShowExpertConfirmPassword] = useState(false);

  // OTP Verification States
  const [otpCode, setOtpCode] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");

  const isValidUomEmail = (value) => /^[^\s@]+@uom\.lk$/i.test(String(value || "").trim());

  const isValidRegistrationNo = (value) => /^\d{6}[A-Z]$/.test(String(value || "").trim());

  const isValidPassword = (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value);

  const getFriendlyErrorMessage = (message, role) => {
    const normalizedMessage = String(message || "").toLowerCase();

    if (role === "student") {
      if (
        normalizedMessage.includes("student record not found in university registry") ||
        normalizedMessage.includes(
          "no matching student record was found for the entered registration number and email"
        )
      ) {
        return "No matching student record was found for the entered registration number and email. Please check your details and try again.";
      }

      if (normalizedMessage.includes("user with that email already exists")) {
        return "This email is already registered. Please sign in instead.";
      }

      if (normalizedMessage.includes("this registration no is already registered")) {
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
    specializationOther: "",
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
            ? "Enter a valid registration number like 221234X. The last letter must be a capital letter."
            : "",
      }));
      return;
    }

    if (name === "name") {
      setErrors((prev) => ({ ...prev, name: value ? "" : prev.name }));
      return;
    }

    if (name === "password") {
      setErrors((prev) => ({
        ...prev,
        password:
          value && !isValidPassword(value)
            ? "Password must be at least 8 characters, containing at least one uppercase letter, one lowercase letter, and one number."
            : "",
      }));
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

  const handleExpertAccountRegister = async (e) => {
    e.preventDefault();
    setErrors({});
    setExpertAccountMessage("");

    if (applicationLookupStatus !== "approved") {
      setErrors({
        general: "Your application must be approved before you can register.",
      });
      return;
    }

    if (!expertAccountPassword || !expertAccountConfirmPassword) {
      setErrors({ general: "Password and confirm password are required" });
      return;
    }

    if (!isValidPassword(expertAccountPassword)) {
      setErrors({
        general:
          "Password must be at least 8 characters, containing at least one uppercase letter, one lowercase letter, and one number.",
      });
      return;
    }

    if (expertAccountPassword !== expertAccountConfirmPassword) {
      setErrors({ general: "Passwords do not match" });
      return;
    }

    setRegisteringExpertAccount(true);
    try {
      const response = await authService.registerExpert(
        expertData.name,
        expertData.title,
        expertData.email,
        expertAccountPassword
      );

      setExpertAccountMessage(
        response.message ||
          "You are approved. Your expert account has been created. Please sign in."
      );
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      setErrors({
        general: getFriendlyErrorMessage(error.message, "expert"),
      });
    } finally {
      setRegisteringExpertAccount(false);
    }
  };

  useEffect(() => {
    const email = String(expertData.email || "").trim();
    const timeoutId = setTimeout(async () => {
      if (step !== "expert" || (!isValidUomEmail(email) && !email.includes("@"))) {
        return;
      }

      setCheckingApplicationStatus(true);
      setApplicationLookupStatus("");
      setApplicationLookupMessage("");

      try {
        const response = await authService.getExpertApplicationStatus(email);
        const application = response.application;

        if (application?.status === "approved") {
          setApplicationLookupStatus("approved");
          setApplicationLookupMessage(
            "You are approved. Please sign in to continue using your expert account."
          );
        } else if (application?.status === "pending") {
          setApplicationLookupStatus("pending");
          setApplicationLookupMessage(
            "Your application is pending admin review. Please wait for approval."
          );
        } else if (application?.status === "rejected") {
          setApplicationLookupStatus("rejected");
          setApplicationLookupMessage(
            "Your application was rejected. Please contact the admin team for more information."
          );
        }
      } catch (err) {
        // No application yet is fine; keep the form clear.
        setApplicationLookupStatus("");
        setApplicationLookupMessage("");
      } finally {
        setCheckingApplicationStatus(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [expertData.email, step]);

  const handleSendOtp = async () => {
    setErrors({});
    setOtpMessage("");

    if (!studentData.name) {
      setErrors({ name: "Name is required" });
      return;
    }
    if (!studentData.email) {
      setErrors({ email: "Email is required" });
      return;
    }
    if (!isValidUomEmail(studentData.email)) {
      setErrors({ email: "Enter a valid University of Moratuwa email ending with @uom.lk" });
      return;
    }
    if (!studentData.studentId) {
      setErrors({ studentId: "Registration number is required" });
      return;
    }
    if (!isValidRegistrationNo(studentData.studentId)) {
      setErrors({
        studentId:
          "Enter a valid registration number like 221234X. The last letter must be a capital letter.",
      });
      return;
    }

    setOtpLoading(true);
    try {
      const studentDisplayName = `${studentData.title ? studentData.title + " " : ""}${studentData.name}`;
      const response = await authService.sendRegistrationOtp(
        studentData.email,
        studentData.studentId,
        studentDisplayName
      );
      setIsOtpSent(true);
      setOtpMessage(
        response.message || "Verification code sent successfully to your university email."
      );
    } catch (err) {
      setErrors({
        general: err.message || "Failed to send verification code. Please check your details.",
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setErrors({});
    setOtpMessage("");

    if (!otpCode || otpCode.length !== 6) {
      setErrors({ general: "Please enter a valid 6-digit verification code." });
      return;
    }

    setOtpLoading(true);
    try {
      await authService.verifyRegistrationOtp(studentData.email, studentData.studentId, otpCode);
      setIsOtpVerified(true);
      setOtpMessage(
        "Email verified successfully! You can now set your password to complete registration."
      );
    } catch (err) {
      setErrors({
        general: err.message || "Verification failed. The code may be incorrect or expired.",
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResetOtpFlow = () => {
    setIsOtpSent(false);
    setIsOtpVerified(false);
    setOtpCode("");
    setOtpMessage("");
    setErrors({});
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
          nextErrors.email = "Enter a valid University of Moratuwa email ending with @uom.lk";
        }

        if (!studentData.studentId) {
          nextErrors.studentId = "Registration number is required";
        } else if (!isValidRegistrationNo(studentData.studentId)) {
          nextErrors.studentId =
            "Enter a valid registration number like 221234X. The last letter must be a capital letter.";
        }

        // Ensure email OTP verification has been completed
        if (!isOtpVerified) {
          setErrors({ general: "Please verify your email using a verification code first." });
          setIsLoading(false);
          return;
        }

        if (!studentData.password || !studentData.confirmPassword) {
          nextErrors.general = "Password fields are required";
        } else if (!isValidPassword(studentData.password)) {
          nextErrors.password =
            "Password must be at least 8 characters, containing at least one uppercase letter, one lowercase letter, and one number.";
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
        await authService.registerStudent(
          studentDisplayName,
          studentData.email,
          studentData.studentId,
          studentData.password
        );

        // Success - clear auto-login session and redirect to login page
        authService.logout();
        setSuccessMessage("Registration successful! Redirecting to login page...");
        setStudentData({
          title: "",
          name: "",
          email: "",
          studentId: "",
          password: "",
          confirmPassword: "",
        });
        setTimeout(() => navigate("/login"), 2000);
      } else if (step === "expert") {
        // Validate form
        if (
          !expertData.name ||
          !expertData.email ||
          !expertData.specialization ||
          (expertData.specialization === "Other" && !expertData.specializationOther) ||
          !expertDocuments.length
        ) {
          setErrors({
            general:
              "Name, email, specialization (or specify), and at least one document are required",
          });
          setIsLoading(false);
          return;
        }

        // Submit expert application with documents (include title)
        const resolvedSpecialization =
          expertData.specialization === "Other"
            ? expertData.specializationOther
            : expertData.specialization;

        const response = await authService.submitExpertApplication({
          name: expertData.name,
          title: expertData.title,
          email: expertData.email,
          specialization: resolvedSpecialization,
          documents: expertDocuments,
        });

        // Success - show message and display pending status
        setSuccessMessage(
          response.message || "Application submitted successfully. Please wait for admin review."
        );
        if (response.application) {
          setSubmittedApplication(response.application);
        }
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
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Join MindMate</h1>
              <p className="text-gray-500">Select your account type to continue</p>
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
                    <h3 className="text-lg font-semibold text-[#5bb5a1]">I'm a Student</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      Access mental health support, connect with experts, and join peer support
                      groups
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
                      Provide professional counseling, manage appointments, and support students
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
              <Link to="/login" className="text-[#5bb5a1] hover:underline font-medium">
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
              <h1 className="text-2xl font-bold text-gray-800 mb-1">Create Your Account</h1>
              <p className="text-gray-500">Register as University of Moratuwa Student</p>
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

            {applicationLookupMessage && (
              <div
                className={`mb-5 rounded-xl px-4 py-3 text-sm ${
                  applicationLookupStatus === "approved"
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                    : applicationLookupStatus === "rejected"
                      ? "border border-rose-200 bg-rose-50 text-rose-700"
                      : "border border-amber-200 bg-amber-50 text-amber-700"
                }`}
              >
                <div className="font-medium">
                  {checkingApplicationStatus
                    ? "Checking application status..."
                    : applicationLookupMessage}
                </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <select
                    name="title"
                    value={studentData.title}
                    onChange={handleStudentChange}
                    disabled={isOtpSent || isOtpVerified}
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-50 disabled:text-gray-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={studentData.name}
                    onChange={handleStudentChange}
                    disabled={isOtpSent || isOtpVerified}
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-50 disabled:text-gray-500 ${
                      errors.name ? "border-red-300" : "border-gray-200"
                    }`}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
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
                  placeholder="@uom.lk"
                  disabled={isOtpSent || isOtpVerified}
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-50 disabled:text-gray-500 ${
                    errors.email ? "border-red-300" : "border-gray-200"
                  }`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use your University of Moratuwa email address
                </p>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
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
                  disabled={isOtpSent || isOtpVerified}
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-50 disabled:text-gray-500 ${
                    errors.studentId ? "border-red-300" : "border-gray-200"
                  }`}
                />
                {errors.studentId && (
                  <p className="mt-1 text-sm text-red-600">{errors.studentId}</p>
                )}
              </div>

              {/* Status and Notification messages */}
              {otpMessage && (
                <div
                  className={`rounded-xl px-4 py-3 text-sm border ${
                    isOtpVerified
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-teal-50 border-teal-200 text-teal-800"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{otpMessage}</span>
                    {isOtpVerified && (
                      <button
                        type="button"
                        onClick={handleResetOtpFlow}
                        className="text-emerald-700 underline font-medium hover:text-emerald-950 ml-2 cursor-pointer"
                      >
                        Change Info
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* OTP Code Request and Code Submission Controls */}
              {!isOtpVerified && (
                <div className="pt-2">
                  {!isOtpSent ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={
                        otpLoading ||
                        !studentData.name ||
                        !studentData.email ||
                        !studentData.studentId
                      }
                      className="w-full py-3 bg-[#5bb5a1] text-white rounded-xl font-medium hover:bg-[#4a9d8b] transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {otpLoading ? "Sending Verification Code..." : "Verify Email Address"}
                    </button>
                  ) : (
                    <div className="space-y-4 p-4 border border-teal-100 bg-teal-50/30 rounded-2xl">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Verification Code (OTP)
                        </label>
                        <input
                          type="text"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.trim())}
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-center text-xl font-mono tracking-widest"
                        />
                      </div>
                      <div className="flex space-x-3">
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={otpLoading || otpCode.length !== 6}
                          className="flex-1 py-3 bg-[#5bb5a1] text-white rounded-xl font-medium hover:bg-[#4a9d8b] transition-all disabled:opacity-50 cursor-pointer"
                        >
                          {otpLoading ? "Verifying..." : "Confirm Code"}
                        </button>
                        <button
                          type="button"
                          onClick={handleResetOtpFlow}
                          className="px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all cursor-pointer"
                        >
                          Change Details
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Password Fields & final submit, shown ONLY when OTP is verified */}
              {isOtpVerified && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showStudentPassword ? "text" : "password"}
                          name="password"
                          value={studentData.password}
                          onChange={handleStudentChange}
                          className={`w-full pl-4 pr-12 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                            errors.password ? "border-red-300" : "border-gray-200"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowStudentPassword(!showStudentPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          {showStudentPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type={showStudentConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={studentData.confirmPassword}
                          onChange={handleStudentChange}
                          className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowStudentConfirmPassword(!showStudentConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          {showStudentConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-[#5bb5a1] text-white rounded-xl font-medium hover:bg-[#4a9d8b] transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </button>
                </>
              )}
            </form>

            <p className="mt-6 text-center text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-[#5bb5a1] hover:underline font-medium">
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
              <h1 className="text-2xl font-bold text-gray-800 mb-1">Create Your Account</h1>
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

            {applicationLookupMessage && (
              <div
                className={`mb-5 rounded-xl px-4 py-3 text-sm ${
                  applicationLookupStatus === "approved"
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                    : applicationLookupStatus === "rejected"
                      ? "border border-rose-200 bg-rose-50 text-rose-700"
                      : "border border-amber-200 bg-amber-50 text-amber-700"
                }`}
              >
                <div className="font-medium">
                  {checkingApplicationStatus
                    ? "Checking application status..."
                    : applicationLookupMessage}
                </div>
              </div>
            )}

            {applicationLookupStatus === "approved" && (
              <form
                onSubmit={handleExpertAccountRegister}
                className="mb-5 space-y-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4"
              >
                <div className="text-sm font-semibold text-emerald-800">
                  Approved application detected
                </div>
                <div className="text-sm text-emerald-700">
                  Set a password to create your expert account.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <div className="relative">
                      <input
                        type={showExpertPassword ? "text" : "password"}
                        value={expertAccountPassword}
                        onChange={(e) => setExpertAccountPassword(e.target.value)}
                        className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowExpertPassword(!showExpertPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showExpertPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showExpertConfirmPassword ? "text" : "password"}
                        value={expertAccountConfirmPassword}
                        onChange={(e) => setExpertAccountConfirmPassword(e.target.value)}
                        className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowExpertConfirmPassword(!showExpertConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showExpertConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={registeringExpertAccount}
                  className="w-full py-3 bg-[#5bb5a1] text-white rounded-xl font-medium hover:bg-[#4a9d8b] transition-colors disabled:opacity-50"
                >
                  {registeringExpertAccount ? "Creating Account..." : "Create Expert Account"}
                </button>

                {expertAccountMessage && (
                  <div className="rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-700">
                    {expertAccountMessage}
                  </div>
                )}
              </form>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
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
                <select
                  name="specialization"
                  value={expertData.specialization}
                  onChange={handleExpertChange}
                  className="w-full px-3 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select specialization</option>
                  <option value="Clinical Psychology">Clinical Psychology</option>
                  <option value="Counseling Psychology">Counseling Psychology</option>
                  <option value="Psychiatry">Psychiatry</option>
                  <option value="Social Work">Social Work</option>
                  <option value="Psychiatric Nursing">Psychiatric Nursing</option>
                  <option value="Marriage & Family Therapy">Marriage & Family Therapy</option>
                  <option value="Other">Other</option>
                </select>

                {expertData.specialization === "Other" && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Please specify
                    </label>
                    <input
                      type="text"
                      name="specializationOther"
                      value={expertData.specializationOther}
                      onChange={handleExpertChange}
                      placeholder="e.g. Neuropsychology"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                )}
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
                  Upload your CV, license, certificates, or other verification documents.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || submittedApplication}
                className="w-full py-3 bg-[#2c6e5f] text-white rounded-xl font-medium hover:bg-[#1b4d42] transition-colors disabled:opacity-50"
              >
                {isLoading
                  ? "Submitting Application..."
                  : submittedApplication
                    ? "Application Pending"
                    : applicationLookupStatus === "approved"
                      ? "Application Approved"
                      : "Submit Application"}
              </button>
            </form>

            {submittedApplication && (
              <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <h3 className="font-semibold text-gray-800 mb-1">
                  Application Submitted — Pending Review
                </h3>
                <p className="text-sm text-gray-700 mb-2">
                  Your application is pending admin review. We'll notify you when it's reviewed.
                </p>
                <div className="text-xs text-gray-600">
                  <div>
                    <strong>Application ID:</strong> {submittedApplication.id}
                  </div>
                  <div>
                    <strong>Submitted:</strong>{" "}
                    {new Date(submittedApplication.created_at).toLocaleString()}
                  </div>
                  <div>
                    <strong>Status:</strong> {submittedApplication.status}
                  </div>
                </div>
                <div className="mt-3">
                  <Link to="/login" className="text-sm text-[#5bb5a1] hover:underline">
                    Go to Sign in
                  </Link>
                </div>
              </div>
            )}
            <p className="mt-6 text-center text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-[#5bb5a1] hover:underline font-medium">
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
