import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaEdit,
  FaExternalLinkAlt,
  FaFileAlt,
  FaSpinner,
  FaTrash,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { authService } from "../services/authService";

const RESOURCE_TYPES = ["GUIDE", "ARTICLE", "AUDIO", "VIDEO"];

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
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
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
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

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

  const handleResourceDelete = (resourceId) => {
    setDeleteConfirmId(resourceId);
  };

  const confirmDeleteResource = async () => {
    if (!deleteConfirmId) return;

    setResourcesError("");
    setMessage("");
    setDeletingResourceId(deleteConfirmId);

    try {
      await authService.deleteClinicalResource(deleteConfirmId);
      setMessage("Resource deleted successfully.");
      if (editingResourceId === deleteConfirmId) {
        setEditingResourceId(null);
      }
      await loadMyResources();
    } catch (error) {
      setResourcesError(error.message || "Failed to delete resource.");
    } finally {
      setDeletingResourceId("");
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f5e7] py-10 px-6 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Page Header */}
      <div className="max-w-6xl mx-auto mb-8 pb-4 border-b border-[#2c6e5f]/10">
        <h1 className="text-3xl font-extrabold text-[#1b4d42] tracking-tight flex items-center gap-2">
          <FaFileAlt className="text-[#2c6e5f] shrink-0 animate-float" /> Uploaded Resources
        </h1>
        <p className="text-[#2c6e5f]/80 mt-1 font-medium max-w-2xl leading-relaxed text-sm md:text-base">
          Review the resources you uploaded and make changes when needed.
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="glass-card rounded-3xl p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-bold text-gray-805">Your Uploaded Resources</h2>
              <p className="text-xs text-gray-400 mt-1 font-semibold">
                Update or delete the items you uploaded.
              </p>
            </div>

            <button
              type="button"
              onClick={loadMyResources}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-extrabold text-gray-650 hover:bg-gray-50 active:scale-95 transition-all shadow-sm shrink-0 cursor-pointer"
            >
              <FaSpinner
                className={loadingResources ? "animate-spin text-[#2c6e5f]" : "text-gray-400"}
              />
              Refresh
            </button>
          </div>

          <AnimatePresence>
            {resourcesError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-xs font-semibold text-red-700 shadow-sm"
              >
                {resourcesError}
              </motion.div>
            )}

            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-xs font-semibold text-emerald-700 shadow-sm"
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          {loadingResources ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-[#2c6e5f] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm font-semibold text-gray-500 animate-pulse">
                Loading your resources...
              </p>
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-gray-200 rounded-3xl bg-gray-50/20 shadow-sm flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-[#2c6e5f]/5 flex items-center justify-center text-xl mb-4 text-[#2c6e5f]">
                📂
              </div>
              <h3 className="text-sm font-bold text-gray-850 mb-1">No uploaded resources yet</h3>
              <p className="text-xs text-gray-450">
                You haven't uploaded any resources yet. Switch to the upload form to add one.
              </p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-6"
            >
              <AnimatePresence mode="popLayout">
                {resources.map((resource) => {
                  const editForm = editForms[resource.id] || {};
                  const isEditing = editingResourceId === resource.id;
                  const isSaving = savingResourceId === resource.id;
                  const isDeleting = deletingResourceId === resource.id;

                  return (
                    <motion.div
                      layout
                      variants={cardVariants}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      whileHover={{ y: -4 }}
                      key={resource.id}
                      className="rounded-2xl border border-gray-150 p-5 bg-white shadow-sm hover:shadow-md hover:border-[#2c6e5f]/20 transition-all duration-300 relative group"
                    >
                      {!isEditing ? (
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-bold text-gray-800 transition-colors group-hover:text-[#2c6e5f]">
                                {resource.title}
                              </h3>
                              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-teal-50 border border-teal-100 text-[#2c6e5f]">
                                {resource.type || "GUIDE"}
                              </span>
                            </div>

                            <p className="text-xs font-semibold text-gray-400 capitalize">
                              Category: {resource.category || "Uncategorized"}
                            </p>

                            <p className="text-xs text-gray-500 max-w-3xl leading-relaxed">
                              {resource.summary || "No summary provided."}
                            </p>

                            {resource.contentUrl && (
                              <a
                                href={
                                  resource.contentUrl.startsWith("http")
                                    ? resource.contentUrl
                                    : `http://localhost:5000${resource.contentUrl}`
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2c6e5f] hover:text-[#1b4d42] transition-colors group/link cursor-pointer mt-1"
                              >
                                <FaExternalLinkAlt className="text-[10px]" />
                                <span>View uploaded file</span>
                              </a>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2 lg:justify-end shrink-0">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(resource)}
                              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-teal-50 text-[#2c6e5f] font-bold text-xs hover:bg-teal-100/70 transition-all cursor-pointer active:scale-95"
                            >
                              <FaEdit /> Update
                            </button>

                            <button
                              type="button"
                              onClick={async () => {
                                const newVis =
                                  resource.visibility === "public" ? "private" : "public";
                                setResourcesError("");
                                setMessage("");
                                setSavingResourceId(resource.id);
                                try {
                                  await authService.updateClinicalResource(resource.id, {
                                    title: resource.title,
                                    category: resource.category,
                                    summary: resource.summary,
                                    type: resource.type,
                                    visibility: newVis,
                                  });
                                  setMessage(
                                    newVis === "public" ? "Resource published." : "Resource hidden."
                                  );
                                  await loadMyResources();
                                } catch (err) {
                                  setResourcesError(err.message || "Failed to change visibility.");
                                } finally {
                                  setSavingResourceId("");
                                }
                              }}
                              disabled={savingResourceId === resource.id}
                              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white text-gray-705 border border-gray-200 font-bold text-xs hover:bg-gray-50 transition-all cursor-pointer active:scale-95"
                            >
                              {resource.visibility === "public" ? "Hide" : "Publish"}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleResourceDelete(resource.id)}
                              disabled={isDeleting}
                              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-rose-50 text-rose-600 font-bold text-xs hover:bg-rose-100/70 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                            >
                              <FaTrash /> {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <form
                          onSubmit={(event) => handleResourceUpdate(resource.id, event)}
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                Resource Title
                              </label>
                              <input
                                type="text"
                                name="title"
                                value={editForm.title || ""}
                                onChange={(event) => handleEditChange(resource.id, event)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#2c6e5f] focus:ring-4 focus:ring-[#2c6e5f]/10 focus:outline-none bg-white font-medium text-gray-750 transition-all duration-300 placeholder-gray-405 text-xs"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                Category
                              </label>
                              <input
                                type="text"
                                name="category"
                                value={editForm.category || ""}
                                onChange={(event) => handleEditChange(resource.id, event)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#2c6e5f] focus:ring-4 focus:ring-[#2c6e5f]/10 focus:outline-none bg-white font-medium text-gray-750 transition-all duration-300 placeholder-gray-405 text-xs"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                              Summary
                            </label>
                            <textarea
                              name="summary"
                              value={editForm.summary || ""}
                              onChange={(event) => handleEditChange(resource.id, event)}
                              rows={3}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#2c6e5f] focus:ring-4 focus:ring-[#2c6e5f]/10 focus:outline-none bg-white font-medium text-gray-750 transition-all duration-300 placeholder-gray-405 text-xs resize-none leading-relaxed"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                Document Type
                              </label>
                              <select
                                name="type"
                                value={editForm.type || "GUIDE"}
                                onChange={(event) => handleEditChange(resource.id, event)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#2c6e5f] focus:ring-4 focus:ring-[#2c6e5f]/10 focus:outline-none bg-white font-bold text-gray-700 transition-all duration-300 text-xs cursor-pointer"
                              >
                                {RESOURCE_TYPES.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                Replace Document (optional)
                              </label>
                              <input
                                type="file"
                                accept=".txt,.pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                                onChange={(event) => handleEditFileChange(resource.id, event)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-[#2c6e5f] focus:ring-4 focus:ring-[#2c6e5f]/10 focus:outline-none transition-all text-xs file:mr-4 file:py-1.5 file:px-3.5 file:rounded-xl file:border-0 file:text-[10px] file:font-extrabold file:bg-teal-50 file:text-[#2c6e5f] hover:file:bg-teal-100/70 file:cursor-pointer"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-50">
                            <div className="flex items-center gap-2 text-xs text-gray-400 font-semibold">
                              <FaFileAlt className="text-[#2c6e5f]" />
                              Current file stays unchanged unless you upload a new one.
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                              <button
                                type="button"
                                onClick={() => setEditingResourceId(null)}
                                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all cursor-pointer active:scale-95 text-xs"
                              >
                                Cancel
                              </button>

                              <button
                                type="submit"
                                disabled={isSaving}
                                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#2c6e5f] text-white font-extrabold hover:bg-[#1b4d42] transition-all cursor-pointer active:scale-95 text-xs shadow-sm disabled:opacity-50"
                              >
                                {isSaving ? "Saving..." : "Save Changes"}
                              </button>
                            </div>
                          </div>
                        </form>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal Overlay */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/55 backdrop-blur-sm"
              onClick={() => setDeleteConfirmId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl z-50 border border-gray-100 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-4 mx-auto text-xl animate-pulse">
                🗑️
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Resource?</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Are you sure you want to delete this resource? This action cannot be undone.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteResource}
                  disabled={deletingResourceId !== ""}
                  className="px-4 py-2.5 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {deletingResourceId !== "" ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExpertResourceLibraryPage;
