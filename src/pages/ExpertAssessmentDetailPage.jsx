import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft, FaSave, FaTrash, FaPlus, FaEye, FaEdit } from "react-icons/fa";
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
    [editor]
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
      questions: current.questions.filter((_, index) => index !== questionIndex),
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

  const deleteAssessment = () => {
    if (isNew) {
      navigate("/expert/assessments");
      return;
    }
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAssessment = async () => {
    setSaving(true);
    setError("");
    setNotice("");
    setShowDeleteConfirm(false);

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
      <div className="min-h-screen bg-[#f9f5e7] py-10 px-6 relative overflow-hidden flex items-center justify-center">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-80 h-80 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2c6e5f] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-[#2c6e5f] animate-pulse">
            Loading assessment details...
          </p>
        </div>
      </div>
    );
  }

  if (!isNew && !assessment) {
    return (
      <div className="min-h-screen bg-[#f9f5e7] py-10 px-6 relative overflow-hidden flex items-center justify-center">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-80 h-80 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="max-w-md w-full glass-card p-8 rounded-3xl text-center shadow-xl">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-4 mx-auto text-2xl">
            ⚠️
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Assessment not found</h1>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            The selected assessment could not be loaded or does not exist.
          </p>
          <button
            onClick={() => navigate("/expert/assessments")}
            className="w-full py-3 px-6 rounded-xl bg-[#2c6e5f] hover:bg-[#1b4d42] text-white font-extrabold transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg active:scale-95 text-xs"
          >
            Back to Assessments
          </button>
        </div>
      </div>
    );
  }

  const title = editor.title || assessment?.title || "Untitled assessment";
  const visibility = editor.visibility || assessment?.visibility || "private";

  return (
    <div className="min-h-screen bg-[#f9f5e7] py-10 px-6 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Header Block */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-4 border-b border-[#2c6e5f]/10">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1b4d42] tracking-tight">{title}</h1>
          <p className="text-[#2c6e5f]/80 mt-1 font-medium max-w-2xl leading-relaxed text-sm">
            View the assessment details here. Switch to edit mode to update the title, questions,
            visibility, or delete it.
          </p>
          {!isNew && assessment?.createdAt && (
            <p className="mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Created on{" "}
              {new Date(assessment.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex gap-3 items-center shrink-0">
          <button
            type="button"
            onClick={() => setEditing((current) => !current)}
            className={`px-4 py-2.5 text-xs font-extrabold rounded-xl border transition-all duration-200 cursor-pointer inline-flex items-center gap-1.5 ${
              editing
                ? "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 active:scale-95"
                : "bg-[#2c6e5f] text-white border-transparent hover:bg-[#1b4d42] active:scale-95 shadow-md"
            }`}
          >
            {editing ? (
              <>
                <FaEye /> View Mode
              </>
            ) : (
              <>
                <FaEdit /> Edit Mode
              </>
            )}
          </button>

          <button
            type="button"
            onClick={saveAssessment}
            disabled={saving || !editing}
            className="px-4 py-2.5 text-xs font-extrabold rounded-xl bg-[#2c6e5f] text-white hover:bg-[#1b4d42] active:scale-95 disabled:opacity-50 transition-all duration-200 shadow-md inline-flex items-center gap-1.5 cursor-pointer"
          >
            <FaSave /> {isNew ? "Create" : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={deleteAssessment}
            className="px-4 py-2.5 text-xs font-extrabold rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 active:scale-95 transition-all duration-200 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <FaTrash /> Delete
          </button>
        </div>
      </div>

      {/* Main Details Panel */}
      <div className="max-w-6xl mx-auto">
        <section className="glass-card rounded-3xl overflow-hidden p-6 sm:p-8">
          {/* Header Title Section */}
          <div className="pb-6 border-b border-gray-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full">
              <span className="text-4xl animate-float">{editor.icon || "🧠"}</span>
              <div className="flex-grow">
                <p className="text-[10px] font-extrabold text-[#2c6e5f] uppercase tracking-wider">
                  {editing ? "Edit Assessment Details" : "Assessment View"}
                </p>
                {editing ? (
                  <input
                    type="text"
                    value={editor.title}
                    onChange={(e) => setEditor((curr) => ({ ...curr, title: e.target.value }))}
                    placeholder="Assessment Title"
                    className="w-full text-2xl font-bold text-gray-800 border-b border-gray-150 focus:border-[#2c6e5f] outline-none py-1 mt-1 bg-transparent transition-colors"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-gray-800 leading-tight">{title}</h2>
                )}
              </div>
            </div>

            {!editing && (
              <span
                className={`text-[10px] px-2.5 py-1 rounded-full font-extrabold tracking-wider uppercase border shrink-0 ${
                  visibility === "public"
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                    : "bg-amber-50 text-amber-600 border-amber-100"
                }`}
              >
                {visibility === "public" ? "Public" : "Private"}
              </span>
            )}
          </div>

          {/* Notifications */}
          <AnimatePresence>
            {notice && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-6 rounded-xl px-4 py-3.5 text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100/50 shadow-sm"
              >
                {notice}
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-6 rounded-xl px-4 py-3.5 text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-100/50 shadow-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Configuration Grid */}
          <div className="py-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Duration Card */}
              <div className="rounded-2xl bg-gray-50/50 hover:bg-gray-50 p-4 border border-gray-100 transition-all duration-200">
                <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1">
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
                    className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs outline-none focus:border-[#2c6e5f] focus:ring-4 focus:ring-[#2c6e5f]/10 bg-white font-bold text-gray-700 mt-1.5 transition-all"
                  />
                ) : (
                  <div className="mt-1.5 text-base font-bold text-gray-750">
                    {editor.duration || assessment?.duration || 5} mins
                  </div>
                )}
              </div>

              {/* Questions Count Card */}
              <div className="rounded-2xl bg-gray-50/50 hover:bg-gray-50 p-4 border border-gray-100 transition-all duration-200">
                <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1">
                  Questions Count
                </div>
                <div className="mt-1.5 text-base font-bold text-gray-750">
                  {parsedQuestions.length} questions
                </div>
              </div>

              {/* Visibility Setting Card */}
              <div className="rounded-2xl bg-gray-50/50 hover:bg-gray-50 p-4 border border-gray-100 transition-all duration-200">
                <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1">
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
                    className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs outline-none focus:border-[#2c6e5f] focus:ring-4 focus:ring-[#2c6e5f]/10 bg-white font-bold text-gray-700 mt-1.5 transition-all cursor-pointer"
                  >
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                  </select>
                ) : (
                  <div className="mt-1.5 text-base font-bold text-gray-750 capitalize">
                    {visibility}
                  </div>
                )}
              </div>
            </div>

            {/* Description Block */}
            <div>
              <h3 className="text-base font-bold text-gray-800 mb-2">Assessment Description</h3>
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
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#2c6e5f] focus:ring-4 focus:ring-[#2c6e5f]/10 text-gray-700 text-xs leading-relaxed bg-white transition-all"
                />
              ) : (
                <p className="text-gray-500 text-xs leading-relaxed bg-gray-50/30 rounded-xl p-4 border border-gray-100/50">
                  {editor.description || assessment?.description || "No description provided."}
                </p>
              )}
            </div>

            {/* Questions Builder Block */}
            <div>
              <h3 className="text-base font-bold text-gray-800 mb-4">Questions Setup</h3>

              <div className="space-y-4">
                {parsedQuestions.map((question, index) => (
                  <div
                    key={`${question.prompt}-${index}`}
                    className="rounded-2xl border border-gray-150 p-5 bg-white shadow-sm hover:shadow-md transition-all duration-300 relative group"
                  >
                    {editing ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-extrabold text-[#2c6e5f] uppercase tracking-wider">
                            Question {index + 1} Prompt
                          </label>
                          <button
                            type="button"
                            onClick={() => removeQuestion(index)}
                            disabled={editor.questions.length === 1}
                            className="text-[10px] font-bold text-rose-600 hover:text-rose-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Remove Question
                          </button>
                        </div>

                        <input
                          value={editor.questions[index].prompt}
                          onChange={(event) => updateQuestion(index, "prompt", event.target.value)}
                          placeholder="Type your question here..."
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#2c6e5f] focus:ring-4 focus:ring-[#2c6e5f]/10 transition-all duration-200 text-xs font-semibold text-gray-750"
                        />

                        <div className="flex flex-col">
                          <label className="text-[10px] font-extrabold text-[#2c6e5f] uppercase tracking-wider mb-2">
                            Answer Options (one option per line)
                          </label>
                          <textarea
                            rows="4"
                            value={editor.questions[index].optionsText}
                            onChange={(event) =>
                              updateQuestion(index, "optionsText", event.target.value)
                            }
                            placeholder="Never&#10;Rarely&#10;Sometimes&#10;Often&#10;Always"
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#2c6e5f] focus:ring-4 focus:ring-[#2c6e5f]/10 transition-all duration-200 text-xs text-gray-650 leading-relaxed"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <h4 className="font-bold text-gray-800 mb-3 text-sm flex gap-2">
                          <span className="text-[#2c6e5f]">{index + 1}.</span>
                          <span>{question.prompt}</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {question.options.map((option) => (
                            <span
                              key={option}
                              className="px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-gray-600 text-[10px] font-semibold"
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

              {editing && (
                <button
                  type="button"
                  onClick={addQuestion}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold transition-all duration-200 active:scale-95 cursor-pointer text-xs inline-flex items-center gap-1.5"
                >
                  <FaPlus className="w-2.5 h-2.5" /> Add Question
                </button>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Delete Confirmation Modal Overlay */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/55 backdrop-blur-sm"
              onClick={() => setShowDeleteConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl z-50 border border-gray-100 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-4 mx-auto text-xl">
                🗑️
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Assessment?</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Are you sure you want to delete "{editor.title}"? This action cannot be undone.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteAssessment}
                  className="px-4 py-2.5 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg active:scale-95"
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

export default ExpertAssessmentDetailPage;
