import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaSave, FaTrash } from "react-icons/fa";
import { authService } from "../services/authService";
import { normalizeAssessment } from "../data/assessmentCatalog";

function toEditorState(assessment) {
  const normalized = normalizeAssessment(assessment);

  return {
    id: normalized.id,
    key: normalized.key || "",
    title: normalized.title,
    description: normalized.description,
    icon: normalized.icon,
    duration: normalized.duration,
    visibility: normalized.visibility,
    questions: normalized.questions.map((question) => ({
      prompt: question.prompt,
      optionsText: question.options.join("\n"),
    })),
  };
}

function emptyEditor() {
  return {
    id: "new",
    key: "",
    title: "Untitled assessment",
    description: "",
    icon: "🧠",
    duration: 5,
    visibility: "private",
    questions: [
      {
        prompt: "How often have you felt this way recently?",
        optionsText: "Never\nRarely\nSometimes\nOften\nAlways",
      },
    ],
  };
}

function serializeEditor(editor) {
  return {
    key: String(editor.key || "").trim(),
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

const ExpertAssessmentDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = id === "new";
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(isNew);
  const [assessment, setAssessment] = useState(isNew ? null : null);
  const [editor, setEditor] = useState(() => emptyEditor());
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

    const loadAssessment = async () => {
      try {
        if (isNew) {
          setAssessment(null);
          setEditor(emptyEditor());
          setEditing(true);
          return;
        }

        const data = await authService.getAssessmentById(id);
        if (!isMounted) {
          return;
        }

        const loadedAssessment = normalizeAssessment(data.assessment);
        setAssessment(loadedAssessment);
        setEditor(toEditorState(loadedAssessment));
        setEditing(false);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(loadError.message || "Failed to load assessment.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAssessment();

    return () => {
      isMounted = false;
    };
  }, [id, navigate, isNew]);

  const parsedQuestions = useMemo(
    () =>
      serializeEditor(editor).questions.map((question) => ({
        prompt: question.prompt,
        options: question.options,
      })),
    [editor],
  );

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

  const removeQuestion = (questionIndex) => {
    setEditor((current) => ({
      ...current,
      questions: current.questions.filter(
        (_, index) => index !== questionIndex,
      ),
    }));
  };

  const saveAssessment = async () => {
    const payload = serializeEditor(editor);

    if (!payload.title) {
      setError("Assessment title is required.");
      return;
    }

    if (payload.questions.length === 0) {
      setError("Add at least one question with one answer option.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const response = isNew
        ? await authService.createAssessment(payload)
        : await authService.updateAssessment(id, payload);

      const savedAssessment = normalizeAssessment(response.assessment);
      setAssessment(savedAssessment);
      setEditor(toEditorState(savedAssessment));
      setEditing(false);
      setNotice(isNew ? "Assessment created." : "Assessment updated.");

      if (isNew) {
        navigate(`/expert/assessments/${savedAssessment.id}`, {
          replace: true,
        });
      }
    } catch (saveError) {
      setError(saveError.message || "Failed to save assessment.");
    } finally {
      setSaving(false);
    }
  };

  const deleteAssessment = async () => {
    if (isNew) {
      navigate("/expert/assessments");
      return;
    }

    if (!window.confirm(`Delete "${editor.title}"? This cannot be undone.`)) {
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      await authService.deleteAssessment(id);
      navigate("/expert/assessments");
    } catch (deleteError) {
      setError(deleteError.message || "Failed to delete assessment.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7faf8] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto rounded-3xl bg-white border border-slate-100 shadow-sm p-8">
          Loading assessment...
        </div>
      </div>
    );
  }

  if (!isNew && !assessment) {
    return (
      <div className="min-h-screen bg-[#f7faf8] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto rounded-3xl bg-white border border-slate-100 shadow-sm p-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Assessment not found
          </h1>
          <p className="text-slate-500 mb-6">
            The selected assessment could not be loaded.
          </p>
          <Link
            to="/expert/assessments"
            className="inline-flex items-center px-4 py-2 rounded-xl bg-[#5bb5a1] text-white font-medium hover:bg-[#4a9d8b]"
          >
            <FaArrowLeft className="mr-2" /> Back to Assessments
          </Link>
        </div>
      </div>
    );
  }

  const title = editor.title || assessment?.title || "Untitled assessment";
  const visibility = editor.visibility || assessment?.visibility || "private";

  return (
    <div className="min-h-screen bg-[#f7faf8] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <Link
            to="/expert/assessments"
            className="inline-flex items-center text-sm text-[#5bb5a1] hover:underline"
          >
            <FaArrowLeft className="mr-2" /> Back to Assessments
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-slate-800">{title}</h1>
          <p className="mt-2 text-slate-500 max-w-2xl">
            View the assessment details here. Switch to edit mode to update the
            title, questions, visibility, or delete it.
          </p>
          {!isNew && assessment?.createdAt && (
            <p className="mt-2 text-xs text-slate-400 font-medium">
              Created on {new Date(assessment.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
        </div>

        <div className="flex gap-3 items-center justify-start sm:justify-end shrink-0">
          <button
            type="button"
            onClick={() => setEditing((current) => !current)}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50"
          >
            {editing ? "View Mode" : "Edit Mode"}
          </button>
          <button
            type="button"
            onClick={saveAssessment}
            disabled={saving || !editing}
            className="px-4 py-2 rounded-xl bg-[#5bb5a1] text-white font-medium hover:bg-[#4a9d8b] disabled:opacity-60 inline-flex items-center gap-2"
          >
            <FaSave /> {isNew ? "Create" : "Save"}
          </button>
          <button
            type="button"
            onClick={deleteAssessment}
            disabled={saving || isNew ? false : false}
            className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 font-medium hover:bg-rose-50 inline-flex items-center gap-2"
          >
            <FaTrash /> Delete
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <section className="rounded-3xl bg-white shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-slate-100">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 w-full">
                <span className="text-4xl">{editor.icon || "🧠"}</span>
                <div className="flex-grow">
                  <p className="text-sm font-semibold text-[#5bb5a1] uppercase tracking-wide">
                    {editing ? "Edit Assessment Details" : "Assessment View"}
                  </p>
                  {editing ? (
                    <input
                      type="text"
                      value={editor.title}
                      onChange={(e) =>
                        setEditor((curr) => ({ ...curr, title: e.target.value }))
                      }
                      placeholder="Assessment Title"
                      className="w-full text-2xl font-bold text-slate-800 border-b border-slate-200 focus:border-[#5bb5a1] outline-none py-1 mt-1"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
                  )}
                </div>
              </div>
              {!editing && (
                <span
                  className={`text-[11px] px-2 py-1 rounded-full font-medium ${
                    visibility === "public"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {visibility === "public" ? "Public" : "Private"}
                </span>
              )}
            </div>

            {notice ? (
              <div className="mt-4 rounded-xl px-4 py-3 text-sm bg-emerald-50 text-emerald-800">
                {notice}
              </div>
            ) : null}

            {error ? (
              <div className="mt-4 rounded-xl px-4 py-3 text-sm bg-rose-50 text-rose-800">
                {error}
              </div>
            ) : null}
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                  Duration (minutes)
                </div>
                {editing ? (
                  <input
                    type="number"
                    min="1"
                    value={editor.duration}
                    onChange={(e) =>
                      setEditor((curr) => ({
                        ...curr,
                        duration: e.target.value === "" ? "" : Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-[#5bb5a1] bg-white font-semibold text-slate-800 mt-1"
                  />
                ) : (
                  <div className="mt-1 text-lg font-semibold text-slate-800">
                    {editor.duration || assessment?.duration || 5} min
                  </div>
                )}
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                  Questions
                </div>
                <div className="mt-1.5 text-lg font-semibold text-slate-800">
                  {parsedQuestions.length}
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                  Visibility
                </div>
                {editing ? (
                  <select
                    value={editor.visibility}
                    onChange={(e) =>
                      setEditor((curr) => ({
                        ...curr,
                        visibility: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-[#5bb5a1] bg-white font-semibold text-slate-800 mt-1"
                  >
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                  </select>
                ) : (
                  <div className="mt-1 text-lg font-semibold text-slate-800">
                    {visibility === "public" ? "Public" : "Private"}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                Description
              </h3>
              {editing ? (
                <textarea
                  rows="3"
                  value={editor.description}
                  onChange={(e) =>
                    setEditor((curr) => ({
                      ...curr,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe the assessment purpose, target audience, or what it measures..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#5bb5a1] text-slate-700 text-sm leading-6 bg-white"
                />
              ) : (
                <p className="text-slate-600 leading-7">
                  {editor.description ||
                    assessment?.description ||
                    "No description provided."}
                </p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Questions
              </h3>

              <div className="space-y-4">
                {parsedQuestions.map((question, index) => (
                  <div
                    key={`${question.prompt}-${index}`}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    {editing ? (
                      <>
                        <input
                          value={editor.questions[index].prompt}
                          onChange={(event) =>
                            updateQuestion(index, "prompt", event.target.value)
                          }
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#5bb5a1] mb-3"
                        />
                        <textarea
                          rows="4"
                          value={editor.questions[index].optionsText}
                          onChange={(event) =>
                            updateQuestion(
                              index,
                              "optionsText",
                              event.target.value,
                            )
                          }
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#5bb5a1]"
                        />
                        <div className="mt-3 flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeQuestion(index)}
                            disabled={editor.questions.length === 1}
                            className="text-sm text-rose-600 hover:underline disabled:opacity-40"
                          >
                            Remove question
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <h4 className="font-semibold text-slate-800 mb-3">
                          {index + 1}. {question.prompt}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {question.options.map((option) => (
                            <span
                              key={option}
                              className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm"
                            >
                              {option}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {editing ? (
                <button
                  type="button"
                  onClick={addQuestion}
                  className="mt-4 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200"
                >
                  Add Question
                </button>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ExpertAssessmentDetailPage;
