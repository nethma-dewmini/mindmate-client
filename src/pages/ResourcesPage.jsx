import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "../services/authService";
import { FaSearch, FaClock, FaThumbsUp } from "react-icons/fa";

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

    const matchesType =
      typeFilter === "ALL" || !resource.type || resource.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const getTypeColor = (type) => {
    switch (type) {
      case "ARTICLE":
        return "bg-blue-100 text-blue-700";
      case "VIDEO":
        return "bg-red-100 text-red-700";
      case "GUIDE":
        return "bg-purple-100 text-purple-700";
      case "AUDIO":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "academic-stress":
        return "bg-red-400 text-white";
      case "anxiety-relief":
        return "bg-orange-400 text-white";
      case "wellness":
        return "bg-green-400 text-white";
      case "academic-success":
        return "bg-red-400 text-white";
      case "meditation":
        return "bg-teal-400 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  const escapeRegExp = (string = "") =>
    string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const highlightMatch = (text = "", q = "") => {
    if (!q) return text;
    const parts = String(text).split(new RegExp(`(${escapeRegExp(q)})`, "i"));
    return parts.map((part, i) => {
      if (part.toLowerCase() === q.toLowerCase()) {
        return (
          <mark
            key={i}
            className="bg-yellow-200 text-yellow-900 rounded px-0.5"
          >
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
    <div className="min-h-screen bg-[#f9f5e7] py-8 px-6">
      <div className="max-w-6xl mx-auto">
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
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Mental Health Resources
            </h1>
            <p className="mt-2 text-gray-500 max-w-2xl">
              Explore expert insights, mindful strategies, and therapeutic guides to nurture your inner peace and empower your well-being journey.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-[#5bb5a1]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Type filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: "ALL", label: "All" },
            { id: "ARTICLE", label: "Article" },
            { id: "GUIDE", label: "Guide" },
            { id: "VIDEO", label: "Video" },
            { id: "AUDIO", label: "Audio" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTypeFilter(t.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                typeFilter === t.id
                  ? "bg-[#5bb5a1] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {loading ? (
            <div className="col-span-full text-center text-gray-500 py-12">
              Loading resources...
            </div>
          ) : loadError ? (
            <div className="col-span-full text-center text-red-600 py-12">
              {loadError}
            </div>
          ) : (
            filteredResources.map((resource) => (
              <div
                key={resource.id}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">
                      {resource.type === "VIDEO"
                        ? "🎥"
                        : resource.type === "AUDIO"
                          ? "🎧"
                          : "📄"}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${getTypeColor(resource.type)}`}
                  >
                    {resource.type}
                  </span>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded ${getCategoryColor(resource.category)}`}
                >
                  {highlightMatch(
                    resource.category || "General",
                    debouncedSearch,
                  )}
                </span>
                <h3 className="font-semibold text-gray-800 mt-3 mb-1">
                  {highlightMatch(resource.title, debouncedSearch)}
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  By{" "}
                  {highlightMatch(
                    resource.authorName || resource.author || "Expert",
                    debouncedSearch,
                  )}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-400">
                  {resource.type === "VIDEO" ? (
                    resource.contentUrl ? (
                      isYouTube(resource.contentUrl) ? (
                        <div className="w-full mt-3">
                          <iframe
                            title={`video-${resource.id}`}
                            src={toYouTubeEmbed(resource.contentUrl)}
                            className="w-full h-40 rounded-lg border"
                            allowFullScreen
                          />
                        </div>
                      ) : String(resource.contentUrl).startsWith("/api") ? (
                        <div className="w-full mt-3">
                          <video
                            controls
                            className="w-full max-h-48 rounded-lg"
                            src={`http://localhost:5000${resource.contentUrl}`}
                          >
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      ) : (
                        <div className="w-full mt-3">
                          <video
                            controls
                            className="w-full max-h-48 rounded-lg"
                            src={resource.contentUrl}
                          >
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      )
                    ) : null
                  ) : (
                    resource.contentUrl && (
                      <a
                        href={`http://localhost:5000${resource.contentUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#5bb5a1] font-medium"
                      >
                        View file
                      </a>
                    )
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* CTA Banner removed per request */}
      </div>
    </div>
  );
};

export default ResourcesPage;
