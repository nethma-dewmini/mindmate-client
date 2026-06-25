import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { authService } from "../services/authService";
import {
  FaSearch,
  FaClock,
  FaThumbsUp,
  FaFileAlt,
  FaVideo,
  FaBookOpen,
  FaVolumeUp,
  FaExternalLinkAlt,
  FaTimes,
} from "react-icons/fa";
import { SkeletonCard } from "../components";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

const ResourcesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const data = await authService.getExpertResources();
        if (!mounted) return;
        setResources((data && data.resources) || []);
      } catch (err) {
        if (!mounted) return;
        setLoadError(err.message || "Failed to load resources");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  // debounce search input to avoid filtering on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 250);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const filteredResources = resources.filter((resource) => {
    const q = (debouncedSearch || "").toLowerCase();

    const matchesSearch =
      !q ||
      (resource.title && resource.title.toLowerCase().includes(q)) ||
      (resource.summary && resource.summary.toLowerCase().includes(q)) ||
      (resource.authorName && resource.authorName.toLowerCase().includes(q)) ||
      (resource.author && resource.author.toLowerCase().includes(q)) ||
      (resource.category && resource.category.toLowerCase().includes(q));

    const matchesType = typeFilter === "ALL" || !resource.type || resource.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const getTypeColor = (type) => {
    switch (type) {
      case "ARTICLE":
        return "bg-blue-50 text-blue-600 border border-blue-100";
      case "VIDEO":
        return "bg-rose-50 text-rose-600 border border-rose-100";
      case "GUIDE":
        return "bg-indigo-50 text-indigo-600 border border-indigo-100";
      case "AUDIO":
        return "bg-emerald-50 text-emerald-600 border border-emerald-100";
      default:
        return "bg-slate-50 text-slate-600 border border-slate-100";
    }
  };

  const getGlowColor = (type) => {
    switch (type) {
      case "ARTICLE":
        return "blue";
      case "VIDEO":
        return "rose";
      case "GUIDE":
        return "indigo";
      case "AUDIO":
        return "emerald";
      default:
        return "teal";
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "academic-stress":
        return "bg-rose-50 text-rose-700 border border-rose-200/50";
      case "anxiety-relief":
        return "bg-amber-50 text-amber-700 border border-amber-200/50";
      case "wellness":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200/50";
      case "academic-success":
        return "bg-sky-50 text-sky-700 border border-sky-200/50";
      case "meditation":
        return "bg-teal-50 text-teal-700 border border-teal-200/50";
      default:
        return "bg-slate-50 text-slate-700 border border-slate-200/50";
    }
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case "ARTICLE":
        return <FaFileAlt className="text-xl text-blue-500 animate-float" />;
      case "VIDEO":
        return <FaVideo className="text-xl text-rose-500" />;
      case "GUIDE":
        return <FaBookOpen className="text-xl text-indigo-500" />;
      case "AUDIO":
        return <FaVolumeUp className="text-xl text-emerald-500 animate-pulse" />;
      default:
        return <FaFileAlt className="text-xl text-teal-500" />;
    }
  };

  const escapeRegExp = (string = "") => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const highlightMatch = (text = "", q = "") => {
    if (!q) return text;
    const parts = String(text).split(new RegExp(`(${escapeRegExp(q)})`, "i"));
    return parts.map((part, i) => {
      if (part.toLowerCase() === q.toLowerCase()) {
        return (
          <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5">
            {part}
          </mark>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const isYouTube = (url = "") => /youtu(?:\.be|be\.com)/i.test(String(url));

  const toYouTubeEmbed = (url = "") => {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtu.be")) {
        return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
      }
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
    } catch (e) {
      // fallthrough
    }
    return url;
  };

  return (
    <div className="min-h-screen bg-[#f9f5e7] py-10 px-6 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-4 border-b border-[#2c6e5f]/10">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1b4d42] tracking-tight">
              Mental Health Resources
            </h1>
            <p className="text-[#2c6e5f]/80 mt-1 font-medium max-w-2xl leading-relaxed text-sm md:text-base">
              Explore expert insights, mindful strategies, and therapeutic guides to nurture your
              inner peace and empower your well-being journey.
            </p>
          </div>

          {/* Type filters */}
          {!loading && resources.length > 0 && (
            <div className="bg-white/60 p-1 border border-[#2c6e5f]/15 rounded-2xl relative flex flex-wrap gap-1 shadow-sm shrink-0">
              {[
                { id: "ALL", label: "All" },
                { id: "ARTICLE", label: "Article" },
                { id: "GUIDE", label: "Guide" },
                { id: "VIDEO", label: "Video" },
                { id: "AUDIO", label: "Audio" },
              ].map((t) => {
                const isActive = typeFilter === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTypeFilter(t.id)}
                    className="relative px-5 py-2.5 rounded-xl text-xs font-extrabold capitalize transition-colors cursor-pointer z-10"
                    style={{ color: isActive ? "#ffffff" : "#2c6e5f" }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTypeFilterPill"
                        className="absolute inset-0 bg-[#2c6e5f] rounded-xl -z-10 shadow-sm"
                        transition={{
                          type: "spring",
                          stiffness: 320,
                          damping: 24,
                        }}
                      />
                    )}
                    {t.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-[#2c6e5f]/10 mb-8 transition-all duration-300 hover:shadow-md hover:border-[#2c6e5f]/20">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#2c6e5f]/60 transition-colors duration-200" />
            <input
              type="text"
              placeholder="Search resources by title, category, or expert name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3.5 bg-gray-50/50 hover:bg-gray-50 rounded-xl border border-gray-100 focus:border-[#2c6e5f]/30 focus:bg-white focus:ring-4 focus:ring-[#2c6e5f]/10 focus:outline-none transition-all duration-300 text-sm font-medium placeholder-gray-400 text-gray-700"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1"
                aria-label="Clear search"
              >
                <FaTimes className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <SkeletonCard count={6} />
          </div>
        ) : loadError ? (
          <div className="text-center text-red-600 py-12 font-semibold">{loadError}</div>
        ) : filteredResources.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/60 backdrop-blur-md rounded-3xl p-16 border border-dashed border-[#2c6e5f]/20 text-center flex flex-col items-center justify-center shadow-sm"
          >
            <div className="w-16 h-16 rounded-full bg-[#2c6e5f]/5 flex items-center justify-center mb-4 text-[#2c6e5f]">
              <FaSearch className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">No resources found</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              We couldn't find any resources matching your search or filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setTypeFilter("ALL");
              }}
              className="mt-6 px-5 py-2.5 bg-[#2c6e5f] hover:bg-[#1b4d42] text-white text-xs font-extrabold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
            >
              Reset Filters
            </button>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredResources.map((resource) => (
                <motion.div
                  layout
                  variants={cardVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  whileHover={{ y: -6 }}
                  key={resource.id}
                  className={`glass-card hover-glow-${getGlowColor(resource.type)} p-6 flex flex-col justify-between h-full group`}
                >
                  <div>
                    {/* Card Header Icon & Type */}
                    <div className="flex justify-between items-center mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                          resource.type === "ARTICLE"
                            ? "bg-blue-50/80"
                            : resource.type === "VIDEO"
                              ? "bg-rose-50/80"
                              : resource.type === "GUIDE"
                                ? "bg-indigo-50/80"
                                : "bg-emerald-50/80"
                        }`}
                      >
                        {getResourceIcon(resource.type)}
                      </div>
                      <span
                        className={`text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-full ${getTypeColor(resource.type)}`}
                      >
                        {resource.type}
                      </span>
                    </div>

                    {/* Category Badge */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md capitalize ${getCategoryColor(resource.category)}`}
                      >
                        {highlightMatch(
                          (resource.category || "General").replace("-", " "),
                          debouncedSearch
                        )}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-gray-800 mt-2 mb-1 text-base leading-snug transition-colors duration-200 group-hover:text-[#2c6e5f]">
                      {highlightMatch(resource.title, debouncedSearch)}
                    </h3>

                    {/* Author */}
                    <p className="text-xs text-gray-400 mb-4 flex items-center gap-1">
                      <span>By</span>
                      <span className="font-semibold text-gray-600">
                        {highlightMatch(
                          resource.authorName || resource.author || "Expert",
                          debouncedSearch
                        )}
                      </span>
                    </p>

                    {/* Media Render */}
                    {resource.type === "VIDEO" && resource.contentUrl && (
                      <div className="w-full mt-2 rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-black">
                        {isYouTube(resource.contentUrl) ? (
                          <iframe
                            title={`video-${resource.id}`}
                            src={toYouTubeEmbed(resource.contentUrl)}
                            className="w-full h-44 border-0"
                            allowFullScreen
                          />
                        ) : (
                          <video
                            controls
                            className="w-full max-h-48"
                            src={
                              String(resource.contentUrl).startsWith("/api")
                                ? `http://localhost:5000${resource.contentUrl}`
                                : resource.contentUrl
                            }
                          >
                            Your browser does not support the video tag.
                          </video>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions for Non-Video Files */}
                  {resource.type !== "VIDEO" && resource.contentUrl && (
                    <div className="mt-4 pt-3 border-t border-gray-100/50 flex justify-between items-center">
                      <a
                        href={
                          resource.contentUrl.startsWith("http")
                            ? resource.contentUrl
                            : `http://localhost:5000${resource.contentUrl}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2c6e5f] hover:text-[#1b4d42] transition-colors group/link cursor-pointer"
                      >
                        <span>
                          {resource.type === "AUDIO"
                            ? "Listen to Audio"
                            : resource.type === "GUIDE"
                              ? "Read Guide"
                              : "Read Article"}
                        </span>
                        <FaExternalLinkAlt className="text-[10px] transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                      </a>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ResourcesPage;
