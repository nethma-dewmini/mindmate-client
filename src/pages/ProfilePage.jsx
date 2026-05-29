import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBell,
  FaShieldAlt,
  FaPalette,
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

const ProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState("student");
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    registration_no: "",
    phone: "",
    bio: "",
  });

  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    weeklyReport: true,
    chatNotifications: true,
    emailUpdates: false,
  });

  const [profileStats, setProfileStats] = useState([]);

  const tabs = [
    { id: "profile", label: "Profile", icon: FaUser },
    { id: "notifications", label: "Notifications", icon: FaBell },
    { id: "privacy", label: "Privacy", icon: FaShieldAlt },
    { id: "preferences", label: "Preferences", icon: FaPalette },
  ];

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
          });
          setUserRole(data.user.role || "student");

          // Build dynamic stats
          const statsArray = [
            { label: "Days Active", value: String(data.stats.daysActive || 1), icon: FaCalendarAlt },
            { label: "Mood Logs", value: String(data.stats.moodLogsCount || 0), icon: FaBrain },
            { label: "Assessments", value: String(data.stats.assessmentsCount || 0), icon: FaClipboardList },
            { label: "Streak", value: `${data.stats.moodStreak || 0} days`, icon: FaTrophy },
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

  const handleNotificationChange = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
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
        });
      }
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert(err.message || "Failed to update profile changes");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f5e7] flex items-center justify-center">
        <p className="text-gray-500 font-semibold animate-pulse">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f5e7] pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            to={
              userRole === "admin"
                ? "/admin/dashboard"
                : userRole === "expert"
                ? "/expert/dashboard"
                : "/dashboard"
            }
            className="inline-flex items-center text-sm font-semibold text-[#5bb5a1] hover:text-[#4a9d8b] transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-center font-medium">
            {error}
          </div>
        )}

        {/* Profile Header */}
        <Card className="mb-8 rounded-3xl border border-gray-100 shadow-sm bg-white p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-[#5bb5a1]/10 flex items-center justify-center text-[#5bb5a1] text-3xl font-bold">
                {userData.name.charAt(0).toUpperCase()}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#5bb5a1] hover:bg-[#4a9d8b] rounded-full flex items-center justify-center text-white transition-all shadow-sm">
                <FaCamera className="text-sm" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-gray-800">
                {userData.name}
              </h1>
              <p className="text-gray-500 mt-1">{userData.email}</p>
              <p className="text-gray-400 text-xs mt-1 capitalize font-semibold bg-gray-100 px-2.5 py-0.5 rounded-full inline-block">
                {userRole}
              </p>
              <p className="text-gray-600 mt-3 text-sm italic">{userData.bio || "No bio added yet."}</p>
            </div>

            {/* Edit Button */}
            <Button
              variant={isEditing ? "danger" : "secondary"}
              onClick={() => setIsEditing(!isEditing)}
              icon={isEditing ? FaTimes : FaEdit}
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>

          {/* Stats */}
          {userRole === "student" && profileStats.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-100">
              {profileStats.map((stat, index) => {
                const StatIcon = stat.icon;
                return (
                  <div key={index} className="text-center p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                    <div className="flex justify-center mb-1">
                      <StatIcon className="text-[#5bb5a1]" size={16} />
                    </div>
                    <div className="text-xl font-bold text-gray-800">
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-500 font-semibold mt-0.5">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#5bb5a1] text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-100 shadow-sm"
              }`}
            >
              <tab.icon />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <Card className="rounded-3xl border border-gray-100 shadow-sm bg-white p-6">
          {activeTab === "profile" && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Personal Information
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  name="name"
                  value={userData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  icon={FaUser}
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
                <Input
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={userData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  icon={FaPhone}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={userData.bio}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#5bb5a1] focus:ring-2 focus:ring-[#5bb5a1]/20 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-700 transition-all leading-relaxed"
                  placeholder="Tell us a little about yourself..."
                />
              </div>

              {isEditing && (
                <div className="flex justify-end pt-2">
                  <Button variant="primary" onClick={handleSave} icon={FaSave} className="bg-[#5bb5a1] hover:bg-[#4a9d8b]">
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Notification Settings
              </h2>

              {[
                {
                  key: "dailyReminder",
                  label: "Daily Mood Check-in Reminder",
                  description: "Get reminded to log your mood every day",
                },
                {
                  key: "weeklyReport",
                  label: "Weekly Progress Report",
                  description: "Receive a summary of your weekly progress",
                },
                {
                  key: "chatNotifications",
                  label: "Chat Notifications",
                  description: "Get notified about new messages",
                },
                {
                  key: "emailUpdates",
                  label: "Email Updates",
                  description: "Receive updates and tips via email",
                },
              ].map((setting) => (
                <div
                  key={setting.key}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-50"
                >
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">
                      {setting.label}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {setting.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange(setting.key)}
                    className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
                      notifications[setting.key]
                        ? "bg-[#5bb5a1]"
                        : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        notifications[setting.key] ? "left-7" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Privacy & Security
              </h2>

              <div className="space-y-4">
                <button className="w-full text-left p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors border border-gray-50 cursor-pointer">
                  <h3 className="font-semibold text-gray-800 text-sm">
                    Change Password
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Update your account password
                  </p>
                </button>
                <button className="w-full text-left p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors border border-gray-50 cursor-pointer">
                  <h3 className="font-semibold text-gray-800 text-sm">
                    Two-Factor Authentication
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Add an extra layer of security
                  </p>
                </button>
                <button className="w-full text-left p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors border border-gray-50 cursor-pointer">
                  <h3 className="font-semibold text-gray-800 text-sm">
                    Download My Data
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Get a copy of all your data
                  </p>
                </button>
                <button className="w-full text-left p-4 bg-red-50/50 rounded-2xl hover:bg-red-100/50 transition-colors border border-red-100/30 cursor-pointer">
                  <h3 className="font-semibold text-red-700 text-sm">Delete Account</h3>
                  <p className="text-xs text-red-500 mt-0.5">
                    Permanently delete your account and data
                  </p>
                </button>
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                App Preferences
              </h2>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-50">
                  <h3 className="font-semibold text-gray-800 text-sm mb-3">Theme</h3>
                  <div className="flex space-x-3">
                    {["Light", "Dark", "System"].map((theme) => (
                      <button
                        key={theme}
                        className={`px-4 py-2 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                          theme === "Light"
                            ? "bg-[#5bb5a1] text-white shadow-sm"
                            : "bg-white border border-gray-100 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-50">
                  <h3 className="font-semibold text-gray-800 text-sm mb-3">Language</h3>
                  <select className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#5bb5a1] focus:ring-2 focus:ring-[#5bb5a1]/20 focus:outline-none bg-white text-gray-700 text-sm">
                    <option>English (US)</option>
                    <option>English (UK)</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-50">
                  <h3 className="font-semibold text-[#5bb5a1] text-sm mb-3">Time Zone</h3>
                  <select className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#5bb5a1] focus:ring-2 focus:ring-[#5bb5a1]/20 focus:outline-none bg-white text-gray-700 text-sm">
                    <option>UTC-05:00 Eastern Time</option>
                    <option>UTC-08:00 Pacific Time</option>
                    <option>UTC+00:00 GMT</option>
                    <option>UTC+05:30 IST</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
