import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { authService } from "../services/authService";
import { normalizeAssessmentList } from "../data/assessmentCatalog";

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

  const getCardClass = (type) => {
    const baseClass = "rounded-2xl p-4 border transition-all cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-[#5bb5a1]/50";
    if (filter === type) {
      return `${baseClass} bg-[#5bb5a1]/8 border-[#5bb5a1] shadow-sm scale-[1.02]`;
    }
    return `${baseClass} bg-slate-50/80 border-slate-100 hover:bg-slate-100/80 hover:border-slate-200`;
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
      <div className="min-h-screen bg-[#f7faf8] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto rounded-3xl bg-white border border-slate-100 shadow-sm p-8">
          Loading your assessments...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7faf8] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link
            to="/expert/dashboard"
            className="inline-flex items-center text-sm text-[#5bb5a1] hover:underline"
          >
            <FaArrowLeft className="mr-2" /> Back to Expert Dashboard
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-slate-800">
            Your Assessments
          </h1>
          <p className="mt-2 text-slate-500 max-w-2xl">
            Open an assessment to view its questions and details. Use the "Create an Assessment"
            button to start a new draft.
          </p>
        </div>


      </div>

      <div className="max-w-7xl mx-auto">
        <section className="rounded-3xl bg-white shadow-sm border border-slate-100 p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <p className="text-sm font-semibold text-[#5bb5a1] uppercase tracking-wide">
                Assessment Overview
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-800">
                Select a card to view the assessment
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate("/expert/assessments/new")}
              className="px-4 py-2 rounded-xl bg-[#5bb5a1] text-white font-medium hover:bg-[#4a9d8b]"
            >
              Create an Assessment
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8 max-w-md">
            <button
              type="button"
              onClick={() => toggleFilter("public")}
              className={getCardClass("public")}
            >
              <div className="text-xs uppercase tracking-wide text-slate-400 font-medium text-left">
                Public
              </div>
              <div className="mt-1 text-2xl font-bold text-slate-800 text-left">
                {summary.publicCount}
              </div>
            </button>
            <button
              type="button"
              onClick={() => toggleFilter("private")}
              className={getCardClass("private")}
            >
              <div className="text-xs uppercase tracking-wide text-slate-400 font-medium text-left">
                Private
              </div>
              <div className="mt-1 text-2xl font-bold text-slate-800 text-left">
                {summary.privateCount}
              </div>
            </button>
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={getCardClass("all")}
            >
              <div className="text-xs uppercase tracking-wide text-slate-400 font-medium text-left">
                Total
              </div>
              <div className="mt-1 text-2xl font-bold text-slate-800 text-left">
                {assessments.length}
              </div>
            </button>
          </div>

          {error ? (
            <div className="rounded-xl px-4 py-3 text-sm bg-rose-50 text-rose-800 mb-4">
              {error}
            </div>
          ) : null}

          {filteredAssessments.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
              <p className="text-slate-500 font-medium">
                No {filter !== "all" ? filter : ""} assessments found.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAssessments.map((assessment) => (
                <Link
                  key={assessment.id}
                  to={`/expert/assessments/${assessment.id}`}
                  className="rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-[#5bb5a1] transition-all bg-slate-50/60"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{assessment.icon}</span>
                        <h3 className="text-lg font-semibold text-slate-800">
                          {assessment.title}
                        </h3>
                      </div>
                      <p className="text-sm text-slate-600 leading-6">
                        {assessment.description}
                      </p>
                    </div>
                    <span
                      className={`text-[11px] px-2 py-1 rounded-full font-medium whitespace-nowrap ${
                        assessment.visibility === "public"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {assessment.visibility === "public" ? "Public" : "Private"}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex gap-2">
                      <span>{assessment.questions.length} questions</span>
                      <span>•</span>
                      <span>{assessment.duration} minutes</span>
                    </div>
                    {assessment.createdAt && (
                      <span>
                        Created: {new Date(assessment.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ExpertAssessmentsPage;
