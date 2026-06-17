import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaEdit,
  FaCamera,
  FaSave,
  FaTimes,
  FaCalendarAlt,
  FaTrophy,
  FaBrain,
  FaClipboardList,
} from "react-icons/fa";
import { Card, Button, Input } from "../components";
import { authService } from "../services/authService";

// Lightweight Animated Counter for Stats
const AnimatedCounter = ({ targetValue }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(targetValue, 10);
    if (isNaN(end) || end === 0) {
      setCount(targetValue);
      return;
    }
    
    const duration = 1000; // 1s total duration
    const incrementTime = Math.max(Math.floor(duration / end), 15);
    
    const timer = setInterval(() => {
      start += 1;
      if (start >= end) {
        clearInterval(timer);
        setCount(targetValue);
      } else {
        const suffix = typeof targetValue === "string" ? targetValue.replace(/^\d+/, "") : "";
        setCount(start + suffix);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [targetValue]);

  return <span>{count}</span>;
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState("student");
  const [isEditing, setIsEditing] = useState(false);
  const [statsData, setStatsData] = useState({
    daysActive: 0,
    moodLogsCount: 0,
    assessmentsCount: 0,
    moodStreak: 0
  });

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    registration_no: "",
    phone: "",
    bio: "",
    specialization: "",
    qualifications: "",
    license_number: "",
  });

  const [profileStats, setProfileStats] = useState([]);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await authService.getUserProfile();
        if (data && data.user) {
          setUserData({
            name: data.user.name || "",
            email: data.user.email || "",
            registration_no: data.user.registration_no || "",
            phone: data.user.phone || "",
            bio: data.user.bio || "",
            specialization: data.user.specialization || "",
            qualifications: data.user.qualifications || "",
            license_number: data.user.license_number || "",
          });
          setUserRole(data.user.role || "student");

          if (data.stats) {
            setStatsData({
              daysActive: data.stats.daysActive || 0,
              moodLogsCount: data.stats.moodLogsCount || 0,
              assessmentsCount: data.stats.assessmentsCount || 0,
              moodStreak: data.stats.moodStreak || 0
            });
          }

          // Build dynamic stats
          const statsArray = [
            { label: "Days Active", value: String(data.stats.daysActive || 1), icon: FaCalendarAlt, glow: "hover-glow-emerald", iconColor: "text-emerald-500" },
            { label: "Mood Logs", value: String(data.stats.moodLogsCount || 0), icon: FaBrain, glow: "hover-glow-teal", iconColor: "text-teal-500" },
            { label: "Assessments", value: String(data.stats.assessmentsCount || 0), icon: FaClipboardList, glow: "hover-glow-blue", iconColor: "text-blue-500" },
            { label: "Streak", value: `${data.stats.moodStreak || 0} days`, icon: FaTrophy, glow: "hover-glow-amber", iconColor: "text-amber-500" },
          ];
          setProfileStats(statsArray);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        setError("Failed to load profile information. Please refresh.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setError(null);
      await authService.updateUserProfile({
        name: userData.name,
        bio: userData.bio,
        phone: userData.phone,
      });
      setIsEditing(false);
      
      // Refresh stats/details
      const data = await authService.getUserProfile();
      if (data && data.user) {
        setUserData({
          name: data.user.name || "",
          email: data.user.email || "",
          registration_no: data.user.registration_no || "",
          phone: data.user.phone || "",
          bio: data.user.bio || "",
          specialization: data.user.specialization || "",
          qualifications: data.user.qualifications || "",
          license_number: data.user.license_number || "",
        });
      }
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert(err.message || "Failed to update profile changes");
    }
  };

  const getUserLevel = (days) => {
    const val = parseInt(days, 10);
    if (val >= 30) return { title: "Mindfulness Master 🌟", badgeColor: "bg-[#2c6e5f] text-white" };
    if (val >= 14) return { title: "Self-Care Scholar 🌿", badgeColor: "bg-emerald-50 text-emerald-800 border border-emerald-100" };
    if (val >= 7) return { title: "Emotional Explorer 🧭", badgeColor: "bg-teal-50 text-teal-800 border border-teal-100" };
    return { title: "Mindful Beginner 🌱", badgeColor: "bg-indigo-50 text-indigo-700 border border-indigo-100" };
  };

  const levelDetails = getUserLevel(statsData.daysActive);

  // Gamified milestones list
  const badges = [
    {
      id: "consistency",
      title: "Consistency Pioneer",
      description: "Active on MindMate for at least 7 days",
      requirement: "7+ Days Active",
      unlocked: statsData.daysActive >= 7,
      icon: "📅",
    },
    {
      id: "tracking",
      title: "Emotional Tracker",
      description: "Logged your mood 5 or more times",
      requirement: "5+ Mood Logs",
      unlocked: statsData.moodLogsCount >= 5,
      icon: "🧠",
    },
    {
      id: "assessments",
      title: "Insight Seeker",
      description: "Completed your first self-assessment",
      requirement: "1+ Assessments",
      unlocked: statsData.assessmentsCount >= 1,
      icon: "📝",
    },
    {
      id: "streak",
      title: "Streak Maker",
      description: "Maintained a streak of 3 or more days",
      requirement: "3+ Day Streak",
      unlocked: statsData.moodStreak >= 3,
      icon: "🔥",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f5e7] flex items-center justify-center">
        <p className="text-gray-500 font-bold animate-pulse">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f5e7] pt-12 pb-16">
      <div className="max-w-6xl mx-auto px-6">

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-center font-medium shadow-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Profile Header */}
        <Card className="mb-8 rounded-3xl border border-gray-100 shadow-sm bg-white p-6 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 relative z-10">
            
            {/* Interactive Avatar Photo Trigger */}
            <motion.div 
              className="relative group cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-24 h-24 rounded-full bg-[#2c6e5f]/15 flex items-center justify-center text-[#2c6e5f] text-3xl font-extrabold shadow-inner group-hover:bg-[#2c6e5f]/25 transition-all duration-300 border border-white">
                {userData.name.charAt(0).toUpperCase()}
              </div>
              <div className="absolute inset-0 bg-[#2c6e5f]/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <FaCamera className="text-white text-xl animate-pulse" />
              </div>
            </motion.div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-extrabold text-[#1b4d42] tracking-tight">
                {userData.name}
              </h1>
              <p className="text-gray-500 mt-1 font-medium text-sm">{userData.email}</p>
              
              <div className="flex items-center gap-2 justify-center md:justify-start mt-2">
                <span className="text-gray-400 text-[10px] uppercase font-bold bg-gray-100 px-2.5 py-0.5 rounded-full">
                  {userRole}
                </span>
                {userRole === "student" && (
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${levelDetails.badgeColor}`}>
                    {levelDetails.title}
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 mt-4 text-sm italic font-medium leading-relaxed max-w-lg">
                "{userData.bio || "No bio added yet. Click edit to tell us a little about your journey."}"
              </p>
            </div>

            {/* Edit Button */}
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant={isEditing ? "danger" : "secondary"}
                onClick={() => setIsEditing(!isEditing)}
                icon={isEditing ? FaTimes : FaEdit}
                className="rounded-2xl shadow-sm border border-gray-100 text-sm font-semibold active:scale-95"
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
            </motion.div>
          </div>

          {/* Stats Section with Counters */}
          {userRole === "student" && profileStats.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-100">
              {profileStats.map((stat, index) => {
                const StatIcon = stat.icon;
                const isStreakFlame = stat.label === "Streak" && statsData.moodStreak > 0;
                return (
                  <motion.div 
                    key={index} 
                    whileHover={{ y: -4 }}
                    className={`text-center p-4 bg-gray-50/50 rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 ${stat.glow} ${isStreakFlame ? "animate-flame" : ""}`}
                  >
                    <div className="flex justify-center mb-1.5">
                      <StatIcon className={stat.iconColor} size={18} />
                    </div>
                    <div className="text-2xl font-extrabold text-gray-800">
                      <AnimatedCounter targetValue={stat.value} />
                    </div>
                    <div className="text-xs text-gray-500 font-semibold mt-0.5">{stat.label}</div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Profile Form Card Content */}
        <Card className="rounded-3xl border border-gray-100 shadow-sm bg-white p-6 overflow-hidden">
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#1b4d42] flex items-center gap-2">
              <span>👤</span> Personal Information
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                name="name"
                value={userData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                icon={FaUser}
                className="interactive-input"
              />
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={userData.email}
                onChange={handleInputChange}
                disabled={true}
                icon={FaEnvelope}
              />
              {userRole === "student" && (
                <Input
                  label="Registration Number"
                  name="registration_no"
                  value={userData.registration_no}
                  onChange={handleInputChange}
                  disabled={true}
                  icon={FaUser}
                />
              )}
              {userRole === "expert" && (
                <>
                  <Input
                    label="Specialization"
                    name="specialization"
                    value={userData.specialization}
                    disabled={true}
                    icon={FaBrain}
                  />
                  <Input
                    label="License Number"
                    name="license_number"
                    value={userData.license_number}
                    disabled={true}
                    icon={FaUser}
                  />
                  <Input
                    label="Qualifications"
                    name="qualifications"
                    value={userData.qualifications}
                    disabled={true}
                    icon={FaClipboardList}
                  />
                </>
              )}
              <Input
                label="Phone Number"
                name="phone"
                type="tel"
                value={userData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                icon={FaPhone}
                className="interactive-input"
              />
            </div>

            <div className="interactive-input">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Bio
              </label>
              <textarea
                name="bio"
                value={userData.bio}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#2c6e5f] focus:ring-2 focus:ring-[#2c6e5f]/15 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-700 transition-all leading-relaxed font-medium"
                placeholder="Tell us a little about your wellness journey..."
              />
            </div>

            {/* Expandable Save Changes with animation */}
            <AnimatePresence>
              {isEditing && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex justify-end pt-3"
                >
                  <Button 
                    variant="primary" 
                    onClick={handleSave} 
                    icon={FaSave} 
                    className="bg-[#2c6e5f] hover:bg-[#1b4d42] px-6 py-2.5 rounded-2xl font-bold shadow-md hover:shadow-lg text-sm transition-all cursor-pointer active:scale-95"
                  >
                    Save Changes
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>

        {/* Wellness Milestones Badges Section */}
        {userRole === "student" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-8 bg-white rounded-3xl border border-gray-100 shadow-sm p-6"
          >
            <h2 className="text-xl font-bold text-[#1b4d42] mb-5 flex items-center gap-2">
              <span>🏆</span> Wellness Milestones & Badges
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-5 rounded-3xl flex flex-col items-center text-center transition-all ${
                    badge.unlocked
                      ? "badge-unlocked"
                      : "badge-locked"
                  }`}
                >
                  <div className="text-4xl mb-3">{badge.icon}</div>
                  <h4 className="text-sm font-bold text-gray-800 leading-tight">{badge.title}</h4>
                  <p className="text-[10px] text-gray-500 font-semibold mt-1.5 max-w-[150px] leading-relaxed">{badge.description}</p>
                  <div className={`mt-4 text-[9px] font-extrabold px-3 py-1 rounded-full ${
                    badge.unlocked ? "bg-white/40 text-[#1b4d42]" : "bg-gray-200 text-gray-400"
                  }`}>
                    {badge.requirement}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default ProfilePage;
