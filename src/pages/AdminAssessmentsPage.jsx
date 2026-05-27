import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

const emptyForm = {
  title: "",
  description: "",
  questions: "[]",
};

const AdminAssessmentsPage = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const selectedAssessment = useMemo(
    () =>
      assessments.find(
        (assessment) => assessment.id === selectedAssessmentId,
      ) || null,
    [assessments, selectedAssessmentId],
  );

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate("/admin/login");
      return;
    }
    if (user.role !== "admin") {
      navigate("/");
      return;
    }

    loadAssessments();
  }, [navigate]);

  const loadAssessments = async () => {
    setLoading(true);
    try {
      const data = await authService.adminGetAssessments();
      setAssessments(Array.isArray(data) ? data : []);
    } catch (err) {
      setNotice({
        type: "error",
        message: err.message || "Failed to load assessments",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setSelectedAssessmentId(null);
  };

  const handleSelectAssessment = (assessment) => {
    setSelectedAssessmentId(assessment.id);
    setForm({
      title: assessment.title || "",
      description: assessment.description || "",
      questions: JSON.stringify(assessment.questions || [], null, 2),
    });
    setNotice(null);
  };

  const parseQuestions = () => {
    if (!form.questions.trim()) {
      return null;
    }

    return JSON.parse(form.questions);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice(null);

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        questions: parseQuestions(),
      };

      if (selectedAssessmentId) {
        const updated = await authService.adminUpdateAssessment(
          selectedAssessmentId,
          payload,
        );
        setAssessments((currentAssessments) =>
          currentAssessments.map((assessment) =>
            assessment.id === updated.id ? updated : assessment,
          ),
        );
        setNotice({
          type: "success",
          message: "Assessment updated successfully.",
        });
      } else {
        const created = await authService.adminCreateAssessment(payload);
        setAssessments((currentAssessments) => [
          created,
          ...currentAssessments,
        ]);
        setNotice({
          type: "success",
          message: "Assessment created successfully.",
        });
      }

      resetForm();
    } catch (err) {
      setNotice({
        type: "error",
        message: err.message || "Unable to save assessment",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (assessmentId) => {
    setDeleteConfirm(assessmentId);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await authService.adminDeleteAssessment(deleteConfirm);
      setAssessments((currentAssessments) =>
        currentAssessments.filter(
          (assessment) => assessment.id !== deleteConfirm,
        ),
      );
      if (selectedAssessmentId === deleteConfirm) {
        resetForm();
      }
      setNotice({
        type: "success",
        message: "Assessment deleted successfully.",
      });
    } catch (err) {
      setNotice({ type: "error", message: err.message || "Delete failed" });
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7faf8] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <Link
              to="/admin/dashboard"
              className="text-sm text-[#5bb5a1] hover:underline"
            >
              ← Back to Admin Dashboard
            </Link>
            <h1 className="mt-3 text-2xl font-bold text-slate-800">
              Assessment Management
            </h1>
            <p className="text-sm text-slate-500">
              Create and manage the mental health assessments shown to students.
            </p>
          </div>
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-white"
          >
            New Assessment
          </button>
        </div>

        {notice && (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-sm flex items-start justify-between gap-4 ${
              notice.type === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            <span>{notice.message}</span>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="text-xs font-semibold uppercase tracking-wide opacity-70 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  {selectedAssessment ? "Edit Assessment" : "Create Assessment"}
                </h2>
                <p className="text-sm text-slate-500">
                  Store the title, description, and question set.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Title
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5bb5a1]"
                  placeholder="Stress Level Assessment"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 min-h-24 focus:outline-none focus:ring-2 focus:ring-[#5bb5a1]"
                  placeholder="Brief summary for students"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Questions JSON
                </label>
                <textarea
                  value={form.questions}
                  onChange={(e) =>
                    setForm({ ...form, questions: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 min-h-48 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#5bb5a1]"
                  placeholder='[{"question":"How often...","options":["Never","Rarely"]}]'
                />
                <p className="mt-2 text-xs text-slate-500">
                  Use a JSON array of question objects. Keep the same structure
                  used by the student assessment page.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-[#5bb5a1] text-white font-medium hover:bg-[#4a9d8b] disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : selectedAssessment
                      ? "Update Assessment"
                      : "Create Assessment"}
                </button>
              </div>
            </div>
          </form>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Existing Assessments
                </h2>
                <p className="text-sm text-slate-500">
                  Edit or remove assessments already in the system.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="text-sm text-slate-500">
                Loading assessments...
              </div>
            ) : assessments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">
                No assessments yet. Create the first one using the form.
              </div>
            ) : (
              <div className="space-y-3 max-h-[720px] overflow-y-auto pr-1">
                {assessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className={`rounded-xl border p-4 ${
                      selectedAssessmentId === assessment.id
                        ? "border-[#5bb5a1] bg-teal-50/50"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-800">
                          {assessment.title}
                        </h3>
                        <p className="text-sm text-slate-600 mt-2">
                          {assessment.description}
                        </p>
                        <p className="text-xs text-slate-500 mt-2">
                          Questions:{" "}
                          {Array.isArray(assessment.questions)
                            ? assessment.questions.length
                            : 0}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleSelectAssessment(assessment)}
                          className="px-3 py-1 rounded bg-slate-700 text-white text-sm"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(assessment.id)}
                          className="px-3 py-1 rounded bg-red-600 text-white text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Delete this assessment?
              </h3>
              <p className="text-sm text-gray-600 mb-5">
                This will permanently remove the assessment from the admin list.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAssessmentsPage;
