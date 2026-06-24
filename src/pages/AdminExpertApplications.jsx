import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import {
  FaSearch,
  FaUserMd,
  FaFileAlt,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaExclamationTriangle,
  FaClock,
  FaEnvelope,
  FaNotesMedical,
  FaDownload,
  FaUserCircle,
  FaUndo,
  FaGraduationCap
} from "react-icons/fa";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const STATUS_LABELS = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700 border-amber-200/60",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  rejected: "bg-rose-50 text-rose-700 border-rose-200/60",
};

const AdminExpertApplications = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const [statusFilter, setStatusFilter] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [applications, setApplications] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedLoading, setSelectedLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [summary, setSummary] = useState({ pending: 0, approved: 0, rejected: 0 });

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: "", // 'approved' or 'rejected'
    application: null,
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "admin") {
      navigate("/");
      return;
    }

    loadApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, refreshKey]);

  async function loadApplications() {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      const res = await fetch(
        `${API_BASE_URL}/expert-applications${params.toString() ? `?${params.toString()}` : ""}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...authService.getAuthHeaders(),
          },
        },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to load applications");

      setApplications(data.applications || []);
      setCount(data.count || 0);
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (err) {
      setError(err.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  }

  async function loadApplicationDetails(id) {
    setSelectedLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/expert-applications/${id}`, {
        headers: {
          "Content-Type": "application/json",
          ...authService.getAuthHeaders(),
        },
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to load application");

      setSelectedApplication(data.application);
      setReviewNotes(data.application?.admin_notes || "");
    } catch (err) {
      setError(err.message || "Failed to load application");
    } finally {
      setSelectedLoading(false);
    }
  }

  async function handleReview(id, nextStatus) {
    setActionLoading(true);
    setError("");
    setConfirmModal({ isOpen: false, type: "", application: null });

    try {
      const res = await fetch(`${API_BASE_URL}/expert-applications/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...authService.getAuthHeaders(),
        },
        body: JSON.stringify({ status: nextStatus, admin_notes: reviewNotes }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to update application");

      setSelectedApplication(data.application);
      setRefreshKey((value) => value + 1);
    } catch (err) {
      setError(err.message || "Failed to update application");
    } finally {
      setActionLoading(false);
    }
  }

  // Client-side search filtering
  const filteredApplications = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return applications;
    return applications.filter(
      (app) =>
        app.name.toLowerCase().includes(query) ||
        app.email.toLowerCase().includes(query) ||
        (app.specialization && app.specialization.toLowerCase().includes(query))
    );
  }, [applications, searchQuery]);

  const openConfirmation = (type, application) => {
    setConfirmModal({
      isOpen: true,
      type,
      application,
    });
  };

  const getInitials = (name) => {
    return name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "EX";
  };

  const getFileSizeString = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="bg-[#fcfdfc] min-h-[750px] p-1.5 md:p-6 rounded-3xl border border-teal-50 shadow-xl shadow-teal-900/5 transition-all">
      {/* Header section with Stats */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-8 p-4 bg-gradient-to-r from-teal-50/60 to-transparent rounded-2xl border border-teal-100/30">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#2c6e5f]/10 text-[#2c6e5f] uppercase tracking-wider">
            Admin Portal
          </span>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mt-2.5">
            Expert Applications
          </h2>
          <p className="text-slate-500 mt-1.5 text-sm md:text-base">
            Review professional credentials, certifications, and approve registrations for experts.
          </p>
        </div>

        {/* Dynamic Soft Stats Cards */}
        <div className="flex gap-3 text-xs md:text-sm flex-wrap">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-amber-50/80 border border-amber-200/50 shadow-sm shadow-amber-500/5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-semibold text-slate-700">Pending:</span>
            <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-lg">
              {summary.pending}
            </span>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/50 shadow-sm shadow-emerald-500/5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-700">Approved:</span>
            <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-lg">
              {summary.approved}
            </span>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-rose-50/80 border border-rose-200/50 shadow-sm shadow-rose-500/5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="font-semibold text-slate-700">Rejected:</span>
            <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-lg">
              {summary.rejected}
            </span>
          </div>
        </div>
      </div>

      {/* Toolbar: Tabs & Search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6 p-1">
        {/* Animated Tabs */}
        <div className="flex bg-slate-100/80 p-1.5 rounded-2xl gap-1 border border-slate-200/50 self-start md:self-auto w-full md:w-auto overflow-auto">
          {[
            { id: "pending", label: "Pending", count: summary.pending },
            { id: "approved", label: "Approved", count: summary.approved },
            { id: "rejected", label: "Rejected", count: summary.rejected },
            { id: "all", label: "All", count: summary.pending + summary.approved + summary.rejected },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setSelectedApplication(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-all duration-300 cursor-pointer whitespace-nowrap ${
                statusFilter === tab.id
                  ? "bg-white text-[#2c6e5f] shadow-sm font-semibold scale-102"
                  : "text-slate-600 hover:text-[#2c6e5f] hover:bg-slate-200/50"
              }`}
            >
              {tab.label}
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold transition-all duration-300 ${
                  statusFilter === tab.id
                    ? "bg-teal-50 text-[#2c6e5f]"
                    : "bg-slate-200/80 text-slate-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search bar & count */}
        <div className="flex items-center gap-3 w-full md:w-80">
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              <FaSearch className="text-xs" />
            </span>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200/80 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#5bb5a1]/60 focus:border-[#5bb5a1]/80 transition-all bg-white"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <FaExclamationTriangle className="flex-shrink-0 text-lg" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: Applications List */}
        <div className="lg:col-span-5 flex flex-col border border-slate-100 rounded-3xl bg-white/70 overflow-hidden shadow-sm">
          <div className="bg-slate-50/50 px-5 py-4 border-b border-slate-100 flex justify-between items-center">
            <span className="text-xs md:text-sm font-semibold text-slate-700">Application List</span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {filteredApplications.length} listed
            </span>
          </div>

          <div className="max-h-[550px] overflow-y-auto divide-y divide-slate-100/60 p-2 space-y-1">
            {loading ? (
              /* Skeletal loaders for List */
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 bg-white rounded-2xl border border-transparent flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                  </div>
                  <div className="w-16 h-6 bg-slate-200 rounded-full" />
                </div>
              ))
            ) : filteredApplications.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center justify-center text-slate-400 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                  <FaUserMd className="text-xl" />
                </div>
                <p className="text-sm">No applications found in this filter.</p>
              </div>
            ) : (
              filteredApplications.map((application) => {
                const isSelected = selectedApplication?.id === application.id;
                return (
                  <button
                    key={application.id}
                    onClick={() => loadApplicationDetails(application.id)}
                    className={`w-full text-left p-4 rounded-2xl flex items-center gap-4 transition-all duration-300 border cursor-pointer hover:shadow-md hover:shadow-teal-900/5 ${
                      isSelected
                        ? "bg-[#f0f7f5] border-[#5bb5a1]/40 shadow-sm"
                        : "bg-white border-transparent hover:bg-slate-50/50"
                    }`}
                  >
                    {/* Circle Avatar with Initials */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                      isSelected ? "bg-[#2c6e5f] text-white" : "bg-teal-50 text-[#2c6e5f]"
                    }`}>
                      {getInitials(application.name)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-semibold text-slate-800 text-sm md:text-base truncate">
                          {application.title ? `${application.title} ` : ""}
                          {application.name}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {application.email}
                      </p>
                      
                      <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400">
                        <FaClock className="text-[9px]" />
                        <span>
                          {application.created_at
                            ? new Date(application.created_at).toLocaleDateString()
                            : "-"}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border ${
                      STATUS_STYLES[application.status] || "bg-slate-100 text-slate-600 border-slate-200"
                    }`}>
                      {STATUS_LABELS[application.status] || application.status}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed View */}
        <div className="lg:col-span-7 border border-slate-100 rounded-3xl bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="bg-slate-50/50 px-5 py-4 border-b border-slate-100 text-xs md:text-sm font-semibold text-slate-700">
            Application Details
          </div>

          <div className="p-6 flex-1 flex flex-col justify-center">
            {!selectedApplication ? (
              /* No selection state */
              <div className="text-center p-12 flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center text-[#2c6e5f] animate-bounce">
                  <FaUserCircle className="text-3xl" />
                </div>
                <h3 className="font-bold text-slate-700 text-lg">Select an Application</h3>
                <p className="text-slate-400 max-w-sm text-sm">
                  Click on an expert from the list to view their verification documents, qualifications, and make an approval decision.
                </p>
              </div>
            ) : selectedLoading ? (
              /* Pulse Loader for Detail Column */
              <div className="space-y-5 animate-pulse flex-1">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-slate-200 rounded w-1/3" />
                    <div className="h-4 bg-slate-200 rounded w-1/4" />
                  </div>
                </div>
                <div className="space-y-3 pt-4 border-t">
                  <div className="h-3 bg-slate-200 rounded w-full" />
                  <div className="h-3 bg-slate-200 rounded w-5/6" />
                  <div className="h-3 bg-slate-200 rounded w-2/3" />
                </div>
              </div>
            ) : (
              /* Loaded Application detail view */
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-teal-100 text-[#2c6e5f] flex items-center justify-center font-bold text-lg shrink-0">
                      {getInitials(selectedApplication.name)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">
                        {selectedApplication.title ? `${selectedApplication.title} ` : ""}
                        {selectedApplication.name}
                      </h3>
                      <p className="text-sm text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <FaEnvelope className="text-xs" />
                        {selectedApplication.email}
                      </p>
                    </div>
                  </div>

                  <span className={`self-start text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider border ${
                    STATUS_STYLES[selectedApplication.status] || "bg-slate-100 text-slate-600 border-slate-200"
                  }`}>
                    {STATUS_LABELS[selectedApplication.status] || selectedApplication.status}
                  </span>
                </div>

                {/* Grid Info fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Specialization</span>
                    <span className="font-semibold text-slate-700 text-sm mt-1 block">
                      {selectedApplication.specialization || "General Counseling"}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Submission Date</span>
                    <span className="font-semibold text-slate-700 text-sm mt-1 block">
                      {selectedApplication.created_at
                        ? new Date(selectedApplication.created_at).toLocaleString()
                        : "-"}
                    </span>
                  </div>
                </div>

                {/* Documents / Uploads Grid */}
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                    Verification Documents
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(selectedApplication.documents || []).length === 0 ? (
                      <p className="text-sm text-slate-400 italic">No documents attached.</p>
                    ) : (
                      (selectedApplication.documents || []).map((doc, idx) => (
                        <a
                          key={idx}
                          href={`${API_BASE_URL.replace(/\/api$/, "")}/api/uploads/${doc.relativePath}`}
                          target="_blank"
                          rel="noreferrer"
                          className="group p-3 rounded-2xl border border-slate-150 hover:border-[#5bb5a1]/40 bg-white hover:bg-teal-50/10 flex items-center justify-between transition-all duration-300"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#5bb5a1] flex items-center justify-center shrink-0">
                              <FaFileAlt className="text-sm" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-700 truncate max-w-[130px]">
                                {doc.name || `Document_${idx + 1}`}
                              </p>
                              <p className="text-[9px] text-slate-400">
                                {getFileSizeString(doc.size) || "File Attachment"}
                              </p>
                            </div>
                          </div>
                          <FaDownload className="text-slate-400 group-hover:text-[#5bb5a1] text-xs transition-colors shrink-0" />
                        </a>
                      ))
                    )}
                  </div>
                </div>

                {/* Review Notes Area */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FaNotesMedical className="text-xs" />
                    Review Decision Notes
                  </label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#5bb5a1]/40 focus:border-[#5bb5a1] transition-all"
                    placeholder="Enter approval details, license validation remarks, or rejection reasoning..."
                  />
                </div>

                {/* Actions Panel */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-3 items-center justify-between">
                  <div className="flex gap-3">
                    {/* Approve Button */}
                    <button
                      onClick={() => openConfirmation("approved", selectedApplication)}
                      disabled={actionLoading || selectedApplication.status === "approved"}
                      className="px-5 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 transition-all flex items-center gap-2 shadow-md shadow-emerald-600/10 cursor-pointer"
                    >
                      {actionLoading && confirmModal.type === "approved" ? (
                        <FaSpinner className="animate-spin text-xs" />
                      ) : (
                        <FaCheck className="text-xs" />
                      )}
                      {selectedApplication.status === "approved" ? "Approved" : "Approve Expert"}
                    </button>

                    {/* Reject / Revoke Button */}
                    <button
                      onClick={() => openConfirmation("rejected", selectedApplication)}
                      disabled={actionLoading || selectedApplication.status === "rejected"}
                      className={`px-5 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider disabled:opacity-40 transition-all flex items-center gap-2 shadow-md cursor-pointer ${
                        selectedApplication.status === "approved"
                          ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/50 shadow-rose-600/5"
                          : "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/10"
                      }`}
                    >
                      {actionLoading && confirmModal.type === "rejected" ? (
                        <FaSpinner className="animate-spin text-xs" />
                      ) : selectedApplication.status === "approved" ? (
                        <FaUndo className="text-xs" />
                      ) : (
                        <FaTimes className="text-xs" />
                      )}
                      {selectedApplication.status === "rejected"
                        ? "Rejected"
                        : selectedApplication.status === "approved"
                        ? "Revoke Approval"
                        : "Reject Expert"}
                    </button>
                  </div>

                  {selectedApplication.reviewed_at && (
                    <div className="text-[10px] text-slate-400 font-medium">
                      Decision made: {new Date(selectedApplication.reviewed_at).toLocaleDateString()}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>

      </div>

      {/* Confirmation Modal Overlay */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border border-teal-50 shadow-2xl shadow-slate-950/20 transform transition-all scale-100">
            <div className="flex items-center gap-4 text-amber-600 mb-4 bg-amber-50 p-4 rounded-2xl border border-amber-100">
              <FaExclamationTriangle className="text-2xl shrink-0" />
              <div>
                <h4 className="font-bold text-slate-800 text-sm md:text-base">Confirm Action Required</h4>
                <p className="text-xs text-amber-700 mt-0.5">Please review the details below before executing.</p>
              </div>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Are you sure you want to change the status of{" "}
              <strong className="text-slate-800">
                {confirmModal.application?.title ? `${confirmModal.application.title} ` : ""}
                {confirmModal.application?.name}
              </strong>{" "}
              to{" "}
              <span className={`font-bold px-2 py-0.5 rounded text-xs uppercase tracking-wider ${
                confirmModal.type === "approved"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-rose-100 text-rose-800"
              }`}>
                {confirmModal.type}
              </span>
              ?
              {confirmModal.type === "rejected" && confirmModal.application?.status === "approved" && (
                <span className="block mt-3 p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200">
                  <strong>Notice:</strong> This action will revoke their approved expert status and delete their registered user account.
                </span>
              )}
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmModal({ isOpen: false, type: "", application: null })}
                className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReview(confirmModal.application.id, confirmModal.type)}
                className={`px-5 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider text-white shadow-md cursor-pointer ${
                  confirmModal.type === "approved"
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10"
                    : "bg-rose-600 hover:bg-rose-700 shadow-rose-600/10"
                }`}
              >
                Confirm Decision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminExpertApplications;
