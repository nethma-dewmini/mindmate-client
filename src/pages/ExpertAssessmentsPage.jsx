import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPlus, FaRedoAlt } from "react-icons/fa";
import { authService } from "../services/authService";
import { normalizeAssessmentList } from "../data/assessmentCatalog";

const ExpertAssessmentsPage = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      totalQuestions: assessments.reduce(
        (total, assessment) => total + assessment.questions.length,
        0,
      ),
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
            Open an assessment to view its questions and details. Use the create
            button to start a new draft.
          </p>
        </div>

        <div className="flex gap-3 flex-wrap justify-start lg:justify-end">
          <button
            type="button"
            onClick={() => navigate("/expert/assessments/new")}
            className="px-4 py-2 rounded-xl bg-[#5bb5a1] text-white font-medium hover:bg-[#4a9d8b] inline-flex items-center gap-2"
          >
            <FaPlus /> Create Assessment
          </button>
          <button
            type="button"
            onClick={loadAssessments}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50 inline-flex items-center gap-2"
          >
            <FaRedoAlt /> Refresh
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
              <div className="text-xs uppercase tracking-wide text-slate-400">
                Public
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-800">
                {summary.publicCount}
              </div>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
              <div className="text-xs uppercase tracking-wide text-slate-400">
                Private
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-800">
                {summary.privateCount}
              </div>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
              <div className="text-xs uppercase tracking-wide text-slate-400">
                Questions
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-800">
                {summary.totalQuestions}
              </div>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
              <div className="text-xs uppercase tracking-wide text-slate-400">
                Total
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-800">
                {assessments.length}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
            <div className="border-b border-slate-100 px-4 py-3 font-medium text-slate-700">
              Assessment Library
            </div>
            <div className="divide-y divide-slate-100">
              {assessments.length === 0 ? (
                <div className="p-4 text-sm text-slate-500">
                  You have not created any assessments yet.
                </div>
              ) : (
                assessments.map((assessment) => (
                  <Link
                    key={assessment.id}
                    to={`/expert/assessments/${assessment.id}`}
                    className="block p-4 transition-colors hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{assessment.icon}</span>
                          <h2 className="font-semibold text-slate-800">
                            {assessment.title}
                          </h2>
                        </div>
                        <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                          {assessment.description}
                        </p>
                        <div className="mt-2 text-xs text-slate-400">
                          {assessment.questions.length} questions ·{" "}
                          {assessment.duration} min
                        </div>
                      </div>
                      <span
                        className={`text-[11px] px-2 py-1 rounded-full font-medium ${
                          assessment.visibility === "public"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {assessment.visibility === "public"
                          ? "Public"
                          : "Private"}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </aside>

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
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200"
            >
              Start a new draft
            </button>
          </div>

          {error ? (
            <div className="rounded-xl px-4 py-3 text-sm bg-rose-50 text-rose-800 mb-4">
              {error}
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assessments.map((assessment) => (
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
                  <span>{assessment.questions.length} questions</span>
                  <span>{assessment.duration} minutes</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ExpertAssessmentsPage;
