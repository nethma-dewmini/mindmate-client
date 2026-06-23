import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { 
  FaTrash, 
  FaPlus, 
  FaUpload, 
  FaSearch, 
  FaGraduationCap, 
  FaExclamationTriangle,
  FaFileCsv,
  FaSpinner
} from "react-icons/fa";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AdminStudentRegistry = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [query, setQuery] = useState("");
  const [registry, setRegistry] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [registrationNo, setRegistrationNo] = useState("");
  const [email, setEmail] = useState("");
  const [creating, setCreating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });
  const [uploadErrors, setUploadErrors] = useState([]);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Deletion States
  const [deletingId, setDeletingId] = useState(null);
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Selection States
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "admin") {
      navigate("/");
      return;
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    const t = setTimeout(() => {
      const q = query.trim();
      setDebouncedQuery(q);
      loadRegistry(q);
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  async function loadRegistry(q = "") {
    setLoading(true);
    setError("");
    setSelectedIds([]); // Clear selection when search changes or list reloads
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      params.set("limit", "200");
      const res = await fetch(
        `${API_BASE_URL}/student-registry?${params.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...authService.getAuthHeaders(),
          },
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load registry");
      setRegistry(data.registry || []);
      setCount(data.count || 0);
    } catch (err) {
      setError(err.message || "Failed to load registry");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    if (!registrationNo || !email) {
      return setError("Registration number and email are required");
    }
    if (!/^\d{6}[A-Z]$/.test(registrationNo.trim())) {
      return setError("Enter a valid registration number like 221234X. The last letter must be a capital letter.");
    }
    setCreating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/student-registry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authService.getAuthHeaders(),
        },
        body: JSON.stringify({ registration_no: registrationNo, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create entry");
      setSuccessMsg("Student registry entry created successfully");
      setRegistrationNo("");
      setEmail("");
      await loadRegistry(query);
    } catch (err) {
      setError(err.message || "Failed to create entry");
    } finally {
      setCreating(false);
    }
  }

  // Deletion logic (supports single or bulk delete)
  async function handleDeleteConfirm() {
    if (!deletingId) return;
    setError("");
    setSuccessMsg("");
    setDeleting(true);
    try {
      if (deletingId === "bulk") {
        const res = await fetch(`${API_BASE_URL}/student-registry/bulk-delete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authService.getAuthHeaders(),
          },
          body: JSON.stringify({ ids: selectedIds }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to delete entries");
        setSuccessMsg(`${data.count || selectedIds.length} student registry entries deleted successfully`);
        setSelectedIds([]);
      } else {
        const res = await fetch(`${API_BASE_URL}/student-registry/${deletingId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...authService.getAuthHeaders(),
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to delete entry");
        setSuccessMsg("Student registry entry deleted successfully");
        setSelectedIds((prev) => prev.filter((x) => x !== deletingId));
      }
      await loadRegistry(query);
    } catch (err) {
      setError(err.message || "Failed to delete entry");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setDeletingId(null);
      setDeletingRecord(null);
    }
  }

  // Checkbox interactions
  function handleSelectRow(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleSelectAll() {
    const visibleIds = registry.map((r) => r.id);
    const allVisibleSelected = visibleIds.every((id) => selectedIds.includes(id));
    if (allVisibleSelected) {
      // Unselect all visible rows
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      // Select all visible rows
      setSelectedIds((prev) => {
        const unique = new Set([...prev, ...visibleIds]);
        return Array.from(unique);
      });
    }
  }

  function parseCsvText(text) {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return [];
    // Detect header
    const header = lines[0].toLowerCase();
    let start = 0;
    if (header.includes("registration") || header.includes("email")) {
      start = 1;
    }

    const rows = [];
    for (let i = start; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim());
      if (cols.length < 2) continue;
      rows.push({ registration_no: cols[0], email: cols[1] });
    }
    return rows;
  }

  async function handleFileChange(e) {
    const f = e.target.files && e.target.files[0];
    setCsvFile(f || null);
    setUploadErrors([]);
    setUploadProgress({ done: 0, total: 0 });
  }

  async function handleUploadCsv(e) {
    e.preventDefault();
    setUploadErrors([]);
    if (!csvFile) return setError("Please select a CSV file first");
    setUploading(true);
    try {
      const text = await csvFile.text();
      const rows = parseCsvText(text);
      if (rows.length === 0) {
        setError("No valid rows found in CSV");
        setUploading(false);
        return;
      }

      setUploadProgress({ done: 0, total: rows.length });
      const errors = [];
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        try {
          if (!/^\d{6}[A-Z]$/.test(String(r.registration_no || "").trim())) {
            errors.push({
              row: i + 1,
              registration_no: r.registration_no,
              email: r.email,
              error: "Invalid Registration No. Last letter must be a capital letter.",
            });
            setUploadProgress((p) => ({ ...p, done: p.done + 1 }));
            continue;
          }
          const res = await fetch(`${API_BASE_URL}/student-registry`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...authService.getAuthHeaders(),
            },
            body: JSON.stringify({
              registration_no: r.registration_no,
              email: r.email,
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            errors.push({
              row: i + 1,
              registration_no: r.registration_no,
              email: r.email,
              error: data.message || "Failed",
            });
          }
        } catch (err) {
          errors.push({
            row: i + 1,
            registration_no: r.registration_no,
            email: r.email,
            error: err.message,
          });
        }
        setUploadProgress((p) => ({ ...p, done: p.done + 1 }));
      }

      setUploadErrors(errors);
      if (errors.length === 0) setSuccessMsg(`Imported ${rows.length} entries`);
      await loadRegistry(query);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const escapeRegExp = (string = "") =>
    string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const highlightMatch = (text = "", q = "") => {
    if (!q) return text;
    const parts = String(text).split(new RegExp(`(${escapeRegExp(q)})`, "i"));
    return parts.map((part, i) => {
      if (part.toLowerCase() === q.toLowerCase()) {
        return (
          <mark
            key={i}
            className="bg-teal-100 text-[#2c6e5f] font-semibold rounded px-0.5"
          >
            {part}
          </mark>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header Panel */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <div className="flex items-center space-x-2">
            <FaGraduationCap className="text-xl text-[#2c6e5f]" />
            <p className="text-sm font-semibold text-[#2c6e5f] uppercase tracking-wider">
              Admin Tools
            </p>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 mt-2">
            Student Registry
          </h1>
          <p className="text-slate-500 mt-1 max-w-2xl text-sm">
            Manage pre-approved University of Moratuwa student records. Students can only register if their details are added here.
          </p>
        </div>
        <div className="text-sm font-medium bg-[#2c6e5f]/10 text-[#2c6e5f] px-4 py-2 rounded-full border border-[#2c6e5f]/20 shadow-sm self-start sm:self-auto">
          Total Pre-registered: <span className="font-bold">{count}</span>
        </div>
      </div>

      {/* Error & Success Messages */}
      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm flex items-start space-x-2">
          <FaExclamationTriangle className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 shadow-sm flex items-start space-x-2">
          <span className="font-semibold">✓</span>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Controls Panel (1/3 Width) */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Add Student Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 transition-all hover:shadow-md duration-300">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-2 h-5 bg-[#2c6e5f] rounded-full inline-block"></span>
              Add Individual Student
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Registration No
                </label>
                <input
                  value={registrationNo}
                  onChange={(e) => setRegistrationNo(e.target.value)}
                  placeholder="e.g. 221234X"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2c6e5f] focus:border-transparent transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Student Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. student@uom.lk"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2c6e5f] focus:border-transparent transition-all text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={creating || !registrationNo || !email}
                className="w-full py-3 bg-[#2c6e5f] text-white rounded-xl font-medium hover:bg-[#1b4d42] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                {creating ? <FaSpinner className="animate-spin" /> : <FaPlus className="text-xs" />}
                {creating ? "Adding..." : "Add Student"}
              </button>
            </form>
          </div>

          {/* Import CSV Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 transition-all hover:shadow-md duration-300">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-2 h-5 bg-[#2c6e5f] rounded-full inline-block"></span>
              Bulk CSV Import
            </h2>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-[#2c6e5f]/50 transition-colors">
                <FaFileCsv className="mx-auto text-3xl text-slate-400 mb-2" />
                <label className="block text-xs font-medium text-slate-600 cursor-pointer">
                  <span className="text-[#2c6e5f] hover:underline font-semibold">Choose CSV File</span>
                  <input 
                    type="file" 
                    accept=".csv" 
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {csvFile && (
                  <p className="text-xs text-[#2c6e5f] font-semibold mt-2 truncate">
                    {csvFile.name}
                  </p>
                )}
              </div>

              <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                <strong>CSV Format:</strong> <code className="bg-white px-1.5 py-0.5 rounded border">registration_no,email</code> (Header row is optional)
              </div>

              <button
                onClick={handleUploadCsv}
                disabled={uploading || !csvFile}
                className="w-full py-3 bg-[#5bb5a1] text-white rounded-xl font-medium hover:bg-[#4a9d8b] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                {uploading ? (
                  <span className="flex items-center gap-2">
                    <FaSpinner className="animate-spin" />
                    {`Importing: ${uploadProgress.done}/${uploadProgress.total}`}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <FaUpload className="text-xs" />
                    Upload CSV
                  </span>
                )}
              </button>

              {uploading && (
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div 
                    className="bg-[#2c6e5f] h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${(uploadProgress.done / uploadProgress.total) * 100}%` }}
                  ></div>
                </div>
              )}

              {/* Upload Errors Box */}
              {uploadErrors && uploadErrors.length > 0 && (
                <div className="mt-3 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl shadow-sm">
                  <div className="font-semibold text-xs flex items-center gap-1.5">
                    <FaExclamationTriangle />
                    <span>Upload errors ({uploadErrors.length}):</span>
                  </div>
                  <ul className="text-xs mt-2 list-disc pl-5 space-y-1 max-h-36 overflow-y-auto leading-relaxed">
                    {uploadErrors.map((err, idx) => (
                      <li key={idx}>
                        {`Row ${err.row}: ${err.registration_no} - ${err.error}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Table & Search Directory (2/3 Width) */}
        <div className="space-y-6 lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 transition-all hover:shadow-md duration-300">
            
            {/* Search Form */}
            <form
              className="mb-6 flex gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                loadRegistry(query);
              }}
            >
              <div className="relative flex-grow">
                <FaSearch className="absolute left-4 top-3.5 text-slate-400" />
                <input
                  placeholder="Search student registration no or email..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2c6e5f] focus:border-transparent transition-all text-sm"
                />
              </div>
              <button 
                type="submit" 
                className="px-6 py-3 bg-[#2c6e5f]/10 text-[#2c6e5f] hover:bg-[#2c6e5f]/20 font-semibold rounded-xl transition-all cursor-pointer text-sm"
              >
                Search
              </button>
            </form>

            {/* Bulk Action Bar (Shown when multiple items are selected) */}
            {selectedIds.length > 0 && (
              <div className="mb-4 p-4 bg-teal-50 border border-[#2c6e5f]/20 rounded-xl flex items-center justify-between animate-fade-in shadow-sm">
                <div className="text-sm font-semibold text-[#2c6e5f] flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#2c6e5f] animate-ping"></span>
                  {selectedIds.length} student{selectedIds.length > 1 ? "s" : ""} selected
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDeletingId("bulk");
                    setShowDeleteConfirm(true);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                >
                  <FaTrash className="text-[10px]" />
                  Delete Selected
                </button>
              </div>
            )}

            {/* Registry List Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left table-auto border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-3.5 text-center w-12">
                      <input
                        type="checkbox"
                        checked={registry.length > 0 && registry.every((r) => selectedIds.includes(r.id))}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-[#2c6e5f] focus:ring-[#2c6e5f] h-4 w-4 cursor-pointer"
                      />
                    </th>
                    <th className="px-5 py-3.5">Registration No</th>
                    <th className="px-5 py-3.5">Email</th>
                    <th className="px-5 py-3.5">Approved On</th>
                    <th className="px-5 py-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {loading ? (
                    // Skeleton Loaders
                    Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={idx} className="border-b border-slate-50 animate-pulse">
                        <td className="px-5 py-4 text-center"><div className="h-4 w-4 bg-slate-100 rounded mx-auto"></div></td>
                        <td className="px-5 py-4"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                        <td className="px-5 py-4"><div className="h-4 bg-slate-100 rounded w-44"></div></td>
                        <td className="px-5 py-4"><div className="h-4 bg-slate-100 rounded w-28"></div></td>
                        <td className="px-5 py-4 flex justify-center"><div className="h-8 w-8 bg-slate-100 rounded-full"></div></td>
                      </tr>
                    ))
                  ) : registry.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 font-medium bg-slate-50/50">
                        No registry entries found.
                      </td>
                    </tr>
                  ) : (
                    registry.map((r) => {
                      const isSelected = selectedIds.includes(r.id);
                      return (
                        <tr 
                          key={r.id} 
                          className={`border-b border-slate-100 transition-colors duration-150 group ${
                            isSelected ? "bg-[#2c6e5f]/5 hover:bg-[#2c6e5f]/10" : "bg-white hover:bg-slate-50"
                          }`}
                        >
                          <td className="px-5 py-4 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectRow(r.id)}
                              className="rounded border-gray-300 text-[#2c6e5f] focus:ring-[#2c6e5f] h-4 w-4 cursor-pointer"
                            />
                          </td>
                          <td className="px-5 py-4 font-semibold text-slate-800">
                            {highlightMatch(r.registration_no, debouncedQuery)}
                          </td>
                          <td className="px-5 py-4 text-slate-600 font-medium">
                            {highlightMatch(r.email, debouncedQuery)}
                          </td>
                          <td className="px-5 py-4 text-slate-500 text-xs">
                            {r.created_at
                              ? new Date(r.created_at).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })
                              : "-"}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <button
                              onClick={() => {
                                setDeletingId(r.id);
                                setDeletingRecord(r);
                                setShowDeleteConfirm(true);
                              }}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                              title="Remove student approval"
                            >
                              <FaTrash className="text-xs" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal Overlay */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            className="bg-white w-full max-w-md rounded-3xl p-6 shadow-xl border border-slate-100 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3 text-red-600 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <FaExclamationTriangle className="text-lg" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                {deletingId === "bulk" ? "Bulk Remove Pre-approvals" : "Remove Student Pre-approval"}
              </h3>
            </div>

            <p className="text-slate-600 text-sm mb-5 leading-relaxed">
              {deletingId === "bulk" ? (
                <>
                  Are you sure you want to remove the pre-approval for the 
                  <strong className="text-slate-800"> {selectedIds.length} selected students</strong>?
                </>
              ) : (
                <>
                  Are you sure you want to remove the pre-approval for student 
                  <strong className="text-slate-800"> {deletingRecord?.registration_no}</strong> (email: <strong className="text-slate-800">{deletingRecord?.email}</strong>)? 
                </>
              )}
              <span className="block mt-2 text-xs text-red-500 font-semibold">
                This action is permanent and will prevent these students from registering unless they are added back.
              </span>
            </p>

            <div className="flex space-x-3">
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-grow py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer text-sm"
              >
                {deleting ? "Removing..." : "Yes, Remove"}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingId(null);
                  setDeletingRecord(null);
                }}
                disabled={deleting}
                className="px-5 py-3 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all cursor-pointer text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudentRegistry;
