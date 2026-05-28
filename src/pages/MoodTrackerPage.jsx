import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { authService } from "../services/authService";

const MoodTrackerPage = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState("");
  const [summary, setSummary] = useState({ count: 0, avg_mood: 0, streak: 0 });
  const [recentEntries, setRecentEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const moods = [
    { id: 5, emoji: "😄", label: "Excellent", color: "bg-green-500" },
    { id: 4, emoji: "🙂", label: "Good", color: "bg-blue-500" },
    { id: 3, emoji: "😐", label: "Okay", color: "bg-yellow-500" },
    { id: 2, emoji: "😟", label: "Bad", color: "bg-orange-500" },
    { id: 1, emoji: "😢", label: "Terrible", color: "bg-red-500" },
  ];

  const fetchMoodData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [summaryData, entriesData] = await Promise.all([
        authService.getMoodSummary(30),
        authService.getMoodEntries(7),
      ]);
      setSummary(summaryData);
      setRecentEntries(entriesData);
    } catch (err) {
      console.error("Error loading mood data:", err);
      setError("Failed to load mood data. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoodData();
  }, []);

  const getMoodColor = (moodId) => {
    const colors = {
      5: "bg-green-400",
      4: "bg-blue-400",
      3: "bg-yellow-400",
      2: "bg-orange-400",
      1: "bg-red-400",
    };
    return colors[moodId] || "bg-gray-400";
  };

  const getMoodEmoji = (moodId) => {
    const emojis = {
      5: "😄",
      4: "🙂",
      3: "😐",
      2: "😟",
      1: "😢",
    };
    return emojis[moodId] || "😐";
  };

  const handleSaveMood = async () => {
    if (!selectedMood) return;

    try {
      await authService.createMoodEntry({
        mood: selectedMood,
        note: note.trim() || null,
      });
      // Reset inputs
      setSelectedMood(null);
      setNote("");
      // Refresh stats and logs
      await fetchMoodData();
    } catch (err) {
      console.error("Error saving mood entry:", err);
      alert("Failed to save mood entry. Please try again.");
    }
  };

  // Derive moodJourney (oldest to newest chronological) from the last 7 entries
  const journeyEntries = [...recentEntries].slice(0, 7).reverse();

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

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-200">
            {error}
          </div>
        )}

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
              <p className="font-bold text-gray-800">
                {summary.avg_mood > 0
                  ? `${summary.avg_mood} ${getMoodEmoji(Math.round(summary.avg_mood))}`
                  : "N/A"}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center space-x-3">
            <span className="text-2xl">📅</span>
            <div>
              <p className="text-xs text-gray-500">Days Tracked</p>
              <p className="font-bold text-gray-800">{summary.count}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center space-x-3">
            <span className="text-2xl">📈</span>
            <div>
              <p className="text-xs text-gray-500">Current Streak</p>
              <p className="font-bold text-gray-800">
                {summary.streak} {summary.streak === 1 ? "day" : "days"}
              </p>
            </div>
          </div>
        </div>

        {/* Mood Journey Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="font-semibold text-gray-800 mb-6">
            Your Mood Journey
          </h2>
          {loading && journeyEntries.length === 0 ? (
            <div className="flex justify-center items-center h-40 text-gray-500 text-sm">
              Loading chart...
            </div>
          ) : journeyEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm">
              <span className="text-4xl mb-2">📊</span>
              <p>No mood entries recorded yet. Start tracking above!</p>
            </div>
          ) : (
            <div className="flex items-end justify-between h-40 px-4">
              {journeyEntries.map((entry, index) => {
                const dateNum = new Date(entry.created_at).getDate();
                return (
                  <div key={entry.id || index} className="flex flex-col items-center">
                    <div className="relative">
                      <span className="text-xl mb-2 block">
                        {getMoodEmoji(entry.mood)}
                      </span>
                      <div
                        className={`w-8 ${getMoodColor(entry.mood)} rounded-t-lg transition-all duration-300`}
                        style={{ height: `${entry.mood * 20}px` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 mt-2">{dateNum}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Entries */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Recent Entries</h2>
          <div className="space-y-3">
            {loading && recentEntries.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">Loading entries...</p>
            ) : recentEntries.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">
                No recent entries found. Record your first mood entry today!
              </p>
            ) : (
              recentEntries.map((entry, index) => {
                const formattedDate = new Date(entry.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });
                return (
                  <div
                    key={entry.id || index}
                    className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl"
                  >
                    <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                    <div>
                      <p className="font-medium text-gray-800">{formattedDate}</p>
                      {entry.note && (
                        <p className="text-sm text-gray-500">{entry.note}</p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodTrackerPage;
