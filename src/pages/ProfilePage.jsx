import { useState } from "react";
import { Link } from "react-router-dom";
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
} from "react-icons/fa";
import { Card, Button, Input } from "../components";

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [userData, setUserData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 234 567 8900",
    bio: "Taking one day at a time on my wellness journey.",
    avatar: null,
  });

  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    weeklyReport: true,
    chatNotifications: true,
    emailUpdates: false,
  });

  const tabs = [
    { id: "profile", label: "Profile", icon: FaUser },
    { id: "notifications", label: "Notifications", icon: FaBell },
    { id: "privacy", label: "Privacy", icon: FaShieldAlt },
    { id: "preferences", label: "Preferences", icon: FaPalette },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // TODO: Save to backend
  };

  const stats = [
    { label: "Days Active", value: "45" },
    { label: "Chat Sessions", value: "23" },
    { label: "Assessments", value: "8" },
    { label: "Streak", value: "7 days" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-3xl font-bold">
                {userData.name.charAt(0)}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white hover:bg-indigo-700">
                <FaCamera className="text-sm" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-slate-900">
                {userData.name}
              </h1>
              <p className="text-slate-600">{userData.email}</p>
              <p className="text-slate-500 mt-2">{userData.bio}</p>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-200">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              <tab.icon />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <Card>
          {activeTab === "profile" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
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
                  disabled={!isEditing}
                  icon={FaEnvelope}
                />
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
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={userData.bio}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
              </div>

              {isEditing && (
                <div className="flex justify-end">
                  <Button variant="gradient" onClick={handleSave} icon={FaSave}>
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
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
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                >
                  <div>
                    <h3 className="font-medium text-slate-900">
                      {setting.label}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {setting.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange(setting.key)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      notifications[setting.key]
                        ? "bg-indigo-600"
                        : "bg-slate-300"
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
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Privacy & Security
              </h2>

              <div className="space-y-4">
                <button className="w-full text-left p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <h3 className="font-medium text-slate-900">
                    Change Password
                  </h3>
                  <p className="text-sm text-slate-500">
                    Update your account password
                  </p>
                </button>
                <button className="w-full text-left p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <h3 className="font-medium text-slate-900">
                    Two-Factor Authentication
                  </h3>
                  <p className="text-sm text-slate-500">
                    Add an extra layer of security
                  </p>
                </button>
                <button className="w-full text-left p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <h3 className="font-medium text-slate-900">
                    Download My Data
                  </h3>
                  <p className="text-sm text-slate-500">
                    Get a copy of all your data
                  </p>
                </button>
                <button className="w-full text-left p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors">
                  <h3 className="font-medium text-red-600">Delete Account</h3>
                  <p className="text-sm text-red-500">
                    Permanently delete your account and data
                  </p>
                </button>
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                App Preferences
              </h2>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <h3 className="font-medium text-slate-900 mb-3">Theme</h3>
                  <div className="flex space-x-3">
                    {["Light", "Dark", "System"].map((theme) => (
                      <button
                        key={theme}
                        className={`px-4 py-2 rounded-lg font-medium ${
                          theme === "Light"
                            ? "bg-indigo-600 text-white"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl">
                  <h3 className="font-medium text-slate-900 mb-3">Language</h3>
                  <select className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none">
                    <option>English (US)</option>
                    <option>English (UK)</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl">
                  <h3 className="font-medium text-slate-900 mb-3">Time Zone</h3>
                  <select className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none">
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
