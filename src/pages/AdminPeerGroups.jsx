import { useEffect, useState } from "react";
import { authService } from "../services/authService";
import { useNavigate } from "react-router-dom";

const AdminPeerGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || user.role !== "admin") {
      navigate("/admin/login");
      return;
    }

    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const data = await authService.adminGetPeerGroups();
      setGroups(data);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const g = await authService.adminCreatePeerGroup({
        name,
        description,
        is_public: isPublic,
      });
      setName("");
      setDescription("");
      setIsPublic(true);
      setGroups((s) => [g, ...s]);
    } catch (err) {
      alert(err.message || "Create failed");
    }
  };

  const togglePublic = async (group) => {
    try {
      const updated = await authService.adminUpdatePeerGroup(group.id, {
        is_public: !group.is_public,
      });
      setGroups((s) => s.map((g) => (g.id === updated.id ? updated : g)));
    } catch (err) {
      alert(err.message || "Update failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this group?")) return;
    try {
      await authService.adminDeletePeerGroup(id);
      setGroups((s) => s.filter((g) => g.id !== id));
    } catch (err) {
      alert(err.message || "Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#f7faf8] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">
            Peer Support Groups
          </h1>
        </div>

        <form onSubmit={handleCreate} className="mb-6 space-y-2">
          <input
            className="w-full p-2 border rounded"
            placeholder="Group name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <textarea
            className="w-full p-2 border rounded"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            Public
          </label>
          <div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded">
              Create Group
            </button>
          </div>
        </form>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="space-y-3">
            {groups.map((g) => (
              <div key={g.id} className="p-3 bg-white rounded shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{g.name}</h3>
                    <p className="text-sm text-slate-600">{g.description}</p>
                    <p className="text-xs text-slate-500">
                      Created: {new Date(g.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                      onClick={() => togglePublic(g)}
                    >
                      {g.is_public ? "Make Private" : "Make Public"}
                    </button>
                    <button
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                      onClick={() => handleDelete(g.id)}
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
  );
};

export default AdminPeerGroups;
