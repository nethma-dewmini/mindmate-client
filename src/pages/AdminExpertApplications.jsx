import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const STATUS_LABELS = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
};

const AdminExpertApplications = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const [statusFilter, setStatusFilter] = useState("pending");
  const [applications, setApplications] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedLoading, setSelectedLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [summary, setSummary] = useState({ pending: 0, approved: 0, rejected: 0 });

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
    setActionLoadingId(id);
    setError("");

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
      setActionLoadingId("");
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <p className="text-sm font-semibold text-[#5bb5a1] uppercase tracking-wide">
            Admin Tools
          </p>
          <h2 className="text-2xl font-bold text-slate-800 mt-1">
            Expert Applications
          </h2>
          <p className="text-slate-500 mt-1">
            Review expert applications and approve or reject them.
          </p>
        </div>

        <div className="flex gap-2 text-sm flex-wrap">
          <div className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700">
            Pending: {summary.pending}
          </div>
          <div className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700">
            Approved: {summary.approved}
          </div>
          <div className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700">
            Rejected: {summary.rejected}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-600 font-medium">Filter</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All</option>
          </select>
        </div>

        <div className="text-sm text-slate-500">{count} application(s)</div>
      </div>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border rounded-xl overflow-hidden">
          <div className="bg-slate-50 px-4 py-3 border-b text-sm font-medium text-slate-700">
            Application List
          </div>
          <div className="max-h-[620px] overflow-auto">
            {loading ? (
              <div className="p-4 text-slate-500">Loading...</div>
            ) : applications.length === 0 ? (
              <div className="p-4 text-slate-500">No applications found.</div>
            ) : (
              applications.map((application) => (
                <button
                  key={application.id}
                  onClick={() => loadApplicationDetails(application.id)}
                  className={`w-full text-left px-4 py-4 border-b hover:bg-slate-50 transition-colors ${
                    selectedApplication?.id === application.id
                      ? "bg-teal-50"
                      : "bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-800">
                        {application.title ? `${application.title} ` : ""}
                        {application.name}
                      </div>
                      <div className="text-sm text-slate-500">
                        {application.email}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {application.created_at
                          ? new Date(application.created_at).toLocaleString()
                          : "-"}
                      </div>
                    </div>

                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLES[application.status] || "bg-slate-100 text-slate-700"}`}
                    >
                      {STATUS_LABELS[application.status] || application.status}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="border rounded-xl overflow-hidden bg-white">
          <div className="bg-slate-50 px-4 py-3 border-b text-sm font-medium text-slate-700">
            Application Details
          </div>
          <div className="p-4">
            {!selectedApplication ? (
              <div className="text-slate-500">
                Select an application from the list to view details.
              </div>
            ) : selectedLoading ? (
              <div className="text-slate-500">Loading details...</div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-400">
                    Name
                  </div>
                  <div className="font-semibold text-slate-800">
                    {selectedApplication.title
                      ? `${selectedApplication.title} `
                      : ""}
                    {selectedApplication.name}
                  </div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-400">
                    Email
                  </div>
                  <div className="text-slate-700">
                    {selectedApplication.email}
                  </div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-400">
                    Specialization
                  </div>
                  <div className="text-slate-700">
                    {selectedApplication.specialization || "-"}
                  </div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-400">
                    Status
                  </div>
                  <span
                    className={`inline-flex text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLES[selectedApplication.status] || "bg-slate-100 text-slate-700"}`}
                  >
                    {STATUS_LABELS[selectedApplication.status] ||
                      selectedApplication.status}
                  </span>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                    Admin Notes
                  </div>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Add review notes for this application"
                  />
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-400 mb-2">
                    Documents
                  </div>
                  <div className="space-y-2">
                    {(selectedApplication.documents || []).length === 0 ? (
                      <div className="text-sm text-slate-500">
                        No documents attached.
                      </div>
                    ) : (
                      (selectedApplication.documents || []).map(
                        (doc, index) => (
                          <a
                            key={index}
                            href={`${API_BASE_URL.replace(/\/api$/, "")}/api/uploads/${doc.relativePath}`}
                            target="_blank"
                            rel="noreferrer"
                            className="block text-sm text-[#5bb5a1] hover:underline"
                          >
                            {doc.name || `Document ${index + 1}`}
                          </a>
                        ),
                      )
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() =>
                      handleReview(selectedApplication.id, "approved")
                    }
                    disabled={
                      actionLoadingId === selectedApplication.id ||
                      selectedApplication.status === "approved"
                    }
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
                  >
                    {actionLoadingId === selectedApplication.id
                      ? "Updating..."
                      : selectedApplication.status === "approved"
                      ? "Approved"
                      : "Approve"}
                  </button>
                  <button
                    onClick={() =>
                      handleReview(selectedApplication.id, "rejected")
                    }
                    disabled={
                      actionLoadingId === selectedApplication.id ||
                      selectedApplication.status === "rejected"
                    }
                    className="px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
                  >
                    {selectedApplication.status === "rejected"
                      ? "Rejected"
                      : selectedApplication.status === "approved"
                      ? "Revoke Approval"
                      : "Reject"}
                  </button>
                </div>

                <div className="text-xs text-slate-500">
                  Reviewed at:{" "}
                  {selectedApplication.reviewed_at
                    ? new Date(selectedApplication.reviewed_at).toLocaleString()
                    : "-"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminExpertApplications;
