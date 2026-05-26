import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaEdit,
  FaExternalLinkAlt,
  FaFileAlt,
  FaSpinner,
  FaTrash,
} from "react-icons/fa";
import { authService } from "../services/authService";

const RESOURCE_TYPES = ["GUIDE", "ARTICLE", "AUDIO", "VIDEO"];

const ExpertResourceLibraryPage = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser() || {
    name: "Expert",
    role: "expert",
  };

  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [resourcesError, setResourcesError] = useState("");
  const [message, setMessage] = useState("");
  const [editingResourceId, setEditingResourceId] = useState(null);
  const [editForms, setEditForms] = useState({});
  const [savingResourceId, setSavingResourceId] = useState("");
  const [deletingResourceId, setDeletingResourceId] = useState("");

  const loadMyResources = async () => {
    setLoadingResources(true);
    setResourcesError("");

    try {
      const data = await authService.getMyClinicalResources();
      setResources(data.resources || []);
    } catch (error) {
      setResourcesError(error.message || "Failed to load your resources.");
    } finally {
      setLoadingResources(false);
    }
  };

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/login");
      return;
    }

    if (user.role !== "expert") {
      navigate("/dashboard");
      return;
    }

    loadMyResources();
  }, [navigate, user.role]);

  if (!authService.isAuthenticated() || user.role !== "expert") {
    return null;
  }

  const handleStartEdit = (resource) => {
    setEditingResourceId(resource.id);
    setEditForms((previous) => ({
      ...previous,
      [resource.id]: {
        title: resource.title || "",
        category: resource.category || "",
        summary: resource.summary || "",
        type: resource.type || "GUIDE",
        visibility: resource.visibility || "public",
        document: null,
      },
    }));
  };

  const handleEditChange = (resourceId, event) => {
    const { name, value } = event.target;
    setEditForms((previous) => ({
      ...previous,
      [resourceId]: {
        ...(previous[resourceId] || {}),
        [name]: value,
      },
    }));
  };

  const handleEditFileChange = (resourceId, event) => {
    setEditForms((previous) => ({
      ...previous,
      [resourceId]: {
        ...(previous[resourceId] || {}),
        document: event.target.files?.[0] || null,
      },
    }));
  };

  const handleResourceUpdate = async (resourceId, event) => {
    event.preventDefault();
    const form = editForms[resourceId];

    if (!form?.title?.trim()) {
      setResourcesError("Resource title is required for updates.");
      return;
    }

    setResourcesError("");
    setMessage("");
    setSavingResourceId(resourceId);

    try {
      await authService.updateClinicalResource(resourceId, {
        title: form.title,
        category: form.category,
        summary: form.summary,
        type: form.type,
        visibility: form.visibility,
        document: form.document,
      });

      setMessage("Resource updated successfully.");
      setEditingResourceId(null);
      setEditForms((previous) => {
        const next = { ...previous };
        delete next[resourceId];
        return next;
      });
      await loadMyResources();
    } catch (error) {
      setResourcesError(error.message || "Failed to update resource.");
    } finally {
      setSavingResourceId("");
    }
  };

  const handleResourceDelete = async (resourceId) => {
    const confirmed = window.confirm(
      "Delete this resource? This cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    setResourcesError("");
    setMessage("");
    setDeletingResourceId(resourceId);

    try {
      await authService.deleteClinicalResource(resourceId);
      setMessage("Resource deleted successfully.");
      if (editingResourceId === resourceId) {
        setEditingResourceId(null);
      }
      await loadMyResources();
    } catch (error) {
      setResourcesError(error.message || "Failed to delete resource.");
    } finally {
      setDeletingResourceId("");
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f5e7]">
      <div className="gradient-teal py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">
              <Link
                to="/expert/upload-resources"
                className="hover:text-gray-800 transition-colors flex items-center gap-1.5"
              >
                <FaArrowLeft size={12} /> Resource Hub
              </Link>
              <span>/</span>
              <span>Manage Resources</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FaFileAlt className="text-[#5bb5a1]" /> Uploaded Resources
            </h1>
            <p className="text-gray-600">
              Review the resources you uploaded and make changes when needed.
            </p>
          </div>
          <Link
            to="/expert/upload-resources"
            className="px-4 py-2 bg-white text-gray-700 rounded-lg flex items-center space-x-2 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all font-medium text-sm"
          >
            <FaArrowLeft />
            <span>Back to Hub</span>
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-8 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Your Uploaded Resources
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Update or delete the items you uploaded.
              </p>
            </div>
            <button
              type="button"
              onClick={loadMyResources}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <FaSpinner className={loadingResources ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {resourcesError && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {resourcesError}
            </div>
          )}

          {message && (
            <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </div>
          )}

          {loadingResources ? (
            <div className="py-12 text-center text-gray-500">
              Loading your resources...
            </div>
          ) : resources.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              No uploaded resources yet.
            </div>
          ) : (
            <div className="space-y-4">
              {resources.map((resource) => {
                const editForm = editForms[resource.id] || {};
                const isEditing = editingResourceId === resource.id;
                const isSaving = savingResourceId === resource.id;
                const isDeleting = deletingResourceId === resource.id;

                return (
                  <div
                    key={resource.id}
                    className="rounded-2xl border border-gray-100 bg-[#fcfcfb] p-5"
                  >
                    {!isEditing ? (
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-800">
                              {resource.title}
                            </h3>
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-teal-50 text-[#5bb5a1]">
                              {resource.type || "GUIDE"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {resource.category || "Uncategorized"}
                          </p>
                          <p className="text-sm text-gray-500 max-w-3xl">
                            {resource.summary || "No summary provided."}
                          </p>
                          {resource.contentUrl && (
                            <a
                              href={`http://localhost:5000${resource.contentUrl}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 text-sm font-medium text-[#5bb5a1] hover:text-[#4a9d8b]"
                            >
                              <FaExternalLinkAlt size={12} /> View uploaded file
                            </a>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 lg:justify-end">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(resource)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-50 text-[#5bb5a1] font-medium hover:bg-teal-100 transition-colors"
                          >
                            <FaEdit /> Update
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResourceDelete(resource.id)}
                            disabled={isDeleting}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            <FaTrash /> {isDeleting ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <form
                        onSubmit={(event) =>
                          handleResourceUpdate(resource.id, event)
                        }
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Resource Title
                            </label>
                            <input
                              type="text"
                              name="title"
                              value={editForm.title || ""}
                              onChange={(event) =>
                                handleEditChange(resource.id, event)
                              }
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Category
                            </label>
                            <input
                              type="text"
                              name="category"
                              value={editForm.category || ""}
                              onChange={(event) =>
                                handleEditChange(resource.id, event)
                              }
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Summary
                          </label>
                          <textarea
                            name="summary"
                            value={editForm.summary || ""}
                            onChange={(event) =>
                              handleEditChange(resource.id, event)
                            }
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Document Type
                            </label>
                            <select
                              name="type"
                              value={editForm.type || "GUIDE"}
                              onChange={(event) =>
                                handleEditChange(resource.id, event)
                              }
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-white"
                            >
                              {RESOURCE_TYPES.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Replace Document (optional)
                            </label>
                            <input
                              type="file"
                              accept=".txt,.pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                              onChange={(event) =>
                                handleEditFileChange(resource.id, event)
                              }
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-[#5bb5a1] hover:file:bg-teal-100"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <FaFileAlt className="text-[#5bb5a1]" />
                            Current file stays unchanged unless you upload a new
                            one.
                          </div>
                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            <button
                              type="button"
                              onClick={() => setEditingResourceId(null)}
                              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={isSaving}
                              className="inline-flex items-center justify-center px-5 py-2 rounded-xl bg-[#5bb5a1] text-white font-medium hover:bg-[#4a9d8b] transition-colors disabled:opacity-50"
                            >
                              {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                          </div>
                        </div>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpertResourceLibraryPage;
