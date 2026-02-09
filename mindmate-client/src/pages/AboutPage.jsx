import { Link } from "react-router-dom";
import {
  FaShieldAlt,
  FaRobot,
  FaUserMd,
  FaUsers,
  FaChartLine,
  FaBook,
  FaHeart,
  FaLock,
  FaGraduationCap,
} from "react-icons/fa";
import mindmateLogo from "../assets/mindmate_logo.png";

const AboutPage = () => {
  const features = [
    {
      icon: FaRobot,
      title: "AI-Powered Chat Support",
      description:
        "24/7 mental health support through our intelligent chatbot that provides immediate, personalized guidance and coping strategies.",
    },
    {
      icon: FaUserMd,
      title: "Professional Counseling",
      description:
        "Connect with licensed mental health professionals for one-on-one counseling sessions, either in-person or through secure video calls.",
    },
    {
      icon: FaUsers,
      title: "Peer Support Groups",
      description:
        "Join moderated peer support groups to share experiences, find community, and receive support from fellow students.",
    },
    {
      icon: FaChartLine,
      title: "Mood Tracking & Analytics",
      description:
        "Track your emotional patterns over time with intuitive mood logging and gain insights through personalized analytics.",
    },
    {
      icon: FaBook,
      title: "Mental Health Resources",
      description:
        "Access a curated library of articles, videos, and guides covering topics from stress management to mindfulness.",
    },
    {
      icon: FaShieldAlt,
      title: "Crisis Support",
      description:
        "Immediate access to crisis resources and emergency contacts when you need urgent support.",
    },
  ];

  const values = [
    {
      icon: FaLock,
      title: "Privacy & Confidentiality",
      description:
        "Your mental health journey is personal. We ensure complete confidentiality with end-to-end encryption and strict data protection.",
    },
    {
      icon: FaHeart,
      title: "Compassionate Care",
      description:
        "We believe in providing empathetic, non-judgmental support that respects your unique experiences and challenges.",
    },
    {
      icon: FaGraduationCap,
      title: "Student-Centered",
      description:
        "Designed specifically for university students, understanding the unique pressures of academic life in Sri Lanka.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f9f5e7]">
      {/* Hero Section */}
      <section className="py-16 px-6 gradient-teal">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <img src={mindmateLogo} alt="MindMate" className="w-24 h-24" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            About MindMate
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            A comprehensive mental health support platform designed specifically
            for university students in Sri Lanka
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              Our Mission
            </h2>
            <p className="text-gray-600 text-center max-w-3xl mx-auto">
              MindMate aims to bridge the gap in mental health support for
              university students by providing accessible, stigma-free, and
              effective mental wellness services. We understand that academic
              life comes with unique challenges—exam stress, social pressures,
              career anxiety, and more. Our platform provides the tools and
              support you need to maintain your mental well-being throughout
              your educational journey.
            </p>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
            Why MindMate?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-red-50 rounded-2xl p-6">
              <h3 className="font-semibold text-red-700 mb-3">The Challenge</h3>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li>• Limited access to mental health services on campuses</li>
                <li>• Social stigma around seeking mental health support</li>
                <li>• Long waiting times for counseling appointments</li>
                <li>• Lack of awareness about available resources</li>
                <li>• High costs of private mental health services</li>
              </ul>
            </div>
            <div className="bg-green-50 rounded-2xl p-6">
              <h3 className="font-semibold text-green-700 mb-3">
                Our Solution
              </h3>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li>• 24/7 AI-powered support accessible anytime</li>
                <li>• Anonymous peer support groups</li>
                <li>• Easy booking with verified professionals</li>
                <li>• Comprehensive resource library</li>
                <li>• Affordable and student-friendly pricing</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
            Our Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-[#5bb5a1] mb-4">
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

      {/* Values Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
            Our Values
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-[#5bb5a1] rounded-full flex items-center justify-center text-white mx-auto mb-4">
                  <value.icon className="text-2xl" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Types */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
            Who Uses MindMate?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-[#5bb5a1]">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-[#5bb5a1] mb-4">
                <FaGraduationCap className="text-xl" />
              </div>
              <h3 className="font-semibold text-[#5bb5a1] mb-2">Students</h3>
              <p className="text-sm text-gray-600">
                University students seeking mental health support, mood
                tracking, peer connections, and professional counseling services
                throughout their academic journey.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-[#e74c3c]">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-[#e74c3c] mb-4">
                <FaUserMd className="text-xl" />
              </div>
              <h3 className="font-semibold text-[#e74c3c] mb-2">
                Mental Health Experts
              </h3>
              <p className="text-sm text-gray-600">
                Licensed psychologists, counselors, and mental health
                professionals who provide professional support, manage
                appointments, and contribute to the resource library.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-[#5bb5a1]">
        <div className="max-w-2xl mx-auto text-center text-white">
          <h2 className="text-2xl font-bold mb-4">
            Ready to Start Your Wellness Journey?
          </h2>
          <p className="mb-8 text-teal-100">
            Join thousands of students who are taking control of their mental
            health with MindMate.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-3 bg-white text-[#5bb5a1] rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 bg-[#4a9d8b] text-white rounded-xl font-semibold hover:bg-[#3d8a79] transition-colors"
            >
              Sign In
            </Link>
          </div>
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

export default AboutPage;
