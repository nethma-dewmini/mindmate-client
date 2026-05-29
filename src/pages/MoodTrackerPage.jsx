import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
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
        authService.getMoodEntries(20),
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

  const handleDeleteMood = async (id) => {
    if (!window.confirm("Are you sure you want to delete this mood entry?")) return;

    try {
      await authService.deleteMoodEntry(id);
      // Refresh stats and logs
      await fetchMoodData();
    } catch (err) {
      console.error("Error deleting mood entry:", err);
      alert("Failed to delete mood entry. Please try again.");
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
                const dateObj = new Date(entry.created_at);
                const dateStr = dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric" });
                const timeStr = dateObj.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", hour12: true });
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
                    <span className="text-[10px] text-gray-500 mt-2 text-center leading-tight">
                      {dateStr}
                      <br />
                      {timeStr}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Entries */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Recent Entries</h2>
          <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
            {loading && recentEntries.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">Loading entries...</p>
            ) : recentEntries.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">
                No recent entries found. Record your first mood entry today!
              </p>
            ) : (
              recentEntries.map((entry, index) => {
                const dateObj = new Date(entry.created_at);
                const formattedDate = dateObj.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });
                const formattedTime = dateObj.toLocaleTimeString(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                });
                const displayDateTime = `${formattedDate}, ${formattedTime}`;
                return (
                  <div
                    key={entry.id || index}
                    className="flex items-center justify-between py-1.5 px-3 bg-gray-50 rounded-lg group"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <span className="text-xl">{getMoodEmoji(entry.mood)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-700">{displayDateTime}</p>
                        {entry.note && (
                          <p className="text-xs text-gray-500 mt-0.5">{entry.note}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteMood(entry.id)}
                      className="text-red-400 hover:text-red-600 p-1 rounded-md transition-colors md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
                      title="Delete Entry"
                    >
                      <FaTrash size={12} />
                    </button>
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
