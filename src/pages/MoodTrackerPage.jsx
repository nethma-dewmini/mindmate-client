import { useState } from "react";
import { Link } from "react-router-dom";

const MoodTrackerPage = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState("");

  const moods = [
    { id: 5, emoji: "😄", label: "Excellent", color: "bg-green-500" },
    { id: 4, emoji: "🙂", label: "Good", color: "bg-blue-500" },
    { id: 3, emoji: "😐", label: "Okay", color: "bg-yellow-500" },
    { id: 2, emoji: "😟", label: "Bad", color: "bg-orange-500" },
    { id: 1, emoji: "😢", label: "Terrible", color: "bg-red-500" },
  ];

  const moodJourney = [
    { date: "12", mood: 2, color: "bg-orange-400" },
    { date: "13", mood: 4, color: "bg-blue-400" },
    { date: "14", mood: 3, color: "bg-yellow-400" },
    { date: "15", mood: 4, color: "bg-blue-400" },
    { date: "16", mood: 5, color: "bg-green-400" },
    { date: "17", mood: 4, color: "bg-orange-400" },
    { date: "18", mood: 4, color: "bg-yellow-400" },
  ];

  const recentEntries = [
    { date: "2026-01-18", mood: "🙂", note: "Productive study session" },
    { date: "2026-01-17", mood: "🙂", note: "Tired but okay" },
    { date: "2026-01-16", mood: "😄", note: "Great day, feeling confident" },
    { date: "2026-01-15", mood: "🙂", note: "Presentation went well!" },
  ];

  const handleSaveMood = () => {
    if (selectedMood) {
      // Save mood logic here
      alert("Mood saved!");
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f5e7] py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Mood Tracker</h1>
            <p className="text-gray-500">
              Track your daily mood and identify patterns
            </p>
          </div>
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-[#5bb5a1] text-white rounded-lg hover:bg-[#4a9d8b]"
          >
            Cancel
          </Link>
        </div>

        {/* Mood Selection Card */}
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-6">
          <h2 className="text-center text-lg font-semibold text-gray-800 mb-6">
            How are you feeling today?
          </h2>

          <div className="flex justify-center space-x-8 mb-8">
            {moods.map((mood) => (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(mood.id)}
                className={`flex flex-col items-center transition-transform ${
                  selectedMood === mood.id ? "scale-110" : ""
                }`}
              >
                <span
                  className={`text-5xl mb-2 ${selectedMood === mood.id ? "drop-shadow-lg" : ""}`}
                >
                  {mood.emoji}
                </span>
                <span
                  className={`text-sm ${selectedMood === mood.id ? "text-[#5bb5a1] font-medium" : "text-gray-500"}`}
                >
                  {mood.label}
                </span>
              </button>
            ))}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add a note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              rows={3}
              placeholder="How was your day?"
            />
          </div>

          <button
            onClick={handleSaveMood}
            disabled={!selectedMood}
            className="w-full py-3 bg-[#5bb5a1] text-white rounded-xl font-medium hover:bg-[#4a9d8b] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Mood Entry
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center space-x-3">
            <span className="text-2xl">📊</span>
            <div>
              <p className="text-xs text-gray-500">Average Mood</p>
              <p className="font-bold text-gray-800">3.6 🙂</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center space-x-3">
            <span className="text-2xl">📅</span>
            <div>
              <p className="text-xs text-gray-500">Days Tracked</p>
              <p className="font-bold text-gray-800">7</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center space-x-3">
            <span className="text-2xl">📈</span>
            <div>
              <p className="text-xs text-gray-500">Current Streak</p>
              <p className="font-bold text-gray-800">7 days</p>
            </div>
          </div>
        </div>

        {/* Mood Journey Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="font-semibold text-gray-800 mb-6">
            Your Mood Journey
          </h2>
          <div className="flex items-end justify-between h-40 px-4">
            {moodJourney.map((day, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="relative">
                  <span className="text-xl mb-2 block">
                    {day.mood === 5
                      ? "😄"
                      : day.mood === 4
                        ? "🙂"
                        : day.mood === 3
                          ? "😐"
                          : "😟"}
                  </span>
                  <div
                    className={`w-8 ${day.color} rounded-t-lg`}
                    style={{ height: `${day.mood * 20}px` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 mt-2">{day.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Entries */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Recent Entries</h2>
          <div className="space-y-3">
            {recentEntries.map((entry, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl"
              >
                <span className="text-2xl">{entry.mood}</span>
                <div>
                  <p className="font-medium text-gray-800">{entry.date}</p>
                  <p className="text-sm text-gray-500">{entry.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodTrackerPage;
