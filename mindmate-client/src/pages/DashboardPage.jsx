import { Link, useNavigate } from "react-router-dom";
import {
  FaComments,
  FaChartLine,
  FaClipboardList,
  FaUsers,
  FaBook,
  FaUserMd,
  FaSignOutAlt,
} from "react-icons/fa";

const DashboardPage = () => {
  const navigate = useNavigate();
  const user = { name: "Nethma" };

  const handleLogout = () => {
    navigate("/");
  };

  const quickActions = [
    {
      icon: FaComments,
      title: "Start Chat",
      description: "Talk to our AI assistant for immediate support",
      path: "/chat",
    },
    {
      icon: FaChartLine,
      title: "Track Mood",
      description: "Log your daily mood and track patterns",
      path: "/mood",
    },
    {
      icon: FaClipboardList,
      title: "Take Assessment",
      description: "Evaluate your mental health with evidence-based tools",
      path: "/assessment",
    },
    {
      icon: FaUsers,
      title: "Peer Support",
      description: "Connect with others in moderated support groups",
      path: "/peer-support",
    },
    {
      icon: FaBook,
      title: "Browse Resources",
      description: "Access expert articles, videos, and guides",
      path: "/resources",
    },
    {
      icon: FaUserMd,
      title: "Book Expert",
      description: "Schedule a session with mental health professionals",
      path: "/experts",
    },
  ];

  const stats = [
    { label: "Next Appointment", value: "2026-01-22" },
    { label: "Available Experts", value: "4 professionals" },
    { label: "Mood Streak", value: "7 days tracked" },
  ];

  const quickTips = [
    {
      emoji: "🧘",
      title: "Take 5-Minute Breaks",
      description: "Regular breaks help reduce stress and improve focus",
    },
    {
      emoji: "💧",
      title: "Stay Hydrated",
      description: "Drinking water supports brain function and mood",
    },
    {
      emoji: "🌙",
      title: "Quality Sleep",
      description: "7-8 hours of sleep improves mental well-being",
    },
    {
      emoji: "🤝",
      title: "Connect with Others",
      description: "Social connections are vital for mental health",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f9f5e7]">
      {/* Header */}
      <div className="gradient-teal py-8 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome back, {user.name}!
            </h1>
            <p className="text-gray-600">How are you feeling today?</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-[#5bb5a1]">
              {user.name.charAt(0)}
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white text-red-400 rounded-lg flex items-center space-x-2 hover:bg-red-300"
            >
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.path}>
              <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-1">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-500">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
            >
              <p className="text-sm text-[#5bb5a1] font-medium">{stat.label}</p>
              <p className="text-lg font-semibold text-gray-800">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Quick Tips */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Quick Tips for Today
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickTips.map((tip, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100"
              >
                <div className="text-4xl mb-3">{tip.emoji}</div>
                <h3 className="font-semibold text-[#5bb5a1] mb-2">
                  {tip.title}
                </h3>
                <p className="text-sm text-gray-500">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
