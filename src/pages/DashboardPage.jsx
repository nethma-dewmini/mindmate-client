import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaComments,
  FaChartLine,
  FaClipboardList,
  FaUsers,
  FaBook,
  FaUserMd,
  FaSignOutAlt,
  FaFire,
  FaArrowRight,
} from "react-icons/fa";
import { authService } from "../services/authService";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser() || { name: "Student" };
  
  const [moodStreak, setMoodStreak] = useState("0 days tracked");
  const [streakCount, setStreakCount] = useState(0);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [todayMood, setTodayMood] = useState(3);
  const [affirmation, setAffirmation] = useState("");
  const [isAffirming, setIsAffirming] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

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
    setIsAffirming(true);
    setTimeout(() => setIsAffirming(false), 500);
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
        setStreakCount(summary.streak);
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
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
      
      // Refresh streak/summary
      const summary = await authService.getMoodSummary(30);
      if (summary && typeof summary.streak !== "undefined") {
        setStreakCount(summary.streak);
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

  const getMoodFeedback = (val) => {
    const map = {
      5: { text: "Awesome! Keep shining bright! 🌟", sub: "Share your high energy with others or reflect on this positive wave." },
      4: { text: "So glad you are feeling good today! 😊", sub: "Keep building on this momentum. You are doing fantastic." },
      3: { text: "A steady, balanced day is a good day. ⚖️", sub: "Take a deep breath and maintain this comfortable rhythm." },
      2: { text: "It is okay to have off days. Be gentle with yourself. 💛", sub: "Consider chatting with our AI Companion or listening to wellness audio." },
      1: { text: "We are sending you a warm digital hug. 🫂 You are not alone.", sub: "Reach out to a peer support group or connect with a professional." }
    };
    return map[val] || { text: "Thanks for checking in!", sub: "Logging your daily feelings builds excellent emotional self-awareness." };
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
      glowClass: "hover-glow-teal",
      tagColor: "bg-[#2c6e5f]/10 text-[#2c6e5f]",
    },
    {
      icon: FaChartLine,
      title: "Track Mood",
      description: "Log your daily mood check-in and analyze emotional trends over time",
      path: "/mood",
      glowClass: "hover-glow-indigo",
      tagColor: "bg-indigo-50 text-indigo-600",
    },
    {
      icon: FaUserMd,
      title: "Book Expert",
      description: "Schedule individual live guidance sessions with certified mental health experts",
      path: "/experts",
      glowClass: "hover-glow-rose",
      tagColor: "bg-rose-50 text-rose-600",
    },
  ];

  const selfCareTools = [
    {
      icon: FaClipboardList,
      title: "Self Assessments",
      description: "Evaluate your anxiety, mood, and stress using research-backed check-ins",
      path: "/assessment",
      glowClass: "hover-glow-amber",
      tagColor: "bg-amber-50 text-amber-600",
    },
    {
      icon: FaUsers,
      title: "Peer Support Groups",
      description: "Connect with local university students to share stories and grow in a secure group",
      path: "/peer-support",
      glowClass: "hover-glow-emerald",
      tagColor: "bg-emerald-50 text-emerald-600",
    },
    {
      icon: FaBook,
      title: "Resource Library",
      description: "Explore clinical articles, guided audio sessions, and wellness literature",
      path: "/resources",
      glowClass: "hover-glow-blue",
      tagColor: "bg-blue-50 text-blue-600",
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

  // Confetti generator
  const renderConfetti = () => {
    return Array.from({ length: 24 }).map((_, i) => {
      const colors = ["#cbd5e1", "#f59e0b", "#10b981", "#3b82f6", "#f43f5e", "#2c6e5f"];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const randomLeft = Math.random() * 100;
      const randomDelay = Math.random() * 0.8;
      return (
        <span
          key={i}
          className="confetti-particle"
          style={{
            backgroundColor: randomColor,
            left: `${randomLeft}%`,
            top: `-10px`,
            animationDelay: `${randomDelay}s`,
          }}
        />
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#f9f5e7] pb-16">
      {/* Header */}
      <div className="gradient-premium-header py-10 px-6 relative overflow-hidden">
        {/* Subtle decorative circles for depth */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#5bb5a1]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 left-10 w-96 h-96 bg-[#f59e0b]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-extrabold text-[#1b4d42] tracking-tight flex items-center gap-2"
            >
              {greeting.text}, {user.name.split(" ")[0]}! <span className="inline-block animate-bounce">{greeting.icon}</span>
            </motion.h1>
            <p className="text-[#2c6e5f]/80 mt-1 font-medium">How are you feeling today? Take a moment for yourself.</p>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap">
            {/* Gamified Mood Streak Badge */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className={`flex items-center space-x-3 bg-white border border-[#2c6e5f]/10 px-5 py-2.5 rounded-2xl shadow-sm ${streakCount > 0 ? "animate-flame" : ""}`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg ${streakCount > 0 ? "bg-amber-100 text-amber-500" : "bg-gray-100 text-gray-400"}`}>
                <FaFire className={streakCount > 0 ? "text-amber-500" : "text-gray-400"} />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none">Mood Streak</p>
                <p className="text-xs font-bold text-gray-800 mt-0.5">{moodStreak}</p>
              </div>
            </motion.div>

            {/* Profile Avatar */}
            <Link
              to="/profile"
              title="View Profile"
              className="w-11 h-11 bg-[#2c6e5f] hover:bg-[#1b4d42] text-white rounded-2xl flex items-center justify-center font-bold shadow-md hover:scale-105 transition-all cursor-pointer border-2 border-white"
            >
              {user.name.charAt(0).toUpperCase()}
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 bg-white text-gray-600 hover:text-rose-500 rounded-2xl flex items-center space-x-2 border border-gray-100 shadow-sm transition-all duration-200 cursor-pointer active:scale-95 text-sm font-semibold"
            >
              <FaSignOutAlt className="text-gray-400 hover:text-rose-400" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Interactive Mood Check-in Widget */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8 transition-all hover:shadow-md relative overflow-hidden"
        >
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
              {renderConfetti()}
            </div>
          )}

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2c6e5f] bg-[#2c6e5f]/10 px-3 py-1 rounded-full">
                Daily Check-in
              </span>
              <h2 className="text-xl font-extrabold text-[#1b4d42] mt-3">
                How is your emotional balance right now?
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Your current mood streak is <span className="font-semibold text-[#2c6e5f]">{moodStreak}</span>. Log today's mood to keep it up!
              </p>
            </div>
            
            {/* Check-in status / interactive buttons */}
            <AnimatePresence mode="wait">
              {hasCheckedInToday ? (
                <motion.div 
                  key="checked-in"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-5 flex items-start gap-4 w-full md:w-auto md:max-w-md shadow-inner"
                >
                  <span className="text-3xl shrink-0 animate-bounce">🌟</span>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-800">{getMoodFeedback(todayMood).text}</h4>
                    <p className="text-xs text-emerald-600/80 mt-1 leading-relaxed">{getMoodFeedback(todayMood).sub}</p>
                    <div className="mt-2.5 inline-block text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                      Logged: {getMoodEmoji(todayMood)}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="needs-check-in"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 flex-wrap w-full md:w-auto"
                >
                  {[
                    { val: 1, label: "Sad", emoji: "😢", color: "hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600" },
                    { val: 2, label: "Down", emoji: "🙁", color: "hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600" },
                    { val: 3, label: "Neutral", emoji: "😐", color: "hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600" },
                    { val: 4, label: "Good", emoji: "🙂", color: "hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600" },
                    { val: 5, label: "Great", emoji: "😄", color: "hover:bg-teal-50 hover:border-teal-300 hover:text-teal-600" },
                  ].map((item) => (
                    <motion.button
                      key={item.val}
                      onClick={() => handleMoodSubmit(item.val)}
                      whileHover={{ scale: 1.12, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all duration-200 cursor-pointer min-w-[76px] ${item.color}`}
                    >
                      <span className="text-3xl mb-1.5">{item.emoji}</span>
                      <span className="text-[11px] font-bold text-gray-500">{item.label}</span>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Affirmation Widget */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gradient-to-r from-emerald-50/70 to-teal-50/40 rounded-3xl p-6 border border-emerald-100/60 mb-8 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <span className="text-3xl animate-float">🌱</span>
            <div>
              <p className="text-xs font-bold text-[#2c6e5f] uppercase tracking-wider">Mindful Affirmation</p>
              <div className="h-auto overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p 
                    key={affirmation}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="text-gray-700 italic font-semibold mt-1.5 leading-relaxed text-sm md:text-base"
                  >
                    "{affirmation}"
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </div>
          <button
            onClick={handleAffirmationCycle}
            className="px-5 py-2.5 bg-white text-[#2c6e5f] hover:bg-[#2c6e5f] hover:text-white border border-[#2c6e5f]/15 hover:border-[#2c6e5f] rounded-2xl text-xs font-bold shadow-sm transition-all duration-300 shrink-0 cursor-pointer flex items-center gap-2 active:scale-95 group"
          >
            <span>New Affirmation</span>
            <span className={`transition-transform duration-500 ease-out inline-block ${isAffirming ? "rotate-180" : "group-hover:rotate-45"}`}>🔄</span>
          </button>
        </motion.div>

        {/* Primary Actions Grid */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold text-[#1b4d42] mb-5 flex items-center gap-2">
            <span>🎯</span> Primary Support & Care
          </h2>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {primaryActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div key={index} variants={itemVariants} className="h-full">
                  <Link to={action.path} className="group block h-full">
                    <div className={`glass-card p-6 rounded-3xl h-full flex flex-col justify-between ${action.glowClass} border border-gray-100`}>
                      <div>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 text-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ${action.tagColor}`}>
                          <Icon />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-[#2c6e5f] transition-colors duration-200">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-500 leading-relaxed font-medium">
                          {action.description}
                        </p>
                      </div>
                      <div className="mt-6 text-xs font-bold text-[#2c6e5f] flex items-center gap-1.5 arrow-slide">
                        <span>Get Started</span>
                        <FaArrowRight className="transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Secondary Tools and Resources */}
        <div className="mb-12">
          <h2 className="text-xl font-extrabold text-[#1b4d42] mb-5 flex items-center gap-2">
            <span>🌿</span> Self-Care Tools & Resources
          </h2>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {selfCareTools.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div key={index} variants={itemVariants} className="h-full">
                  <Link to={action.path} className="group block h-full">
                    <div className={`glass-card p-6 rounded-3xl h-full flex flex-col justify-between ${action.glowClass} border border-gray-100`}>
                      <div>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 text-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ${action.tagColor}`}>
                          <Icon />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-[#2c6e5f] transition-colors duration-200">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-400 group-hover:text-gray-500 transition-colors leading-relaxed font-medium">
                          {action.description}
                        </p>
                      </div>
                      <div className="mt-6 text-xs font-bold text-slate-500 group-hover:text-[#2c6e5f] flex items-center gap-1.5 arrow-slide">
                        <span>Explore Tool</span>
                        <FaArrowRight className="transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Quick Tips */}
        <div className="mb-8">
          <h2 className="text-xl font-extrabold text-[#1b4d42] mb-5 flex items-center gap-2">
            <span>💡</span> Daily Mental Wellness Tips
          </h2>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {quickTips.map((tip, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="tip-card bg-white rounded-3xl p-6 text-center border border-gray-100 shadow-sm flex flex-col items-center"
              >
                <div className="text-4xl mb-4 bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center shadow-inner hover:scale-110 transition-transform duration-300">
                  {tip.emoji}
                </div>
                <h3 className="font-bold text-[#2c6e5f] mb-2 text-base">
                  {tip.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">{tip.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
