import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import {
  createAssessmentDraft,
  loadAssessmentCatalog,
  removeAssessmentFromCatalog,
  resetAssessmentCatalog,
  saveAssessmentCatalog,
  updateAssessmentInCatalog,
} from "../data/assessmentCatalog";

const STATUS_LABELS = {
  active: "Active",
  draft: "Draft",
  archived: "Archived",
};

const STATUS_STYLES = {
  active: "bg-emerald-100 text-emerald-800",
  draft: "bg-amber-100 text-amber-800",
  archived: "bg-slate-100 text-slate-700",
};

function cloneAssessment(assessment) {
  return {
    ...assessment,
    questions: assessment.questions.map((question) => ({
      ...question,
      options: [...question.options],
    })),
  };
}

const AdminAssessmentsPage = () => {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState(() => loadAssessmentCatalog());
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(
    () => loadAssessmentCatalog()[0]?.id || "",
  );
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate("/admin/login");
      return;
    }

    if (user.role !== "admin") {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    if (!selectedAssessmentId && catalog[0]) {
      setSelectedAssessmentId(catalog[0].id);
    }
  }, [catalog, selectedAssessmentId]);

  const selectedAssessment =
    catalog.find((assessment) => assessment.id === selectedAssessmentId) ||
    catalog[0] ||
    null;

  const summary = useMemo(() => {
    const active = catalog.filter(
      (assessment) => assessment.status === "active",
    ).length;
    const draft = catalog.filter(
      (assessment) => assessment.status === "draft",
    ).length;
    const archived = catalog.filter(
      (assessment) => assessment.status === "archived",
    ).length;
    const totalQuestions = catalog.reduce(
      (total, assessment) => total + assessment.questions.length,
      0,
    );

    return {
      active,
      draft,
      archived,
      totalQuestions,
      averageDuration:
        catalog.length > 0
          ? Math.round(
              catalog.reduce(
                (total, assessment) => total + assessment.duration,
                0,
              ) / catalog.length,
            )
          : 0,
    };
  }, [catalog]);

  const persistCatalog = (nextCatalog, message) => {
    setCatalog(nextCatalog);
    saveAssessmentCatalog(nextCatalog);

    if (message) {
      setNotice({ type: "success", message });
    }
  };

  const updateSelectedAssessment = (updater) => {
    if (!selectedAssessment) return;

    const nextAssessment = updater(cloneAssessment(selectedAssessment));
    const nextCatalog = updateAssessmentInCatalog(catalog, nextAssessment);
    persistCatalog(nextCatalog);
  };

  const updateField = (field, value) => {
    updateSelectedAssessment((assessment) => ({
      ...assessment,
      [field]: value,
    }));
  };

  const updateQuestion = (questionIndex, field, value) => {
    updateSelectedAssessment((assessment) => {
      const questions = [...assessment.questions];
      questions[questionIndex] = {
        ...questions[questionIndex],
        [field]: value,
      };
      return {
        ...assessment,
        questions,
      };
    });
  };

  const updateQuestionOptions = (questionIndex, value) => {
    const options = value
      .split("\n")
      .map((option) => option.trim())
      .filter(Boolean);

    updateQuestion(questionIndex, "options", options);
  };

  const addQuestion = () => {
    updateSelectedAssessment((assessment) => ({
      ...assessment,
      questions: [
        ...assessment.questions,
        {
          prompt: "New question",
          options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
        },
      ],
    }));
  };

  const removeQuestion = (questionIndex) => {
    updateSelectedAssessment((assessment) => ({
      ...assessment,
      questions: assessment.questions.filter(
        (_, index) => index !== questionIndex,
      ),
    }));
  };

  const addAssessment = () => {
    const draft = createAssessmentDraft();
    const nextCatalog = [draft, ...catalog];
    persistCatalog(nextCatalog, "New assessment created.");
    setSelectedAssessmentId(draft.id);
  };

  const resetCatalog = () => {
    const nextCatalog = resetAssessmentCatalog();
    setCatalog(nextCatalog);
    setSelectedAssessmentId(nextCatalog[0]?.id || "");
    setNotice({
      type: "success",
      message: "Assessment catalog reset to defaults.",
    });
  };

  const deleteAssessment = () => {
    if (!selectedAssessment) return;

    const nextCatalog = removeAssessmentFromCatalog(
      catalog,
      selectedAssessment.id,
    );
    persistCatalog(nextCatalog, "Assessment removed.");
    setSelectedAssessmentId(nextCatalog[0]?.id || "");
  };

  return (
    <div className="min-h-screen bg-[#f7faf8] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto mb-6 flex items-center justify-between gap-4">
        <div>
          <Link
            to="/admin/dashboard"
            className="text-sm text-[#5bb5a1] hover:underline"
          >
            ← Back to Admin Dashboard
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-slate-800">
            Mental Health Assessments
          </h1>
          <p className="mt-2 text-slate-500 max-w-2xl">
            Create and refine the assessment templates that students will see.
            This first pass saves locally so the public assessment screen can be
            exercised before backend storage is connected.
          </p>
        </div>

        <div className="flex gap-3 flex-wrap justify-end">
          <button
            type="button"
            onClick={addAssessment}
            className="px-4 py-2 rounded-xl bg-[#5bb5a1] text-white font-medium hover:bg-[#4a9d8b]"
          >
            Add Assessment
          </button>
          <button
            type="button"
            onClick={resetCatalog}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50"
          >
            Reset Defaults
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
              <div className="text-xs uppercase tracking-wide text-slate-400">
                Active
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-800">
                {summary.active}
              </div>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
              <div className="text-xs uppercase tracking-wide text-slate-400">
                Drafts
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-800">
                {summary.draft}
              </div>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
              <div className="text-xs uppercase tracking-wide text-slate-400">
                Archived
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-800">
                {summary.archived}
              </div>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
              <div className="text-xs uppercase tracking-wide text-slate-400">
                Avg. minutes
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-800">
                {summary.averageDuration}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
            <div className="border-b border-slate-100 px-4 py-3 font-medium text-slate-700">
              Assessment Library
            </div>
            <div className="divide-y divide-slate-100">
              {catalog.map((assessment) => (
                <button
                  key={assessment.id}
                  type="button"
                  onClick={() => setSelectedAssessmentId(assessment.id)}
                  className={`w-full text-left p-4 transition-colors ${
                    selectedAssessment?.id === assessment.id
                      ? "bg-teal-50"
                      : "hover:bg-slate-50"
                  }`}
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
                      className={`text-[11px] px-2 py-1 rounded-full font-medium ${STATUS_STYLES[assessment.status]}`}
                    >
                      {STATUS_LABELS[assessment.status]}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="rounded-3xl bg-white shadow-sm border border-slate-100 overflow-hidden">
          {!selectedAssessment ? (
            <div className="p-8 text-slate-500">
              Select an assessment to edit it.
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="p-6 sm:p-8 space-y-6 border-b xl:border-b-0 xl:border-r border-slate-100">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#5bb5a1] uppercase tracking-wide">
                      Assessment Builder
                    </p>
                    <h2 className="mt-1 text-2xl font-bold text-slate-800">
                      Edit assessment details
                    </h2>
                  </div>
                  <span
                    className={`inline-flex w-fit text-xs px-3 py-1 rounded-full font-medium ${STATUS_STYLES[selectedAssessment.status]}`}
                  >
                    {STATUS_LABELS[selectedAssessment.status]}
                  </span>
                </div>

                {notice && (
                  <div
                    className={`rounded-xl px-4 py-3 text-sm ${
                      notice.type === "success"
                        ? "bg-emerald-50 text-emerald-800"
                        : "bg-rose-50 text-rose-800"
                    }`}
                  >
                    {notice.message}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-600">
                      Title
                    </span>
                    <input
                      value={selectedAssessment.title}
                      onChange={(event) =>
                        updateField("title", event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#5bb5a1]"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-600">
                      Icon
                    </span>
                    <input
                      value={selectedAssessment.icon}
                      onChange={(event) =>
                        updateField("icon", event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#5bb5a1]"
                    />
                  </label>
                  <label className="space-y-2 sm:col-span-2">
                    <span className="text-sm font-medium text-slate-600">
                      Description
                    </span>
                    <textarea
                      rows={4}
                      value={selectedAssessment.description}
                      onChange={(event) =>
                        updateField("description", event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#5bb5a1]"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-600">
                      Audience
                    </span>
                    <input
                      value={selectedAssessment.audience}
                      onChange={(event) =>
                        updateField("audience", event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#5bb5a1]"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-600">
                      Duration (minutes)
                    </span>
                    <input
                      type="number"
                      min="1"
                      value={selectedAssessment.duration}
                      onChange={(event) =>
                        updateField("duration", Number(event.target.value) || 1)
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#5bb5a1]"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-600">
                      Status
                    </span>
                    <select
                      value={selectedAssessment.status}
                      onChange={(event) =>
                        updateField("status", event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#5bb5a1] bg-white"
                    >
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </label>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">
                        Questions
                      </h3>
                      <p className="text-sm text-slate-500">
                        Each question stores a prompt and a 5-point response
                        scale.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                      Add Question
                    </button>
                  </div>

                  <div className="space-y-4">
                    {selectedAssessment.questions.map(
                      (question, questionIndex) => (
                        <div
                          key={`${selectedAssessment.id}-${questionIndex}`}
                          className="rounded-2xl border border-slate-200 p-4 space-y-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-medium text-slate-700">
                                Question {questionIndex + 1}
                              </div>
                              <div className="text-xs text-slate-400 mt-1">
                                Write the prompt and put one answer option per
                                line.
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeQuestion(questionIndex)}
                              className="text-sm font-medium text-rose-600 hover:text-rose-700"
                            >
                              Remove
                            </button>
                          </div>

                          <label className="space-y-2 block">
                            <span className="text-sm font-medium text-slate-600">
                              Prompt
                            </span>
                            <textarea
                              rows={3}
                              value={question.prompt}
                              onChange={(event) =>
                                updateQuestion(
                                  questionIndex,
                                  "prompt",
                                  event.target.value,
                                )
                              }
                              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#5bb5a1]"
                            />
                          </label>

                          <label className="space-y-2 block">
                            <span className="text-sm font-medium text-slate-600">
                              Options
                            </span>
                            <textarea
                              rows={5}
                              value={question.options.join("\n")}
                              onChange={(event) =>
                                updateQuestionOptions(
                                  questionIndex,
                                  event.target.value,
                                )
                              }
                              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#5bb5a1] font-mono text-sm"
                            />
                          </label>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
                  <p className="text-sm text-slate-500">
                    Changes save immediately to local storage for the current
                    browser.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={deleteAssessment}
                      className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50"
                    >
                      Delete Assessment
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-6 bg-[#fbfdfc]">
                <div>
                  <p className="text-sm font-semibold text-[#5bb5a1] uppercase tracking-wide">
                    Live Preview
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-slate-800">
                    How this will appear to students
                  </h3>
                </div>

                <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl flex items-center justify-center text-4xl">
                    {selectedAssessment.icon}
                  </div>
                  <h4 className="text-xl font-semibold text-slate-800">
                    {selectedAssessment.title}
                  </h4>
                  <p className="mt-2 text-sm text-slate-500">
                    {selectedAssessment.description}
                  </p>
                  <div className="mt-4 flex justify-center gap-4 text-xs text-slate-400">
                    <span>
                      📝 {selectedAssessment.questions.length} questions
                    </span>
                    <span>⏱ {selectedAssessment.duration} minutes</span>
                  </div>
                  <div className="mt-4 inline-flex rounded-full px-3 py-1 text-xs font-medium bg-slate-100 text-slate-700">
                    Audience: {selectedAssessment.audience}
                  </div>
                  <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-4 text-left">
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      First question preview
                    </div>
                    <div className="mt-2 text-sm font-medium text-slate-700">
                      {selectedAssessment.questions[0]?.prompt ||
                        "No questions yet"}
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
                  <h4 className="text-lg font-semibold text-slate-800 mb-3">
                    Summary
                  </h4>
                  <div className="space-y-3 text-sm text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>Assessment ID</span>
                      <span className="font-medium text-slate-800">
                        {selectedAssessment.id}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Status</span>
                      <span className="font-medium text-slate-800">
                        {STATUS_LABELS[selectedAssessment.status]}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Questions</span>
                      <span className="font-medium text-slate-800">
                        {selectedAssessment.questions.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Estimated time</span>
                      <span className="font-medium text-slate-800">
                        {selectedAssessment.duration} min
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminAssessmentsPage;
