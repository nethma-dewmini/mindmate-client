import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaPlus,
  FaRedoAlt,
  FaSave,
  FaTrash,
} from "react-icons/fa";
import { authService } from "../services/authService";
import {
  createAssessmentDraft,
  normalizeAssessment,
  normalizeAssessmentList,
} from "../data/assessmentCatalog";

function draftFromAssessment(assessment) {
  const normalized = normalizeAssessment(assessment);

  return {
    ...normalized,
    questions: normalized.questions.map((question) => ({
      prompt: question.prompt,
      optionsText: question.options.join("\n"),
    })),
  };
}

function createBlankEditor() {
  return draftFromAssessment(createAssessmentDraft());
}

function serializeEditor(editor) {
  return {
    title: String(editor.title || "").trim(),
    description: String(editor.description || "").trim(),
    icon: String(editor.icon || "🧠").trim() || "🧠",
    duration: Number(editor.duration) > 0 ? Number(editor.duration) : 5,
    visibility: editor.visibility === "public" ? "public" : "private",
    questions: (editor.questions || [])
      .map((question) => ({
        prompt: String(question.prompt || "").trim(),
        options: String(question.optionsText || "")
          .split("\n")
          .map((option) => option.trim())
          .filter(Boolean),
      }))
      .filter((question) => question.prompt && question.options.length > 0),
  };
}

const ExpertAssessmentsPage = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [editor, setEditor] = useState(() => createBlankEditor());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

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

    let isMounted = true;

    const loadAssessments = async () => {
      try {
        const data = await authService.getMyAssessments();
        if (!isMounted) {
          return;
        }

        const nextAssessments = normalizeAssessmentList(data.assessments);
        setAssessments(nextAssessments);

        if (nextAssessments.length > 0) {
          const nextSelected =
            nextAssessments.find((item) => item.id === selectedId) ||
            nextAssessments[0];
          setSelectedId(nextSelected.id);
          setEditor(draftFromAssessment(nextSelected));
        } else {
          setSelectedId("");
          setEditor(createBlankEditor());
        }
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(loadError.message || "Failed to load assessments.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAssessments();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const summary = useMemo(() => {
    const publicCount = assessments.filter(
      (assessment) => assessment.visibility === "public",
    ).length;
    const privateCount = assessments.length - publicCount;
    const totalQuestions = assessments.reduce(
      (total, assessment) => total + assessment.questions.length,
      0,
    );

    return {
      publicCount,
      privateCount,
      totalQuestions,
    };
  }, [assessments]);

  const selectAssessment = (assessment) => {
    setSelectedId(assessment.id);
    setEditor(draftFromAssessment(assessment));
    setNotice("");
    setError("");
  };

  const addQuestion = () => {
    setEditor((current) => ({
      ...current,
      questions: [
        ...current.questions,
        {
          prompt: "New question",
          optionsText: "Never\nRarely\nSometimes\nOften\nAlways",
        },
      ],
    }));
  };

  const updateQuestion = (questionIndex, field, value) => {
    setEditor((current) => {
      const questions = [...current.questions];
      questions[questionIndex] = {
        ...questions[questionIndex],
        [field]: value,
      };

      return {
        ...current,
        questions,
      };
    });
  };

  const removeQuestion = (questionIndex) => {
    setEditor((current) => ({
      ...current,
      questions: current.questions.filter(
        (_, index) => index !== questionIndex,
      ),
    }));
  };

  const startNewAssessment = () => {
    const blank = createBlankEditor();
    setSelectedId("");
    setEditor(blank);
    setNotice("Draft assessment ready.");
    setError("");
  };

  const refreshAssessments = async (nextSelectedId) => {
    const data = await authService.getMyAssessments();
    const nextAssessments = normalizeAssessmentList(data.assessments);
    setAssessments(nextAssessments);

    if (nextSelectedId) {
      const refreshed = nextAssessments.find(
        (item) => item.id === nextSelectedId,
      );
      if (refreshed) {
        setSelectedId(refreshed.id);
        setEditor(draftFromAssessment(refreshed));
        return;
      }
    }

    if (nextAssessments.length > 0) {
      setSelectedId(nextAssessments[0].id);
      setEditor(draftFromAssessment(nextAssessments[0]));
    } else {
      setSelectedId("");
      setEditor(createBlankEditor());
    }
  };

  const saveAssessment = async () => {
    const payload = serializeEditor(editor);

    if (!payload.title) {
      setError("Assessment title is required.");
      return;
    }

    if (payload.questions.length === 0) {
      setError("Add at least one question with at least one answer option.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const existing = assessments.find(
        (assessment) => assessment.id === editor.id,
      );
      const response = existing
        ? await authService.updateAssessment(editor.id, payload)
        : await authService.createAssessment(payload);

      const savedAssessment = normalizeAssessment(response.assessment);
      setNotice(
        existing
          ? "Assessment updated and saved."
          : "Assessment created. Publish it when you are ready for students to see it.",
      );
      await refreshAssessments(savedAssessment.id);
    } catch (saveError) {
      setError(saveError.message || "Failed to save assessment.");
    } finally {
      setSaving(false);
    }
  };

  const deleteAssessment = async () => {
    const target = assessments.find(
      (assessment) => assessment.id === editor.id,
    );

    if (!target) {
      setError("Select a saved assessment before deleting it.");
      return;
    }

    if (!window.confirm(`Delete "${target.title}"? This cannot be undone.`)) {
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      await authService.deleteAssessment(target.id);
      setNotice("Assessment deleted.");
      await refreshAssessments();
    } catch (deleteError) {
      setError(deleteError.message || "Failed to delete assessment.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7faf8] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto rounded-3xl bg-white border border-slate-100 shadow-sm p-8">
          Loading assessment workspace...
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
            Mental Health Assessments
          </h1>
          <p className="mt-2 text-slate-500 max-w-2xl">
            Create assessments, publish them to students, and update or remove
            them whenever your clinical guidance changes.
          </p>
        </div>

        <div className="flex gap-3 flex-wrap justify-start lg:justify-end">
          <button
            type="button"
            onClick={startNewAssessment}
            className="px-4 py-2 rounded-xl bg-[#5bb5a1] text-white font-medium hover:bg-[#4a9d8b] inline-flex items-center gap-2"
          >
            <FaPlus /> New Assessment
          </button>
          <button
            type="button"
            onClick={() => refreshAssessments(selectedId || undefined)}
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
                Selected
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-800">
                {selectedId ? "1" : "0"}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
            <div className="border-b border-slate-100 px-4 py-3 font-medium text-slate-700">
              Your Assessments
            </div>
            <div className="divide-y divide-slate-100">
              {assessments.length === 0 ? (
                <div className="p-4 text-sm text-slate-500">
                  No assessments yet. Create your first one.
                </div>
              ) : (
                assessments.map((assessment) => (
                  <button
                    key={assessment.id}
                    type="button"
                    onClick={() => selectAssessment(assessment)}
                    className={`w-full text-left p-4 transition-colors ${
                      selectedId === assessment.id
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
                  </button>
                ))
              )}
            </div>
          </div>
        </aside>

        <section className="rounded-3xl bg-white shadow-sm border border-slate-100 overflow-hidden">
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
              </div>

              {notice ? (
                <div className="rounded-xl px-4 py-3 text-sm bg-emerald-50 text-emerald-800">
                  {notice}
                </div>
              ) : null}

              {error ? (
                <div className="rounded-xl px-4 py-3 text-sm bg-rose-50 text-rose-800">
                  {error}
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-600">
                    Title
                  </span>
                  <input
                    value={editor.title}
                    onChange={(event) =>
                      setEditor((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#5bb5a1]"
                    placeholder="Assessment title"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-600">
                    Icon
                  </span>
                  <input
                    value={editor.icon}
                    onChange={(event) =>
                      setEditor((current) => ({
                        ...current,
                        icon: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#5bb5a1]"
                    placeholder="🧠"
                  />
                </label>

                <label className="space-y-2 sm:col-span-2">
                  <span className="text-sm font-medium text-slate-600">
                    Description
                  </span>
                  <textarea
                    rows="3"
                    value={editor.description}
                    onChange={(event) =>
                      setEditor((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#5bb5a1]"
                    placeholder="Explain what this assessment measures"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-600">
                    Duration
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={editor.duration}
                    onChange={(event) =>
                      setEditor((current) => ({
                        ...current,
                        duration: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#5bb5a1]"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-600">
                    Visibility
                  </span>
                  <select
                    value={editor.visibility}
                    onChange={(event) =>
                      setEditor((current) => ({
                        ...current,
                        visibility: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#5bb5a1] bg-white"
                  >
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                  </select>
                </label>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">
                      Questions
                    </h3>
                    <p className="text-sm text-slate-500">
                      Build each prompt and list answer options on separate
                      lines.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 inline-flex items-center gap-2 text-sm font-medium"
                  >
                    <FaPlus /> Add question
                  </button>
                </div>

                <div className="space-y-4">
                  {editor.questions.map((question, index) => (
                    <div
                      key={`${index}-${question.prompt}`}
                      className="rounded-2xl border border-slate-200 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <h4 className="font-semibold text-slate-800">
                          Question {index + 1}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeQuestion(index)}
                          disabled={editor.questions.length === 1}
                          className="text-sm text-rose-500 hover:text-rose-600 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2"
                        >
                          <FaTrash /> Remove
                        </button>
                      </div>

                      <label className="space-y-2 block">
                        <span className="text-sm font-medium text-slate-600">
                          Prompt
                        </span>
                        <input
                          value={question.prompt}
                          onChange={(event) =>
                            updateQuestion(index, "prompt", event.target.value)
                          }
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#5bb5a1]"
                        />
                      </label>

                      <label className="space-y-2 block">
                        <span className="text-sm font-medium text-slate-600">
                          Answer options
                        </span>
                        <textarea
                          rows="4"
                          value={question.optionsText}
                          onChange={(event) =>
                            updateQuestion(
                              index,
                              "optionsText",
                              event.target.value,
                            )
                          }
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#5bb5a1]"
                          placeholder={
                            "Never\nRarely\nSometimes\nOften\nAlways"
                          }
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 bg-slate-50 space-y-4">
              <div className="rounded-2xl bg-white p-5 border border-slate-100 shadow-sm">
                <div className="text-xs uppercase tracking-wide text-slate-400">
                  Visibility note
                </div>
                <p className="mt-2 text-sm text-slate-600 leading-6">
                  Public assessments will appear on the student assessment page.
                  Keep private assessments hidden until they are ready.
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5 border border-slate-100 shadow-sm space-y-3">
                <div className="text-xs uppercase tracking-wide text-slate-400">
                  Quick Stats
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="text-slate-400">Questions</div>
                    <div className="mt-1 font-semibold text-slate-800">
                      {editor.questions.length}
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="text-slate-400">Duration</div>
                    <div className="mt-1 font-semibold text-slate-800">
                      {editor.duration || 5} min
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-5 border border-slate-100 shadow-sm space-y-3">
                <button
                  type="button"
                  onClick={saveAssessment}
                  disabled={saving}
                  className="w-full px-4 py-3 rounded-xl bg-[#5bb5a1] text-white font-medium hover:bg-[#4a9d8b] disabled:opacity-60 inline-flex items-center justify-center gap-2"
                >
                  <FaSave /> {saving ? "Saving..." : "Save Assessment"}
                </button>
                <button
                  type="button"
                  onClick={deleteAssessment}
                  disabled={
                    saving || !assessments.find((item) => item.id === editor.id)
                  }
                  className="w-full px-4 py-3 rounded-xl border border-rose-200 text-rose-600 font-medium hover:bg-rose-50 disabled:opacity-60 inline-flex items-center justify-center gap-2"
                >
                  <FaTrash /> Delete Assessment
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ExpertAssessmentsPage;
