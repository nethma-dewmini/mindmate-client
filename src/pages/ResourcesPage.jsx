import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "../services/authService";
import { FaSearch, FaClock, FaThumbsUp } from "react-icons/fa";

const ResourcesPage = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "all", label: "All" },
    { id: "academic-stress", label: "Academic Stress" },
    { id: "anxiety-relief", label: "Anxiety Relief" },
    { id: "wellness", label: "Wellness" },
    { id: "academic-success", label: "Academic Success" },
    { id: "meditation", label: "Meditation" },
    { id: "social-support", label: "Social Support" },
  ];

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

  const filteredResources = resources.filter((resource) => {
    const matchesCategory =
      activeCategory === "all" ||
      !resource.category ||
      resource.category === activeCategory ||
      (typeof resource.category === "string" &&
        resource.category.toLowerCase().includes(activeCategory));

    const matchesSearch = resource.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
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

  return (
    <div className="min-h-screen bg-[#f9f5e7] py-8 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Mental Health Resources
          </h1>
          <p className="text-gray-500 max-w-md text-right">
            Expert tips, articles, videos, and guides to support your mental
            wellness journey
          </p>
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
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category.id
                  ? "bg-[#5bb5a1] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {category.label}
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
                  {resource.category || "General"}
                </span>
                <h3 className="font-semibold text-gray-800 mt-3 mb-1">
                  {resource.title}
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  By {resource.authorName || resource.author || "Expert"}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-400">
                  {resource.contentUrl && (
                    <a
                      href={`http://localhost:5000${resource.contentUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#5bb5a1] font-medium"
                    >
                      View file
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* CTA Banner */}
        <div className="bg-[#5bb5a1] rounded-2xl p-8 text-center">
          <div className="flex justify-center mb-4">
            <span className="text-4xl">💡</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Need More Help?</h2>
          <p className="text-teal-100 mb-6">
            Can't find what you're looking for? Our AI assistant and mental
            health experts are here to help.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/chat"
              className="px-6 py-3 bg-white text-[#5bb5a1] rounded-lg font-medium hover:bg-gray-100"
            >
              Chat with AI
            </Link>
            <Link
              to="/experts"
              className="px-6 py-3 bg-[#4a9d8b] text-white rounded-lg font-medium hover:bg-[#3d8a79]"
            >
              Book Expert
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;
