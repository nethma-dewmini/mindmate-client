import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaBook } from "react-icons/fa";
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
      setResourceError("Please attach a document to upload.");
      return;
    }

    setSavingResource(true);

    try {
      await authService.addClinicalResource({
        title: resourceForm.title,
        category: resourceForm.category,
        summary: resourceForm.summary,
        type: resourceForm.type,
        document: resourceFile,
      });

      setResourceMessage("Resource uploaded successfully.");
      setResourceForm({
        title: "",
        category: "",
        summary: "",
        type: "GUIDE",
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
    <div className="min-h-screen bg-[#f9f5e7]">
      <div className="gradient-teal py-8 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">
              <Link
                to="/expert/upload-resources"
                className="hover:text-gray-800 transition-colors flex items-center gap-1.5"
              >
                <FaArrowLeft size={12} /> Resource Hub
              </Link>
              <span>/</span>
              <span>Upload Resource</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FaBook className="text-[#5bb5a1]" /> Upload Resource
            </h1>
            <p className="text-gray-600">
              Add a new document, guide, article, audio, or video resource.
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

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-8 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Resource Information
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Fill in the details below to upload a resource.
              </p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-50 text-[#5bb5a1] self-start md:self-center">
              Public Resource
            </span>
          </div>

          {resourceError && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {resourceError}
            </div>
          )}

          {resourceMessage && (
            <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {resourceMessage}
            </div>
          )}

          <form onSubmit={handleResourceSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Resource Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={resourceForm.title}
                  onChange={handleResourceChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="e.g. Coping with Exam Stress"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={resourceForm.category}
                  onChange={handleResourceChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="e.g. Stress Management"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Summary
              </label>
              <textarea
                name="summary"
                value={resourceForm.summary}
                onChange={handleResourceChange}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder="A short description for students to know what this resource is about."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Document Type
                </label>
                <select
                  name="type"
                  value={resourceForm.type}
                  onChange={handleResourceChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="GUIDE">Guide</option>
                  <option value="ARTICLE">Article</option>
                  <option value="AUDIO">Audio</option>
                  <option value="VIDEO">Video</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Document <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept=".txt,.pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                  onChange={handleResourceFileChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-[#5bb5a1] hover:file:bg-teal-100"
                  required
                />
                <p className="mt-2 text-xs text-gray-500">
                  TXT, PDF, DOC, DOCX, PNG, JPG, JPEG, and WEBP files are
                  supported.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-sm text-gray-500 max-w-md">
                The document will be stored securely and made available in the
                student resource library.
              </p>
              <div className="flex items-center gap-3 self-end sm:self-auto">
                <Link
                  to="/expert/upload-resources"
                  className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={savingResource}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#5bb5a1] text-white font-medium hover:bg-[#4a9d8b] transition-colors disabled:opacity-50 shadow-sm hover:shadow"
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
