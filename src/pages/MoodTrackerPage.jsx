import { useState, useEffect } from "react";
import { FaSmileBeam, FaSmile, FaMeh, FaFrown, FaSadCry, FaTrash } from "react-icons/fa";
import { authService } from "../services/authService";
import { motion, AnimatePresence } from "framer-motion";

const MoodTrackerPage = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState("");
  const [summary, setSummary] = useState({ count: 0, avg_mood: 0, avg_mood_yesterday: 0, streak: 0 });
  const [recentEntries, setRecentEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);

  const moods = [
    { id: 5, icon: FaSmileBeam, label: "Excellent", color: "bg-emerald-400", iconColor: "text-emerald-500", activeBg: "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-50", ringColor: "focus:ring-emerald-400" },
    { id: 4, icon: FaSmile, label: "Good", color: "bg-teal-400", iconColor: "text-teal-500", activeBg: "bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-50", ringColor: "focus:ring-teal-400" },
    { id: 3, icon: FaMeh, label: "Okay", color: "bg-amber-400", iconColor: "text-amber-500", activeBg: "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-50", ringColor: "focus:ring-amber-400" },
    { id: 2, icon: FaFrown, label: "Bad", color: "bg-orange-400", iconColor: "text-orange-500", activeBg: "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-50", ringColor: "focus:ring-orange-400" },
    { id: 1, icon: FaSadCry, label: "Terrible", color: "bg-rose-400", iconColor: "text-rose-500", activeBg: "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-50", ringColor: "focus:ring-rose-400" },
  ];

  const moodFeedback = {
    5: { text: "Awesome! What's making today so wonderful? 🌟", theme: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    4: { text: "Glad to hear that! What went well today? 😊", theme: "text-teal-600 bg-teal-50 border-teal-100" },
    3: { text: "A balanced day. Anything particular on your mind? 🍃", theme: "text-amber-600 bg-amber-50 border-amber-100" },
    2: { text: "Sorry to hear that. Writing it down can help lift some weight. 🧡", theme: "text-orange-600 bg-orange-50 border-orange-100" },
    1: { text: "We are so sorry. Remember, you don't have to carry this alone. 💚", theme: "text-rose-600 bg-rose-50 border-rose-100" }
  };

  const quickTags = [
    "Academic Pressure", "Lack of Sleep", "Relationships", "Family", "Health & Fitness", 
    "Social Outing", "Hobby Time", "Productive Day", "Feeling Lonely", "Anxiety Spike"
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
      5: "bg-emerald-400",
      4: "bg-teal-400",
      3: "bg-amber-400",
      2: "bg-orange-400",
      1: "bg-rose-400",
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
      5: "text-emerald-500",
      4: "text-teal-500",
      3: "text-amber-500",
      2: "text-orange-500",
      1: "text-rose-500",
    };
    return colors[moodId] || "text-gray-400";
  };

  const handleToggleTag = (tag) => {
    const formattedTag = `#${tag.replace(/\s+/g, "")}`;
    setNote((prev) => {
      const trimmed = prev.trim();
      if (trimmed.includes(formattedTag)) {
        return trimmed
          .replace(new RegExp(`\\s*${formattedTag}\\b`, "g"), "")
          .trim();
      } else {
        return trimmed ? `${trimmed} ${formattedTag}` : formattedTag;
      }
    });
  };

  const handleSaveMood = async () => {
    if (!selectedMood) return;

    try {
      await authService.createMoodEntry({
        mood: selectedMood,
        note: note.trim() || null,
      });
      setSelectedMood(null);
      setNote("");
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

  const journeyEntries = [...recentEntries].slice(0, 7).reverse();
  const AverageMoodIcon = getMoodIcon(Math.round(summary.avg_mood));

  return (
    <div className="min-h-screen bg-[#f9f5e7] py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center justify-center md:justify-start gap-2">
            <span>Mood Tracker</span>
            <span className="text-2xl animate-pulse">✨</span>
          </h1>
          <p className="text-gray-500 mt-1 max-w-2xl">
            Reflect on your emotional well-being, observe your daily patterns, and nurture your inner peace
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-200">
            {error}
          </div>
        )}

        {/* Mood Selection Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-sm border border-white/40 mb-6">
          <h2 className="text-center text-xl font-bold text-gray-800 mb-6">
            How are you feeling today?
          </h2>

          <div className="flex justify-center flex-wrap gap-4 md:gap-6 mb-8">
            {moods.map((mood) => {
              const MoodIcon = mood.icon;
              const isSelected = selectedMood === mood.id;
              return (
                <motion.button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer min-w-[90px] ${
                    isSelected 
                      ? `${mood.activeBg} shadow-md` 
                      : "border-transparent hover:bg-gray-50 text-gray-400 hover:text-gray-500"
                  }`}
                >
                  <MoodIcon
                    size={48}
                    className={`mb-2 ${
                      isSelected ? mood.iconColor : "text-gray-300"
                    } transition-colors duration-200`}
                  />
                  <span
                    className={`text-xs font-semibold ${
                      isSelected ? "text-gray-800" : "text-gray-500"
                    }`}
                  >
                    {mood.label}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Dynamic Mood Affirmation */}
          <AnimatePresence mode="wait">
            {selectedMood && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 rounded-2xl mb-6 text-sm text-center font-medium ${moodFeedback[selectedMood].theme}`}
              >
                {moodFeedback[selectedMood].text}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-gray-700">
                Add a note (optional)
              </label>
              <span className="text-xs text-gray-400 font-medium">
                {note.length} / 500 characters
              </span>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 500))}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5bb5a1] resize-none transition-all"
              rows={3}
              placeholder="What's on your mind? How was your day?"
            />

            {/* Quick Interactive Tags */}
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
                <span>🏷️</span> Quick Tags
              </p>
              <div className="flex flex-wrap gap-2">
                {quickTags.map((tag) => {
                  const formattedTag = `#${tag.replace(/\s+/g, "")}`;
                  const isSelected = note.includes(formattedTag);
                  return (
                    <motion.button
                      key={tag}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleToggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                        isSelected 
                          ? "bg-[#5bb5a1] border-[#5bb5a1] text-white" 
                          : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {tag}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleSaveMood}
            disabled={!selectedMood}
            className="w-full py-4 bg-[#5bb5a1] text-white rounded-2xl font-semibold hover:bg-[#4a9d8b] disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#5bb5a1]/25 transition-all cursor-pointer"
          >
            Save Mood Entry
          </motion.button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.div whileHover={{ y: -3 }} className="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-white/40 flex items-center space-x-3">
            <span className="text-3xl p-2 bg-blue-50 rounded-xl">📊</span>
            <div>
              <p className="text-xs font-medium text-gray-500">Average Mood for today</p>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="font-bold text-lg text-gray-800">
                  {summary.avg_mood > 0 ? summary.avg_mood : "N/A"}
                </span>
                {summary.avg_mood > 0 && AverageMoodIcon && (
                  <AverageMoodIcon className={getMoodIconColor(Math.round(summary.avg_mood))} size={18} />
                )}
              </div>
            </div>
          </motion.div>
          
          <motion.div whileHover={{ y: -3 }} className="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-white/40 flex items-center space-x-3">
            <span className="text-3xl p-2 bg-green-50 rounded-xl">📅</span>
            <div>
              <p className="text-xs font-medium text-gray-500">Days Tracked</p>
              <p className="font-bold text-lg text-gray-800 mt-0.5">{summary.count}</p>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -3 }} className="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-white/40 flex items-center space-x-3">
            <span className="text-3xl p-2 bg-amber-50 rounded-xl">🔥</span>
            <div>
              <p className="text-xs font-medium text-gray-500">Current Streak</p>
              <p className="font-bold text-lg text-gray-800 mt-0.5">
                {summary.streak} {summary.streak === 1 ? "day" : "days"}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Mental Wellness Comparison Banner */}
        <div className="bg-white/85 backdrop-blur-md rounded-2xl p-5 shadow-sm mb-6 border-l-4 border-[#5bb5a1] border-y border-r border-gray-100 flex items-start space-x-3">
          <span className="text-2xl p-1 bg-teal-50 rounded-lg">🌱</span>
          <div>
            <h3 className="font-bold text-gray-800 text-sm mb-0.5">Your Mental Wellness Reflection</h3>
            <p className="text-sm text-gray-600 leading-relaxed font-medium">{getWellnessMessage()}</p>
          </div>
        </div>

        {/* Mood Journey Chart */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/40 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-gray-800 flex items-center gap-1.5">
              <span>📈</span> Your Mood Journey (Last 7 Logs)
            </h2>
            <span className="text-xs text-gray-400 font-semibold">Hover to see notes</span>
          </div>

          {loading && journeyEntries.length === 0 ? (
            <div className="flex justify-center items-center h-48 text-gray-500 text-sm font-medium">
              Loading chart...
            </div>
          ) : journeyEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-sm">
              <span className="text-4xl mb-2">📊</span>
              <p className="font-medium">No mood entries recorded yet. Start tracking above!</p>
            </div>
          ) : (
            <div className="flex items-end justify-between h-48 px-4 relative mt-8">
              {journeyEntries.map((entry, index) => {
                const dateObj = new Date(entry.created_at);
                const dateStr = dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric" });
                const timeStr = dateObj.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", hour12: true });
                const JourneyIcon = getMoodIcon(entry.mood);
                const isHovered = hoveredBarIndex === index;

                return (
                  <div 
                    key={entry.id || index} 
                    className="flex flex-col items-center relative flex-1"
                    onMouseEnter={() => setHoveredBarIndex(index)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                  >
                    {/* Bouncy Hover Tooltip */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.9 }}
                          className="absolute bottom-full mb-6 bg-gray-800 text-white text-[11px] p-3 rounded-xl shadow-lg z-10 w-36 text-center leading-normal border border-gray-700 pointer-events-none"
                        >
                          <div className="font-bold text-[#5bb5a1] mb-0.5">
                            {moods.find(m => m.id === entry.mood)?.label} ({entry.mood}/5)
                          </div>
                          {entry.note ? (
                            <div className="italic text-gray-200 mt-1 break-words line-clamp-2">
                              "{entry.note}"
                            </div>
                          ) : (
                            <div className="text-gray-400 text-[9px] mt-0.5">No note recorded</div>
                          )}
                          <div className="text-[9px] text-gray-400 mt-1">{timeStr}</div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="relative flex flex-col items-center w-full">
                      {JourneyIcon && (
                        <motion.div
                          animate={isHovered ? { y: -4, scale: 1.1 } : { y: 0, scale: 1 }}
                          className="z-10 bg-white rounded-full p-0.5 shadow-sm mb-1.5"
                        >
                          <JourneyIcon className={getMoodIconColor(entry.mood)} size={20} />
                        </motion.div>
                      )}
                      
                      {/* Animated growing bar */}
                      <motion.div
                        custom={entry.mood * 20}
                        variants={{
                          hidden: { height: 0 },
                          show: { height: entry.mood * 20 }
                        }}
                        initial="hidden"
                        animate="show"
                        className={`w-8 ${getMoodColor(entry.mood)} rounded-t-lg transition-colors duration-300 ${
                          isHovered ? "brightness-105 shadow-md shadow-gray-200" : ""
                        }`}
                        style={{ height: `${entry.mood * 20}px` }}
                      ></motion.div>
                    </div>

                    <span className="text-[10px] text-gray-400 mt-2 text-center font-medium leading-tight">
                      {dateStr}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Entries */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/40">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-1.5">
            <span>📝</span> Recent Entries
          </h2>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {loading && recentEntries.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4 font-medium">Loading entries...</p>
            ) : recentEntries.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4 font-medium">
                No recent entries found. Record your first mood entry today!
              </p>
            ) : (
              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {recentEntries.map((entry, index) => {
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
                      <motion.div
                        key={entry.id || index}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-between py-3 px-4 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-xl group transition-all"
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="bg-white p-1.5 rounded-full shadow-sm">
                            {RowIcon && (
                              <RowIcon className={getMoodIconColor(entry.mood)} size={20} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-700">{displayDateTime}</p>
                            {entry.note && (
                              <p className="text-xs text-gray-500 mt-1 leading-relaxed break-words pr-4">{entry.note}</p>
                            )}
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteMood(entry.id)}
                          className="text-gray-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-colors md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                          title="Delete Entry"
                        >
                          <FaTrash size={12} />
                        </motion.button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
              onClick={() => setDeleteConfirmId(null)}
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-sm mx-auto my-6 p-6 bg-white rounded-3xl shadow-xl z-50 border border-gray-100 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-4 mx-auto shadow-inner">
                <span className="text-2xl font-bold">🗑️</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Mood Entry?</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed font-medium">
                Are you sure you want to delete this mood entry? This action cannot be undone.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteMood}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl shadow-md shadow-rose-500/10 transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MoodTrackerPage;
