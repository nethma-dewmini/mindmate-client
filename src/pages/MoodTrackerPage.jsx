import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaSmileBeam, FaSmile, FaMeh, FaFrown, FaSadCry, FaTrash } from "react-icons/fa";
import { authService } from "../services/authService";

const MoodTrackerPage = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState("");
  const [summary, setSummary] = useState({ count: 0, avg_mood: 0, avg_mood_yesterday: 0, streak: 0 });
  const [recentEntries, setRecentEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const moods = [
    { id: 5, icon: FaSmileBeam, label: "Excellent", color: "bg-green-500", iconColor: "text-green-500" },
    { id: 4, icon: FaSmile, label: "Good", color: "bg-blue-500", iconColor: "text-blue-500" },
    { id: 3, icon: FaMeh, label: "Okay", color: "bg-yellow-500", iconColor: "text-yellow-500" },
    { id: 2, icon: FaFrown, label: "Bad", color: "bg-orange-500", iconColor: "text-orange-500" },
    { id: 1, icon: FaSadCry, label: "Terrible", color: "bg-red-500", iconColor: "text-red-500" },
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

  const getMoodIcon = (moodId) => {
    const icons = {
      5: FaSmileBeam,
      4: FaSmile,
      3: FaMeh,
      2: FaFrown,
      1: FaSadCry,
    };
    return icons[moodId] || FaMeh;
  };

  const getMoodIconColor = (moodId) => {
    const colors = {
      5: "text-green-500",
      4: "text-blue-500",
      3: "text-yellow-500",
      2: "text-orange-500",
      1: "text-red-500",
    };
    return colors[moodId] || "text-gray-400";
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

  const handleDeleteMood = (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDeleteMood = async () => {
    if (!deleteConfirmId) return;

    try {
      await authService.deleteMoodEntry(deleteConfirmId);
      // Refresh stats and logs
      await fetchMoodData();
    } catch (err) {
      console.error("Error deleting mood entry:", err);
      alert("Failed to delete mood entry. Please try again.");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const getWellnessMessage = () => {
    const today = summary.avg_mood;
    const yesterday = summary.avg_mood_yesterday;

    if (today === 0) {
      return "Log how you are feeling today to see how your mood compares to yesterday and receive helpful wellness reflections. 🌱";
    }
    if (yesterday === 0) {
      return "Good job logging today! Track your mood again tomorrow to unlock comparisons and see patterns in your wellness journey. 🌟";
    }

    if (today > yesterday) {
      return "You're doing great! Today's mood is looking brighter than yesterday. Keep up the positive momentum and celebrate this light! ☀️";
    } else if (today === yesterday) {
      return "You've stayed consistent since yesterday. Stability is a wonderful form of progress. Keep breathing and taking things one step at a time! 🧘";
    } else {
      return "It's completely okay to have a down day compared to yesterday. Be gentle with yourself, and remember that healing isn't linear. You are resilient. 💚";
    }
  };

  // Derive moodJourney (oldest to newest chronological) from the last 7 entries
  const journeyEntries = [...recentEntries].slice(0, 7).reverse();

  const AverageMoodIcon = getMoodIcon(Math.round(summary.avg_mood));

  return (
    <div className="min-h-screen bg-[#f9f5e7] py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-sm text-[#5bb5a1] hover:text-[#4a9d8b] font-medium transition-colors"
          >
            <span className="mr-1.5">←</span> Back to Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Mood Tracker</h1>
          <p className="text-gray-500 mt-1">
            Reflect on your emotional well-being, observe your daily patterns, and nurture your inner peace
          </p>
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
            {moods.map((mood) => {
              const MoodIcon = mood.icon;
              return (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.id)}
                  className={`flex flex-col items-center transition-all duration-200 ${
                    selectedMood === mood.id ? "scale-110" : "hover:scale-105"
                  }`}
                >
                  <MoodIcon
                    size={48}
                    className={`mb-2 ${
                      selectedMood === mood.id
                        ? `${mood.iconColor} drop-shadow-md`
                        : "text-gray-300 hover:text-gray-400"
                    } transition-colors duration-200`}
                  />
                  <span
                    className={`text-sm ${
                      selectedMood === mood.id
                        ? "text-[#5bb5a1] font-semibold"
                        : "text-gray-500"
                    }`}
                  >
                    {mood.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add a note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              rows={2}
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
              <p className="text-xs text-gray-500">Average Mood for today</p>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="font-bold text-gray-800">
                  {summary.avg_mood > 0 ? summary.avg_mood : "N/A"}
                </span>
                {summary.avg_mood > 0 && AverageMoodIcon && (
                  <AverageMoodIcon className={getMoodIconColor(Math.round(summary.avg_mood))} size={18} />
                )}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center space-x-3">
            <span className="text-2xl">📅</span>
            <div>
              <p className="text-xs text-gray-500">Days Tracked</p>
              <p className="font-bold text-gray-800 mt-0.5">{summary.count}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center space-x-3">
            <span className="text-2xl">📈</span>
            <div>
              <p className="text-xs text-gray-500">Current Streak</p>
              <p className="font-bold text-gray-800 mt-0.5">
                {summary.streak} {summary.streak === 1 ? "day" : "days"}
              </p>
            </div>
          </div>
        </div>

        {/* Mental Wellness Comparison Banner */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6 border-l-4 border-[#5bb5a1]">
          <div className="flex items-start space-x-3">
            <span className="text-xl">🌱</span>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm mb-1">Your Mental Wellness Reflection</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{getWellnessMessage()}</p>
            </div>
          </div>
        </div>

        {/* Mood Journey Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="font-semibold text-gray-800 mb-6">
            Your Mood Journey
          </h2>
          {loading && journeyEntries.length === 0 ? (
            <div className="flex justify-center items-center h-45 text-gray-500 text-sm">
              Loading chart...
            </div>
          ) : journeyEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-45 text-gray-400 text-sm">
              <span className="text-4xl mb-2">📊</span>
              <p>No mood entries recorded yet. Start tracking above!</p>
            </div>
          ) : (
            <div className="flex items-end justify-between h-48 px-4">
              {journeyEntries.map((entry, index) => {
                const dateObj = new Date(entry.created_at);
                const dateStr = dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric" });
                const timeStr = dateObj.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", hour12: true });
                const JourneyIcon = getMoodIcon(entry.mood);
                return (
                  <div key={entry.id || index} className="flex flex-col items-center">
                    <div className="relative flex flex-col items-center">
                      {JourneyIcon && (
                        <JourneyIcon className={`${getMoodIconColor(entry.mood)} mb-2`} size={18} />
                      )}
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
                const RowIcon = getMoodIcon(entry.mood);
                return (
                  <div
                    key={entry.id || index}
                    className="flex items-center justify-between py-1.5 px-3 bg-gray-50 rounded-lg group"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {RowIcon && (
                        <RowIcon className={getMoodIconColor(entry.mood)} size={18} />
                      )}
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

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
          <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm transition-opacity" onClick={() => setDeleteConfirmId(null)}></div>
          <div className="relative w-full max-w-sm mx-auto my-6 p-6 bg-white rounded-2xl shadow-xl z-50 border border-gray-100 animate-in fade-in zoom-in-95 duration-200 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4 mx-auto">
              <span className="text-xl font-bold">🗑️</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Mood Entry?</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Are you sure you want to delete this mood entry? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteMood}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodTrackerPage;
