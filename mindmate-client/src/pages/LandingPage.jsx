import { Link } from "react-router-dom";
import {
  FaShieldAlt,
  FaRobot,
  FaUserMd,
  FaUsers,
  FaChartLine,
  FaBook,
  FaBrain,
} from "react-icons/fa";

const LandingPage = () => {
  const features = [
    {
      icon: FaShieldAlt,
      title: "Privacy First",
      description: "Your data is encrypted and completely confidential",
      color: "bg-teal-100 text-[#5bb5a1]",
    },
    {
      icon: FaRobot,
      title: "AI Support",
      description: "24/7 mental health support powered by AI",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: FaUserMd,
      title: "Expert Access",
      description: "Connect with licensed mental health professionals",
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: FaUsers,
      title: "Peer Support",
      description: "Join moderated groups with fellow students",
      color: "bg-orange-100 text-orange-600",
    },
    {
      icon: FaChartLine,
      title: "Track Progress",
      description: "Monitor your mental wellness journey",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: FaBook,
      title: "Resources",
      description: "Access curated mental health content",
      color: "bg-pink-100 text-pink-600",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f9f5e7]">
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 bg-[#5bb5a1] rounded-2xl flex items-center justify-center">
              <FaBrain className="text-4xl text-white" />
            </div>
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

      {/* Features Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-12">
            Everything You Need for Mental Wellness
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="p-6 bg-gray-50 rounded-2xl">
                <div
                  className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4`}
                >
                  <feature.icon className="text-xl" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#5bb5a1] rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-8">
              Trusted by Students Across Sri Lanka
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-3xl font-bold">5,000+</div>
                <div className="text-teal-100 text-sm">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold">50+</div>
                <div className="text-teal-100 text-sm">Verified Experts</div>
              </div>
              <div>
                <div className="text-3xl font-bold">10,000+</div>
                <div className="text-teal-100 text-sm">Chat Sessions</div>
              </div>
              <div>
                <div className="text-3xl font-bold">4.8</div>
                <div className="text-teal-100 text-sm">User Rating</div>
              </div>
            </div>
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
            <FaBrain className="text-[#5bb5a1] text-xl" />
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
