import { useState, useEffect } from "react";
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
import { authService } from "../services/authService";

const DashboardPage = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser() || { name: "Student" };
  
  const [moodStreak, setMoodStreak] = useState("0 days tracked");
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [todayMood, setTodayMood] = useState(3);
  const [affirmation, setAffirmation] = useState("");

  const affirmations = [
    "You are capable of doing hard things.",
    "Your mental health is a priority. Your feelings are valid.",
    "One small step at a time is still progress. Be gentle with yourself.",
    "You do not have to be perfect; you just have to show up.",
    "Deep breaths. It is just a bad day, not a bad life.",
    "You are worthy of support, love, and healing.",
    "Your strength is stronger than your anxiety.",
    "Allow yourself to rest when you need it.",
    "In the middle of difficulty lies opportunity.",
    "Focus on the present moment; that is where your power lies."
  ];

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  const handleAffirmationCycle = () => {
    const currentIndex = affirmations.indexOf(affirmation);
    let nextIndex = Math.floor(Math.random() * affirmations.length);
    while (nextIndex === currentIndex && affirmations.length > 1) {
      nextIndex = Math.floor(Math.random() * affirmations.length);
    }
    setAffirmation(affirmations[nextIndex]);
  };

  const fetchDashboardData = async () => {
    try {
      const summary = await authService.getMoodSummary(30);
      if (summary && typeof summary.streak !== "undefined") {
        setMoodStreak(`${summary.streak} ${summary.streak === 1 ? "day" : "days"} tracked`);
      }

      // Check if logged mood today
      const entries = await authService.getMoodEntries(10);
      const todayStr = new Date().toDateString();
      const todayEntry = entries.find(
        (entry) => new Date(entry.created_at).toDateString() === todayStr
      );
      if (todayEntry) {
        setHasCheckedInToday(true);
        setTodayMood(todayEntry.mood);
      }
    } catch (err) {
      console.error("Failed to load mood dashboard data:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Set initial random affirmation
    setAffirmation(affirmations[Math.floor(Math.random() * affirmations.length)]);
  }, []);

  const handleMoodSubmit = async (moodVal) => {
    try {
      await authService.createMoodEntry({
        mood: moodVal,
        note: null,
      });
      setHasCheckedInToday(true);
      setTodayMood(moodVal);
      // Refresh streak/summary
      const summary = await authService.getMoodSummary(30);
      if (summary && typeof summary.streak !== "undefined") {
        setMoodStreak(`${summary.streak} ${summary.streak === 1 ? "day" : "days"} tracked`);
      }
    } catch (err) {
      console.error("Error logging mood from dashboard:", err);
    }
  };

  const getMoodEmoji = (val) => {
    const map = {
      5: "😄 Great",
      4: "🙂 Good",
      3: "😐 Neutral",
      2: "🙁 Down",
      1: "😢 Sad",
    };
    return map[val] || "😐 Neutral";
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good morning", icon: "☀️" };
    if (hour < 17) return { text: "Good afternoon", icon: "🌤️" };
    return { text: "Good evening", icon: "🌙" };
  };

  const greeting = getGreeting();

  const primaryActions = [
    {
      icon: FaComments,
      title: "AI Companion",
      description: "Talk to our compassionate AI assistant for immediate feedback and emotional relief",
      path: "/chat",
    },
    {
      icon: FaChartLine,
      title: "Track Mood",
      description: "Log your daily mood check-in and analyze emotional trends over time",
      path: "/mood",
    },
    {
      icon: FaUserMd,
      title: "Book Expert",
      description: "Schedule individual live guidance sessions with certified mental health experts",
      path: "/experts",
    },
  ];

  const selfCareTools = [
    {
      icon: FaClipboardList,
      title: "Self Assessments",
      description: "Evaluate your anxiety, mood, and stress using research-backed check-ins",
      path: "/assessment",
    },
    {
      icon: FaUsers,
      title: "Peer Support Groups",
      description: "Connect with local university students to share stories and grow in a secure group",
      path: "/peer-support",
    },
    {
      icon: FaBook,
      title: "Resource Library",
      description: "Explore clinical articles, guided audio sessions, and wellness literature",
      path: "/resources",
    },
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
              {greeting.text}, {user.name.split(" ")[0]}! {greeting.icon}
            </h1>
            <p className="text-gray-600">How are you feeling today?</p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/profile"
              title="View Profile"
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-[#2c6e5f] shadow-sm hover:scale-105 transition-transform cursor-pointer"
            >
              {user.name.charAt(0).toUpperCase()}
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white text-red-400 rounded-lg flex items-center space-x-2 hover:bg-red-50 border border-gray-100 shadow-sm transition-all cursor-pointer"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Interactive Mood Check-in Widget */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8 transition-all hover:shadow-md">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2c6e5f] bg-[#2c6e5f]/10 px-3 py-1 rounded-full">
                Daily Check-in
              </span>
              <h2 className="text-xl font-bold text-gray-800 mt-2.5">
                How is your emotional balance right now?
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Your current mood streak is <span className="font-semibold text-[#2c6e5f]">{moodStreak}</span>. Log today's mood to keep it up!
              </p>
            </div>
            {/* Check-in status / interactive buttons */}
            {hasCheckedInToday ? (
              <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-2xl p-4 flex items-center gap-3 w-full md:w-auto">
                <span className="text-2xl animate-pulse">🌟</span>
                <div>
                  <p className="text-sm font-semibold text-emerald-800">You're checked in for today!</p>
                  <p className="text-xs text-emerald-600">Logged mood: {getMoodEmoji(todayMood)}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
                {[
                  { val: 1, label: "Sad", emoji: "😢", color: "hover:bg-blue-50 hover:border-blue-300" },
                  { val: 2, label: "Down", emoji: "🙁", color: "hover:bg-indigo-50 hover:border-indigo-300" },
                  { val: 3, label: "Neutral", emoji: "😐", color: "hover:bg-amber-50 hover:border-amber-300" },
                  { val: 4, label: "Good", emoji: "🙂", color: "hover:bg-emerald-50 hover:border-emerald-300" },
                  { val: 5, label: "Great", emoji: "😄", color: "hover:bg-teal-50 hover:border-teal-300" },
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => handleMoodSubmit(item.val)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border border-gray-100 bg-gray-50/50 hover:-translate-y-1 transition-all duration-200 cursor-pointer min-w-[72px] ${item.color}`}
                  >
                    <span className="text-2.5xl mb-1">{item.emoji}</span>
                    <span className="text-[10px] font-semibold text-gray-500">{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Affirmation Widget */}
        <div className="bg-gradient-to-r from-[#2c6e5f]/10 to-[#2c6e5f]/5 rounded-3xl p-6 border border-[#2c6e5f]/20 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-3xl">🌱</span>
            <div>
              <p className="text-xs font-bold text-[#2c6e5f] uppercase tracking-wider">Mindful Affirmation</p>
              <p className="text-gray-700 italic font-medium mt-1">"{affirmation}"</p>
            </div>
          </div>
          <button
            onClick={handleAffirmationCycle}
            className="px-4 py-2 bg-white text-[#2c6e5f] hover:bg-[#2c6e5f] hover:text-white border border-[#2c6e5f]/20 rounded-xl text-xs font-semibold shadow-sm transition-all duration-200 shrink-0 cursor-pointer"
          >
            New Affirmation 🔄
          </button>
        </div>

        {/* Primary Actions Grid */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>🎯</span> Primary Support & Care
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {primaryActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link key={index} to={action.path} className="group">
                  <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-gray-100 h-full flex flex-col justify-between">
                    <div>
                      <div className="bg-[#2c6e5f]/10 text-[#2c6e5f] w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-xl group-hover:scale-110 transition-transform duration-300">
                        <Icon />
                      </div>
                      <h3 className="font-bold text-gray-800 mb-1 group-hover:text-[#2c6e5f] transition-colors duration-200">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                    <div className="mt-5 text-xs font-semibold text-[#2c6e5f] flex items-center gap-1 group-hover:gap-2 transition-all duration-300">
                      Get Started <span>→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Secondary Tools and Resources */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>🌿</span> Self-Care Tools & Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {selfCareTools.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link key={index} to={action.path} className="group">
                  <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-gray-100 h-full flex flex-col justify-between">
                    <div>
                      <div className="bg-slate-50 text-slate-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-xl group-hover:bg-[#2c6e5f]/10 group-hover:text-[#2c6e5f] transition-all duration-300">
                        <Icon />
                      </div>
                      <h3 className="font-bold text-gray-800 mb-1 group-hover:text-[#2c6e5f] transition-colors duration-200">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-500 transition-colors">
                        {action.description}
                      </p>
                    </div>
                    <div className="mt-5 text-xs font-semibold text-slate-500 group-hover:text-[#2c6e5f] flex items-center gap-1 group-hover:gap-2 transition-all duration-300">
                      Explore Tool <span>→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>💡</span> Daily Mental Wellness Tips
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickTips.map((tip, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100"
              >
                <div className="text-4xl mb-3">{tip.emoji}</div>
                <h3 className="font-semibold text-[#2c6e5f] mb-2">
                  {tip.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;

