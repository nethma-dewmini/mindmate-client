import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaSearch,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUsers,
} from "react-icons/fa";
import { authService } from "../services/authService";

const AdminStudentRegistryPage = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const [entries, setEntries] = useState([]);
  const [query, setQuery] = useState("");
  const [registrationNo, setRegistrationNo] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (currentUser.role !== "admin") {
      navigate("/dashboard");
      return;
    }

    loadRegistry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadRegistry = async (search = query) => {
    setIsLoading(true);
    setError("");
    try {
      const data = await authService.getStudentRegistry({
        q: search,
        limit: 50,
      });
      setEntries(data.registry || []);
      setTotalCount(data.count || 0);
    } catch (err) {
      setError(err.message || "Failed to load registry");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    await loadRegistry(query);
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!registrationNo || !email) {
      setError("Registration number and email are required");
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.createStudentRegistryEntry(registrationNo, email);
      setSuccess("Student registry entry created successfully");
      setRegistrationNo("");
      setEmail("");
      await loadRegistry(query);
    } catch (err) {
      setError(err.message || "Failed to create registry entry");
    } finally {
      setIsSubmitting(false);
    }
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
              Add approved UOM students here before they register, and search
              the whitelist when needed.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-slate-300"
          >
            Back to dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1 bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-[#e8f7f2] flex items-center justify-center text-[#2f8f79]">
                <FaPlus />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Add Student
                </h2>
                <p className="text-sm text-slate-500">
                  Whitelist a student for registration
                </p>
              </div>
            </div>

            <form onSubmit={handleAddEntry} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Registration No
                </label>
                <input
                  value={registrationNo}
                  onChange={(e) => setRegistrationNo(e.target.value)}
                  placeholder="2020xxxxxX"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5bb5a1]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  UOM Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@uom.lk"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5bb5a1]"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100">
                  <FaExclamationTriangle className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm border border-emerald-100">
                  <FaCheckCircle className="mt-0.5 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#5bb5a1] text-white font-medium hover:bg-[#4a9d8b] disabled:opacity-60"
              >
                {isSubmitting ? "Saving..." : "Add Registry Entry"}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Registry Entries
                </h2>
                <p className="text-sm text-slate-500">
                  {totalCount} approved student{totalCount === 1 ? "" : "s"} in
                  the whitelist
                </p>
              </div>

              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search reg no or email"
                    className="w-full sm:w-72 pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5bb5a1]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800"
                >
                  Search
                </button>
              </form>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-100">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-600 text-sm">
                  <tr>
                    <th className="px-4 py-3 font-medium">Registration No</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td className="px-4 py-6 text-slate-500" colSpan={3}>
                        Loading registry...
                      </td>
                    </tr>
                  ) : entries.length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-slate-500" colSpan={3}>
                        No registry entries found.
                      </td>
                    </tr>
                  ) : (
                    entries.map((entry) => (
                      <tr key={entry.id} className="bg-white">
                        <td className="px-4 py-4 font-medium text-slate-800">
                          {entry.registration_no}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {entry.email}
                        </td>
                        <td className="px-4 py-4 text-slate-500">
                          {entry.created_at
                            ? new Date(entry.created_at).toLocaleString()
                            : "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-sm text-slate-500 flex items-center gap-2">
              <FaUsers />
              Only admins can manage this list. Students can register only if
              their registration number and email already exist here.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStudentRegistryPage;
