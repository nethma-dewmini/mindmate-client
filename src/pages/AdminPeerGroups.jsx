import { useEffect, useState } from "react";
import { authService } from "../services/authService";
import { useNavigate } from "react-router-dom";

const AdminPeerGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [groupMessages, setGroupMessages] = useState([]);
  const [selectedMessageIds, setSelectedMessageIds] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  const currentUser = authService.getCurrentUser();
  const currentUserId = currentUser?.id || currentUser?.user_id || null;
  const selectedGroup =
    groups.find((group) => group.id === selectedGroupId) || null;

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || user.role !== "admin") {
      navigate("/admin/login");
      return;
    }

    fetchGroups();
  }, []);

  useEffect(() => {
    if (!selectedGroupId) {
      setGroupMessages([]);
      setMessageText("");
      setSelectedMessageIds([]);
      return;
    }

    let isMounted = true;

    const loadMessages = async () => {
      setMessagesLoading(true);
      try {
        const data = await authService.getPeerGroupMessages(selectedGroupId);
        if (isMounted) {
          setGroupMessages(Array.isArray(data) ? data : []);
          setSelectedMessageIds([]);
        }
      } catch (err) {
        if (isMounted) {
          setNotice({
            type: "error",
            message: err.message || "Failed to load group messages",
          });
        }
      } finally {
        if (isMounted) {
          setMessagesLoading(false);
        }
      }
    };

    loadMessages();

    return () => {
      isMounted = false;
    };
  }, [selectedGroupId]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const data = await authService.adminGetPeerGroups();
      setGroups(data);
    } catch (err) {
      console.error(err);
      setNotice({
        type: "error",
        message: err.message || "Failed to load groups",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const group = await authService.adminCreatePeerGroup({
        name,
        description,
        is_public: isPublic,
      });
      setName("");
      setDescription("");
      setIsPublic(true);
      setGroups((currentGroups) => [group, ...currentGroups]);
      setNotice({ type: "success", message: "Group created successfully." });
    } catch (err) {
      setNotice({ type: "error", message: err.message || "Create failed" });
    }
  };

  const togglePublic = async (group) => {
    try {
      const updated = await authService.adminUpdatePeerGroup(group.id, {
        is_public: !group.is_public,
      });
      setGroups((currentGroups) =>
        currentGroups.map((item) => (item.id === updated.id ? updated : item)),
      );
      setNotice({
        type: "success",
        message: `Group made ${updated.is_public ? "public" : "private"}.`,
      });
    } catch (err) {
      setNotice({ type: "error", message: err.message || "Update failed" });
    }
  };

  const requestDeleteGroup = (id) => {
    setDeleteConfirm({ kind: "group", id, title: "Delete this group?" });
  };

  const requestDeleteMessage = (messageId) => {
    setDeleteConfirm({
      kind: "message",
      id: messageId,
      title: "Delete this message?",
    });
  };

  const requestBulkDeleteMessages = () => {
    if (selectedMessageIds.length === 0) return;

    setDeleteConfirm({
      kind: "bulk-messages",
      ids: selectedMessageIds,
      title: `Delete ${selectedMessageIds.length} selected message${
        selectedMessageIds.length === 1 ? "" : "s"
      }?`,
    });
  };

  const toggleMessageSelection = (messageId) => {
    setSelectedMessageIds((currentSelected) =>
      currentSelected.includes(messageId)
        ? currentSelected.filter((id) => id !== messageId)
        : [...currentSelected, messageId],
    );
  };

  const toggleSelectAllMessages = () => {
    if (groupMessages.length === 0) return;

    setSelectedMessageIds((currentSelected) => {
      const visibleIds = groupMessages.map((message) => message.id);
      const allSelected = visibleIds.every((id) =>
        currentSelected.includes(id),
      );
      return allSelected ? [] : visibleIds;
    });
  };

  const cancelDelete = () => setDeleteConfirm(null);

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      if (deleteConfirm.kind === "group") {
        await authService.adminDeletePeerGroup(deleteConfirm.id);
        setGroups((currentGroups) =>
          currentGroups.filter((group) => group.id !== deleteConfirm.id),
        );
        if (selectedGroupId === deleteConfirm.id) {
          setSelectedGroupId(null);
        }
        setNotice({ type: "success", message: "Group deleted successfully." });
      } else if (deleteConfirm.kind === "message" && selectedGroup) {
        await authService.adminDeletePeerGroupMessage(
          selectedGroup.id,
          deleteConfirm.id,
        );
        setGroupMessages((currentMessages) =>
          currentMessages.filter((message) => message.id !== deleteConfirm.id),
        );
        setSelectedMessageIds((currentSelected) =>
          currentSelected.filter((id) => id !== deleteConfirm.id),
        );
        setNotice({
          type: "success",
          message: "Message deleted successfully.",
        });
      } else if (deleteConfirm.kind === "bulk-messages" && selectedGroup) {
        for (const messageId of deleteConfirm.ids) {
          await authService.adminDeletePeerGroupMessage(
            selectedGroup.id,
            messageId,
          );
        }
        setGroupMessages((currentMessages) =>
          currentMessages.filter(
            (message) => !deleteConfirm.ids.includes(message.id),
          ),
        );
        setSelectedMessageIds([]);
        setNotice({
          type: "success",
          message: `${deleteConfirm.ids.length} message${
            deleteConfirm.ids.length === 1 ? "" : "s"
          } deleted successfully.`,
        });
      }
    } catch (err) {
      setNotice({ type: "error", message: err.message || "Delete failed" });
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedGroup || !currentUserId) {
      setNotice({
        type: "error",
        message: "Select a group and make sure you are logged in.",
      });
      return;
    }

    if (!messageText.trim()) {
      setNotice({ type: "error", message: "Write a message before sending." });
      return;
    }

    setSendingMessage(true);
    try {
      const posted = await authService.postPeerGroupMessage(selectedGroup.id, {
        userId: currentUserId,
        content: messageText.trim(),
        metadata: { fromAdmin: true },
      });
      setGroupMessages((currentMessages) => [posted, ...currentMessages]);
      setSelectedMessageIds([]);
      setMessageText("");
      setNotice({ type: "success", message: "Message sent successfully." });
    } catch (err) {
      setNotice({
        type: "error",
        message: err.message || "Failed to send message",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const clearNotice = () => setNotice(null);

  return (
    <div className="min-h-screen bg-[#f7faf8] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">
            Peer Support Groups
          </h1>
        </div>

        {notice && (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-sm flex items-start justify-between gap-4 ${
              notice.type === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            <span>{notice.message}</span>
            <button
              type="button"
              onClick={clearNotice}
              className="text-xs font-semibold uppercase tracking-wide opacity-70 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        )}

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
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded"
              type="submit"
            >
              Create Group
            </button>
          </div>
        </form>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="space-y-3 mb-8">
            {groups.map((group) => (
              <div key={group.id} className="p-3 bg-white rounded shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{group.name}</h3>
                    <p className="text-sm text-slate-600">
                      {group.description}
                    </p>
                    <p className="text-xs text-slate-500">
                      Created: {new Date(group.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      type="button"
                      className="px-3 py-1 bg-slate-700 text-white rounded text-sm"
                      onClick={() => setSelectedGroupId(group.id)}
                    >
                      Manage Messages
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                      onClick={() => togglePublic(group)}
                    >
                      {group.is_public ? "Make Private" : "Make Public"}
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                      onClick={() => requestDeleteGroup(group.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedGroup && (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  Message Group: {selectedGroup.name}
                </h2>
                <p className="text-sm text-slate-500">
                  Send a message to the selected group as an admin.
                </p>
              </div>
              <button
                type="button"
                className="px-3 py-1 text-sm rounded border border-slate-300 text-slate-700"
                onClick={() => setSelectedGroupId(null)}
              >
                Close
              </button>
            </div>

            <div className="mb-4">
              <textarea
                className="w-full p-3 border rounded min-h-28"
                placeholder="Write an admin message to this group..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
              <div className="flex justify-end mt-3">
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
                  onClick={handleSendMessage}
                  disabled={sendingMessage}
                >
                  {sendingMessage ? "Sending..." : "Send Message"}
                </button>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="font-semibold text-slate-800">
                  Recent Messages
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="px-3 py-1 text-xs rounded border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    onClick={toggleSelectAllMessages}
                    disabled={groupMessages.length === 0}
                  >
                    {selectedMessageIds.length === groupMessages.length &&
                    groupMessages.length > 0
                      ? "Clear Selection"
                      : "Select All"}
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                    onClick={requestBulkDeleteMessages}
                    disabled={selectedMessageIds.length === 0}
                  >
                    Delete Selected ({selectedMessageIds.length})
                  </button>
                </div>
              </div>
              {messagesLoading ? (
                <div className="text-sm text-slate-500">
                  Loading messages...
                </div>
              ) : groupMessages.length === 0 ? (
                <div className="text-sm text-slate-500">
                  No messages in this group yet.
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {groupMessages.map((message) => (
                    <div
                      key={message.id}
                      className="border rounded p-3 bg-slate-50"
                    >
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <label className="flex items-start gap-3 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            checked={selectedMessageIds.includes(message.id)}
                            onChange={() => toggleMessageSelection(message.id)}
                          />
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-slate-800">
                              {message.metadata?.fromAdmin
                                ? "Admin"
                                : "Student"}
                            </span>
                            {message.metadata?.fromAdmin && (
                              <span className="text-[11px] rounded-full bg-blue-100 text-blue-700 px-2 py-0.5">
                                Official
                              </span>
                            )}
                          </div>
                        </label>
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                          {message.created_at
                            ? new Date(message.created_at).toLocaleString()
                            : "Just now"}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700">
                        {message.content}
                      </p>
                      <div className="flex justify-end mt-2">
                        <button
                          type="button"
                          className="text-xs px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                          onClick={() => requestDeleteMessage(message.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {deleteConfirm.title}
              </h3>
              <p className="text-sm text-gray-600 mb-5">
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={cancelDelete}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPeerGroups;
