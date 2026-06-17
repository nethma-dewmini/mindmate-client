import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { authService } from "../services/authService";
import { normalizeAssessmentList } from "../data/assessmentCatalog";

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
  hidden: { opacity: 0, y: 15, scale: 0.97 },
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
    scale: 0.97,
    transition: { duration: 0.15 },
  },
};

const ExpertAssessmentsPage = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredAssessments = useMemo(() => {
    if (filter === "all") return assessments;
    return assessments.filter((a) => a.visibility === filter);
  }, [assessments, filter]);

  const toggleFilter = (type) => {
    setFilter((current) => (current === type ? "all" : type));
  };

  const loadAssessments = async () => {
    try {
      const data = await authService.getMyAssessments();
      setAssessments(normalizeAssessmentList(data.assessments));
      setError("");
    } catch (loadError) {
      setError(loadError.message || "Failed to load your assessments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = authService.getCurrentUser();

    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "expert") {
      navigate("/dashboard");
      return;
    }

    loadAssessments();
  }, [navigate]);

  const summary = useMemo(() => {
    const publicCount = assessments.filter(
      (assessment) => assessment.visibility === "public",
    ).length;

    return {
      publicCount,
      privateCount: assessments.length - publicCount,
    };
  }, [assessments]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f5e7] py-10 px-6 relative overflow-hidden flex items-center justify-center">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-80 h-80 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2c6e5f] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-[#2c6e5f] animate-pulse">Loading assessments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f5e7] py-10 px-6 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header Section */}
      <div className="max-w-6xl mx-auto mb-8 pb-4 border-b border-[#2c6e5f]/10">
        <h1 className="text-3xl font-extrabold text-[#1b4d42] tracking-tight">
          Your Assessments
        </h1>
        <p className="text-[#2c6e5f]/80 mt-1 font-medium max-w-2xl leading-relaxed text-sm md:text-base">
          Open an assessment to view its questions and details. Use the "Create an Assessment"
          button to start a new assessment.
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        <section className="glass-card p-8 rounded-3xl">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-4 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <span className="text-xs font-extrabold text-[#2c6e5f] uppercase tracking-wider">
                Assessment Overview
              </span>
              
              {/* Dynamic Tab Filter Bar */}
              <div className="bg-white/60 p-1 border border-[#2c6e5f]/15 rounded-2xl relative flex space-x-1 shadow-sm max-w-max">
                {[
                  { id: "all", label: "Total", count: assessments.length },
                  { id: "public", label: "Public", count: summary.publicCount },
                  { id: "private", label: "Private", count: summary.privateCount },
                ].map((tab) => {
                  const isActive = filter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => tab.id === "all" ? setFilter("all") : toggleFilter(tab.id)}
                      className="relative px-4 py-2.5 rounded-xl text-xs font-extrabold transition-colors cursor-pointer z-10"
                      style={{ color: isActive ? "#ffffff" : "#2c6e5f" }}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeFilterPill"
                          className="absolute inset-0 bg-[#2c6e5f] rounded-xl -z-10 shadow-sm"
                          transition={{ type: "spring", stiffness: 320, damping: 24 }}
                        />
                      )}
                      {tab.label}: <span className="ml-0.5 font-bold">{tab.count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/expert/assessments/new")}
              className="px-5 py-3 rounded-xl bg-[#2c6e5f] text-white text-xs font-extrabold hover:bg-[#1b4d42] transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 cursor-pointer shrink-0"
            >
              Create an Assessment
            </button>
          </div>

          {error ? (
            <div className="rounded-xl px-4 py-3 text-sm bg-rose-50 text-rose-800 mb-6 font-semibold">
              {error}
            </div>
          ) : null}

          {filter === "public" && (
            <div className="mb-6 rounded-xl px-4 py-2.5 text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100/50 flex items-center gap-1.5 max-w-max">
              <span>💡</span> These assessments are shown to students.
            </div>
          )}

          {filter === "private" && (
            <div className="mb-6 rounded-xl px-4 py-2.5 text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-100/50 flex items-center gap-1.5 max-w-max">
              <span>💡</span> Complete your modifications and publish them to make these assessments visible to students.
            </div>
          )}

          {filteredAssessments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 border border-dashed border-gray-200 rounded-3xl bg-slate-50/20 flex flex-col items-center justify-center shadow-sm"
            >
              <div className="w-12 h-12 rounded-full bg-[#2c6e5f]/5 flex items-center justify-center text-xl mb-4 text-[#2c6e5f]">
                📝
              </div>
              <h3 className="text-sm font-bold text-gray-800 mb-1">No assessments found</h3>
              <p className="text-xs text-gray-400 max-w-sm">
                We couldn't find any {filter !== "all" ? `${filter} ` : ""}assessments.
              </p>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredAssessments.map((assessment) => (
                  <motion.div
                    layout
                    variants={cardVariants}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    whileHover={{ y: -6 }}
                    key={assessment.id}
                    className="h-full"
                  >
                    <Link
                      to={`/expert/assessments/${assessment.id}`}
                      className="block h-full glass-card hover-glow-teal p-6 flex flex-col justify-between group"
                    >
                      <div>
                        {/* Card Header Icon & Visibility */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-2xl transition-all duration-300 group-hover:scale-110">
                            {assessment.icon || "📝"}
                          </div>
                          <span
                            className={`text-[10px] px-2.5 py-1 rounded-full font-extrabold tracking-wider uppercase border ${
                              assessment.visibility === "public"
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                : "bg-amber-50 text-amber-600 border-amber-100"
                            }`}
                          >
                            {assessment.visibility === "public" ? "Public" : "Private"}
                          </span>
                        </div>

                        {/* Card Title & Description */}
                        <div>
                          <h3 className="text-base font-bold text-gray-800 transition-colors duration-200 group-hover:text-[#2c6e5f] leading-snug">
                            {assessment.title}
                          </h3>
                          <p className="mt-2 text-xs text-gray-500 leading-relaxed line-clamp-3">
                            {assessment.description || "No description provided."}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer Info */}
                      <div className="mt-6 pt-3 border-t border-gray-100/50 flex flex-col gap-1.5 text-[10px] text-gray-400 font-medium">
                        <div className="flex justify-between items-center">
                          <div className="flex gap-2">
                            <span className="font-semibold text-gray-500">
                              {assessment.questions?.length || 0} Questions
                            </span>
                            <span>•</span>
                            <span className="font-semibold text-gray-500">
                              {assessment.duration || 0} Mins
                            </span>
                          </div>
                          {assessment.createdAt && (
                            <span className="text-[9px] text-gray-400 shrink-0">
                              {new Date(assessment.createdAt).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ExpertAssessmentsPage;

