import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

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
    if (!registrationNo || !email)
      return setError("Registration number and email are required");
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
            className="bg-yellow-200 text-yellow-900 rounded px-0.5"
          >
            {part}
          </mark>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="min-h-screen bg-[#f7faf8] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8">
          <div>
            <p className="text-sm font-semibold text-[#5bb5a1] uppercase tracking-wide">
              Admin Tools
            </p>
            <h1 className="text-3xl font-bold text-slate-800 mt-2">
              Student Registry
            </h1>
            <p className="text-slate-500 mt-2 max-w-2xl">
              Add approved UOM students here before they register.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <form
            onSubmit={handleCreate}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4"
          >
            <input
              value={registrationNo}
              onChange={(e) => setRegistrationNo(e.target.value)}
              placeholder="Registration No"
              className="px-4 py-3 border rounded"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Student email"
              className="px-4 py-3 border rounded"
            />
            <div className="flex items-center">
              <button
                disabled={creating}
                className="px-4 py-3 bg-[#5bb5a1] text-white rounded"
              >
                {creating ? "Creating..." : "Add Student"}
              </button>
            </div>
          </form>

          {error && <div className="mb-4 text-red-600">{error}</div>}
          {successMsg && (
            <div className="mb-4 text-green-600">{successMsg}</div>
          )}

          {/* CSV upload section */}
          <div className="mb-4 border-t pt-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Import CSV
            </label>
            <div className="flex items-center gap-3">
              <input type="file" accept=".csv" onChange={handleFileChange} />
              <button
                onClick={handleUploadCsv}
                disabled={uploading}
                className="px-4 py-2 bg-[#5bb5a1] text-white rounded"
              >
                {uploading
                  ? `Uploading ${uploadProgress.done}/${uploadProgress.total}`
                  : "Upload CSV"}
              </button>
              <div className="text-sm text-slate-500">
                CSV format: registration_no,email (header optional)
              </div>
            </div>

            {uploading && (
              <div className="mt-3 text-sm">
                Progress: {uploadProgress.done} / {uploadProgress.total}
              </div>
            )}

            {uploadErrors && uploadErrors.length > 0 && (
              <div className="mt-3 bg-red-50 border border-red-200 text-red-700 p-3 rounded">
                <div className="font-medium">
                  Upload errors ({uploadErrors.length}):
                </div>
                <ul className="text-xs mt-2 list-disc pl-5">
                  {uploadErrors.map((err, idx) => (
                    <li
                      key={idx}
                    >{`Row ${err.row}: ${err.registration_no} / ${err.email} — ${err.error}`}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <form
            className="mb-4 flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              loadRegistry(query);
            }}
          >
            <input
              placeholder="Search registration or email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="px-4 py-3 border rounded flex-grow"
            />
            <button type="submit" className="px-4 py-2 bg-slate-100 rounded">
              Search
            </button>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-left table-auto">
              <thead>
                <tr className="text-sm text-slate-500">
                  <th className="px-4 py-2">Registration No</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Created At</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="p-4">
                      Loading...
                    </td>
                  </tr>
                ) : registry.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-4">
                      No registry entries found.
                    </td>
                  </tr>
                ) : (
                  registry.map((r) => (
                    <tr key={r.id} className="bg-white border-t">
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {highlightMatch(r.registration_no, debouncedQuery)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {highlightMatch(r.email, debouncedQuery)}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {r.created_at
                          ? new Date(r.created_at).toLocaleString()
                          : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStudentRegistry;
