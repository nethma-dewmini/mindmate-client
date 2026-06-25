import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaBook } from "react-icons/fa";
import { authService } from "../services/authService";

const ExpertResourceUploadPage = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser() || {
    name: "Expert",
    role: "expert",
  };

  const [resourceForm, setResourceForm] = useState({
    title: "",
    category: "",
    summary: "",
    type: "GUIDE",
    videoUrl: "",
    audioUrl: "",
  });
  const [resourceFile, setResourceFile] = useState(null);
  const [savingResource, setSavingResource] = useState(false);
  const [resourceMessage, setResourceMessage] = useState("");
  const [resourceError, setResourceError] = useState("");

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/login");
    } else if (user.role !== "expert") {
      navigate("/dashboard");
    }
  }, [navigate, user.role]);

  if (!authService.isAuthenticated() || user.role !== "expert") {
    return null;
  }

  const handleResourceChange = (event) => {
    const { name, value } = event.target;
    setResourceForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleResourceFileChange = (event) => {
    setResourceFile(event.target.files?.[0] || null);
  };

  const handleResourceSubmit = async (event) => {
    event.preventDefault();
    setResourceError("");
    setResourceMessage("");

    if (!resourceForm.title.trim()) {
      setResourceError("Resource title is required.");
      return;
    }

    if (!resourceFile) {
      if (
        (resourceForm.type === "VIDEO" && resourceForm.videoUrl.trim()) ||
        (resourceForm.type === "AUDIO" && resourceForm.audioUrl.trim())
      ) {
        // allow URL instead of a file for video/audio
      } else {
        setResourceError(
          "Please attach a document to upload or provide a video/audio URL for media resources."
        );
        return;
      }
    }

    setSavingResource(true);

    try {
      await authService.addClinicalResource({
        title: resourceForm.title,
        category: resourceForm.category,
        summary: resourceForm.summary,
        type: resourceForm.type,
        document: resourceFile,
        videoUrl: resourceForm.videoUrl?.trim() || undefined,
        audioUrl: resourceForm.audioUrl?.trim() || undefined,
      });

      setResourceMessage("Resource uploaded successfully.");
      setResourceForm({
        title: "",
        category: "",
        summary: "",
        type: "GUIDE",
        videoUrl: "",
        audioUrl: "",
      });
      setResourceFile(null);
      event.target.reset();
    } catch (error) {
      setResourceError(error.message || "Failed to upload resource.");
    } finally {
      setSavingResource(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f5e7] py-10 px-6 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Page Header */}
      <div className="max-w-4xl mx-auto mb-8 pb-4 border-b border-[#2c6e5f]/10">
        <h1 className="text-3xl font-extrabold text-[#1b4d42] tracking-tight flex items-center gap-2">
          <FaBook className="text-[#2c6e5f] shrink-0 animate-float" /> Upload Resource
        </h1>
        <p className="text-[#2c6e5f]/80 mt-1 font-medium max-w-2xl leading-relaxed text-sm md:text-base">
          Add a new document, guide, article, audio, or video resource.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="glass-card bg-white rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-8 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Resource Information</h2>
              <p className="text-xs text-gray-400 mt-1 font-semibold">
                Fill in the details below to upload a resource.
              </p>
            </div>

            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-teal-50 border border-teal-100 text-[#2c6e5f] self-start md:self-center">
              Public Resource
            </span>
          </div>

          <AnimatePresence>
            {resourceError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-xs font-semibold text-red-700"
              >
                {resourceError}
              </motion.div>
            )}

            {resourceMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-xs font-semibold text-emerald-700"
              >
                {resourceMessage}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleResourceSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Resource Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={resourceForm.title}
                  onChange={handleResourceChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#2c6e5f] focus:ring-4 focus:ring-[#2c6e5f]/10 focus:outline-none bg-white font-medium text-gray-700 transition-all duration-300 placeholder-gray-400 text-xs"
                  placeholder="e.g. Coping with Exam Stress"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={resourceForm.category}
                  onChange={handleResourceChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#2c6e5f] focus:ring-4 focus:ring-[#2c6e5f]/10 focus:outline-none bg-white font-medium text-gray-700 transition-all duration-300 placeholder-gray-400 text-xs"
                  placeholder="e.g. Stress Management"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Summary
              </label>
              <textarea
                name="summary"
                value={resourceForm.summary}
                onChange={handleResourceChange}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#2c6e5f] focus:ring-4 focus:ring-[#2c6e5f]/10 focus:outline-none bg-white font-medium text-gray-700 transition-all duration-300 placeholder-gray-400 text-xs resize-none leading-relaxed"
                placeholder="A short description for students to know what this resource is about."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Document Type
                </label>
                <select
                  name="type"
                  value={resourceForm.type}
                  onChange={handleResourceChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#2c6e5f] focus:ring-4 focus:ring-[#2c6e5f]/10 focus:outline-none bg-white font-bold text-gray-700 transition-all duration-300 text-xs cursor-pointer"
                >
                  <option value="GUIDE">Guide</option>
                  <option value="ARTICLE">Article</option>
                  <option value="AUDIO">Audio</option>
                  <option value="VIDEO">Video</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Upload Document <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept={
                    resourceForm.type === "VIDEO"
                      ? ".mp4,.webm,.mov,.mkv,video/*"
                      : resourceForm.type === "AUDIO"
                        ? ".mp3,.wav,.ogg,.webm,audio/*"
                        : ".txt,.pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                  }
                  onChange={handleResourceFileChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-[#2c6e5f] focus:ring-4 focus:ring-[#2c6e5f]/10 focus:outline-none transition-all text-xs file:mr-4 file:py-1.5 file:px-3.5 file:rounded-xl file:border-0 file:text-[10px] file:font-extrabold file:bg-teal-50 file:text-[#2c6e5f] hover:file:bg-teal-100/70 file:cursor-pointer"
                />

                {resourceForm.type === "VIDEO" && (
                  <div className="mt-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                      Video URL (optional)
                    </label>
                    <input
                      type="url"
                      name="videoUrl"
                      value={resourceForm.videoUrl}
                      onChange={handleResourceChange}
                      placeholder="https://youtube.com/watch?v=... or direct mp4 URL"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#2c6e5f] focus:ring-4 focus:ring-[#2c6e5f]/10 focus:outline-none bg-white font-medium text-gray-700 transition-all duration-300 placeholder-gray-400 text-xs"
                    />
                    <p className="mt-2 text-[10px] text-gray-400 font-medium">
                      Provide a video URL if you prefer linking to an external video instead of
                      uploading a file.
                    </p>
                  </div>
                )}

                {resourceForm.type === "AUDIO" && (
                  <div className="mt-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                      Audio URL (optional)
                    </label>
                    <input
                      type="url"
                      name="audioUrl"
                      value={resourceForm.audioUrl}
                      onChange={handleResourceChange}
                      placeholder="https://example.com/audio.mp3 or soundcloud/spotify link"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#2c6e5f] focus:ring-4 focus:ring-[#2c6e5f]/10 focus:outline-none bg-white font-medium text-gray-700 transition-all duration-300 placeholder-gray-400 text-xs"
                    />
                    <p className="mt-2 text-[10px] text-gray-400 font-medium">
                      Provide an audio URL if you prefer linking instead of uploading a file.
                    </p>
                  </div>
                )}

                <p className="mt-2 text-[10px] text-gray-400 font-medium leading-relaxed">
                  TXT, PDF, DOC, DOCX, PNG, JPG, JPEG, WEBP files, video files (MP4/WEBM/MOV), and
                  audio files (MP3/WAV/OGG) are supported.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs text-gray-400 max-w-sm leading-relaxed font-semibold">
                The document will be stored securely and made available in the student resource
                library.
              </p>

              <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                <Link
                  to="/expert/dashboard"
                  className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 active:scale-95 cursor-pointer text-xs"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={savingResource}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#2c6e5f] hover:bg-[#1b4d42] text-white font-extrabold transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg disabled:opacity-50 text-xs cursor-pointer"
                >
                  {savingResource ? "Uploading..." : "Upload Resource"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExpertResourceUploadPage;
