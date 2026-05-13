import { Link } from "react-router-dom";
import {
  FaShieldAlt,
  FaRobot,
  FaUserMd,
  FaUsers,
  FaChartLine,
  FaBook,
} from "react-icons/fa";
import mindmateLogo from "../assets/mindmate_logo.png";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#f9f5e7]">
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <img
              src={mindmateLogo}
              alt="MindMate"
              className="w-50 h-50 rounded-2xl"
            />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Your Mental Health Matters
          </h1>

          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
            A safe, confidential space for university students to access mental
            health support, connect with professionals, and track their wellness
            journey.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 bg-[#5bb5a1] text-white rounded-xl font-semibold hover:bg-[#4a9d8b] transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              I Have an Account
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Start Your Wellness Journey Today
          </h2>
          <p className="text-gray-600 mb-8">
            Join thousands of students who are taking control of their mental
            health.
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-[#f0b429] text-white rounded-xl font-semibold hover:bg-[#d9a41f] transition-colors"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <img src={mindmateLogo} alt="MindMate" className="w-6 h-6" />
            <span className="font-semibold text-gray-800">MindMate</span>
          </div>
          <p className="text-sm text-gray-500">
            © 2025 MindMate. A safe space for mental wellness.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
