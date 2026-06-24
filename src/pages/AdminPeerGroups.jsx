import { useEffect, useState } from "react";
import { authService } from "../services/authService";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaPlus,
  FaComments,
  FaLock,
  FaLockOpen,
  FaTrash,
  FaClock,
  FaPaperPlane,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaGraduationCap,
  FaUserShield,
  FaInfoCircle
} from "react-icons/fa";

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
      navigate("/login");
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
      setGroups(data || []);
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
    if (!name.trim()) return;

    try {
      const group = await authService.adminCreatePeerGroup({
        name: name.trim(),
        description: description.trim(),
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

  const requestDeleteGroup = (group) => {
    setDeleteConfirm({
      kind: "group",
      id: group.id,
      name: group.name,
      title: "Delete Support Group?",
    });
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
    <div className="bg-[#fcfdfc] min-h-[750px] p-2 md:p-6 rounded-3xl border border-teal-50 shadow-xl shadow-teal-900/5 transition-all">
      
      {/* Banner / Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8 p-4 bg-gradient-to-r from-teal-50/60 to-transparent rounded-2xl border border-teal-100/30">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#2c6e5f]/10 text-[#2c6e5f] uppercase tracking-wider">
            Admin Portal
          </span>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mt-2">
            Peer Support Groups
          </h2>
          <p className="text-slate-500 mt-1 text-sm md:text-base">
            Create, moderate, and manage student peer support groups and broadcast official notices.
          </p>
        </div>
      </div>

      {/* Notices */}
      {notice && (
        <div
          className={`mb-6 rounded-2xl border px-4 py-3 text-sm flex items-center justify-between gap-4 transition-all animate-fade-in ${
            notice.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === "success" ? <FaCheckCircle /> : <FaTimesCircle />}
            <span>{notice.message}</span>
          </div>
          <button
            type="button"
            onClick={clearNotice}
            className="text-xs font-semibold uppercase tracking-wide opacity-70 hover:opacity-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Two Column Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Create Form + Groups List */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Create Group Form Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
              <FaPlus className="text-teal-600 text-xs" />
              Create Support Group
            </h3>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Group Name (e.g., Exam Stress Support)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                  required
                />
              </div>

              <div>
                <textarea
                  placeholder="Group Description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                />
              </div>

              {/* Public/Private toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2">
                  {isPublic ? (
                    <FaLockOpen className="text-emerald-600 text-xs" />
                  ) : (
                    <FaLock className="text-slate-400 text-xs" />
                  )}
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">Public Visibility</span>
                    <span className="text-[10px] text-slate-400">Allow any student to discover and join</span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2c6e5f]"></div>
                </label>
              </div>

              <button
                type="submit"
                disabled={!name.trim()}
                className="w-full py-2.5 bg-[#2c6e5f] hover:bg-[#23584c] text-white rounded-xl font-bold text-xs uppercase tracking-wider disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-teal-900/5"
              >
                Create Group
              </button>
            </form>
          </div>

          {/* Groups List */}
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
            <div className="bg-slate-50/50 px-5 py-4 border-b border-slate-100 flex justify-between items-center">
              <span className="text-xs md:text-sm font-semibold text-slate-700">Chatrooms List</span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {groups.length} active
              </span>
            </div>

            <div className="max-h-[480px] overflow-y-auto p-2 space-y-1 divide-y divide-slate-50">
              {loading ? (
                /* Skeletal Loaders */
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 bg-white rounded-2xl border border-transparent flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-slate-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-2/3" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                    </div>
                  </div>
                ))
              ) : groups.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <FaUsers className="text-3xl text-slate-200" />
                  <p className="text-xs">No active peer support groups yet.</p>
                </div>
              ) : (
                groups.map((group) => {
                  const isSelected = selectedGroupId === group.id;
                  return (
                    <div
                      key={group.id}
                      className={`p-3 rounded-2xl flex flex-col gap-3 transition-all duration-300 border ${
                        isSelected
                          ? "bg-teal-50/30 border-[#5bb5a1]/40"
                          : "bg-white border-transparent hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm ${
                            isSelected ? "bg-[#2c6e5f] text-white" : "bg-teal-50 text-[#2c6e5f]"
                          }`}>
                            <FaUsers />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">{group.name}</h4>
                            <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{group.description}</p>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1.5">
                              <FaClock />
                              {new Date(group.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Visibility Badge */}
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border shrink-0 ${
                          group.is_public
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-50 text-slate-600 border-slate-200"
                        }`}>
                          {group.is_public ? "Public" : "Private"}
                        </span>
                      </div>

                      {/* Card Control Buttons */}
                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-dashed border-slate-100">
                        <button
                          type="button"
                          onClick={() => setSelectedGroupId(group.id)}
                          className={`px-3 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#2c6e5f] text-white"
                              : "bg-slate-100 hover:bg-[#2c6e5f] hover:text-white text-slate-700"
                          }`}
                        >
                          <FaComments />
                          Messages
                        </button>
                        <button
                          type="button"
                          onClick={() => togglePublic(group)}
                          className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60 font-semibold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          {group.is_public ? <FaLock /> : <FaLockOpen />}
                          {group.is_public ? "Lock" : "Unlock"}
                        </button>
                        <button
                          type="button"
                          onClick={() => requestDeleteGroup(group)}
                          className="px-2 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 font-semibold text-xs cursor-pointer"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Messages Moderation */}
        <div className="lg:col-span-7 border border-slate-100 rounded-3xl bg-white shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="bg-slate-50/50 px-5 py-4 border-b border-slate-100 text-xs md:text-sm font-semibold text-slate-700">
            Messages Moderation Panel
          </div>

          <div className="p-5 flex-1 flex flex-col justify-center">
            {!selectedGroup ? (
              /* No selection placeholder state */
              <div className="text-center py-16 flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center text-[#2c6e5f] animate-bounce">
                  <FaComments className="text-2xl" />
                </div>
                <h3 className="font-bold text-slate-700 text-lg">Deselected/No Group Active</h3>
                <p className="text-slate-400 max-w-sm text-sm">
                  Select a support group card from the list to load its moderation feed, inspect student logs, or write official administrative broadcasts.
                </p>
              </div>
            ) : (
              /* Loaded Group Message Board */
              <div className="space-y-5 flex-1 flex flex-col justify-between">
                
                {/* Active Group Header details */}
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                      {selectedGroup.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{selectedGroup.description || "No description provided."}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedGroupId(null)}
                    className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer transition-colors whitespace-nowrap"
                  >
                    Deselect Group
                  </button>
                </div>

                {/* Send/Broadcast admin message text input */}
                <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <textarea
                    rows={2}
                    placeholder="Broadcast an official notice to this support group as Admin..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-slate-700 rounded-xl text-xs md:text-sm bg-white"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={handleSendMessage}
                      disabled={sendingMessage || !messageText.trim()}
                      className="px-4 py-2 bg-[#2c6e5f] hover:bg-[#205045] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {sendingMessage ? (
                        <FaSpinner className="animate-spin text-xs" />
                      ) : (
                        <FaPaperPlane className="text-[10px]" />
                      )}
                      {sendingMessage ? "Broadcasting..." : "Send Announcement"}
                    </button>
                  </div>
                </div>

                {/* Messages feed list */}
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between gap-3 mb-3 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100 text-xs">
                    <span className="font-semibold text-slate-700">Recent Messages</span>
                    
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={toggleSelectAllMessages}
                        disabled={groupMessages.length === 0}
                        className="px-3 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-white transition-colors disabled:opacity-50 font-bold tracking-wide uppercase text-[10px] cursor-pointer"
                      >
                        {selectedMessageIds.length === groupMessages.length && groupMessages.length > 0
                          ? "Deselect All"
                          : "Select All"}
                      </button>
                      
                      {selectedMessageIds.length > 0 && (
                        <button
                          type="button"
                          onClick={requestBulkDeleteMessages}
                          className="px-3 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/50 transition-colors font-bold tracking-wide uppercase text-[10px] flex items-center gap-1.5 cursor-pointer"
                        >
                          <FaTrash className="text-[9px]" />
                          Delete ({selectedMessageIds.length})
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Messages list container */}
                  <div className="max-h-[300px] overflow-y-auto space-y-2.5 pr-1 flex-1">
                    {messagesLoading ? (
                      /* Messages Loading state */
                      <div className="py-8 text-center flex flex-col items-center justify-center text-slate-400 gap-2">
                        <FaSpinner className="animate-spin text-xl text-[#2c6e5f]" />
                        <p className="text-xs">Fetching messages feed...</p>
                      </div>
                    ) : groupMessages.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 italic text-xs border border-dashed border-slate-200 rounded-2xl bg-slate-50/20">
                        No messages inside this room yet.
                      </div>
                    ) : (
                      groupMessages.map((message) => {
                        const isFromAdmin = message.metadata?.fromAdmin;
                        const isSelected = selectedMessageIds.includes(message.id);
                        return (
                          <div
                            key={message.id}
                            className={`p-3 rounded-2xl border transition-all flex gap-3 duration-300 ${
                              isFromAdmin
                                ? "bg-[#f0f7f5] border-[#5bb5a1]/30 ml-8"
                                : "bg-white border-slate-150 mr-8"
                            } ${isSelected ? "ring-2 ring-[#5bb5a1]/40" : ""}`}
                          >
                            {/* Checkbox */}
                            <div className="pt-0.5">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleMessageSelection(message.id)}
                                className="h-3.5 w-3.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                              />
                            </div>

                            {/* Message detail */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <div className="flex items-center gap-1.5">
                                  {isFromAdmin ? (
                                    <>
                                      <span className="w-2 h-2 rounded-full bg-teal-600" />
                                      <span className="text-xs font-bold text-[#2c6e5f] flex items-center gap-1">
                                        <FaUserShield className="text-[10px]" />
                                        Official Notice
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                                      <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                                        <FaGraduationCap className="text-[10px]" />
                                        Student
                                      </span>
                                    </>
                                  )}
                                </div>
                                <span className="text-[9px] text-slate-400 font-medium">
                                  {message.created_at
                                    ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    : "Just now"}
                                </span>
                              </div>

                              <p className="text-xs text-slate-600 break-words leading-relaxed">
                                {message.content}
                              </p>

                              {/* Hover delete button inside cards */}
                              <div className="flex justify-end mt-2 pt-1 border-t border-slate-100/50">
                                <button
                                  type="button"
                                  onClick={() => requestDeleteMessage(message.id)}
                                  className="text-[10px] text-rose-600 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                                >
                                  <FaTrash className="text-[8px]" />
                                  Delete
                                </button>
                              </div>
                            </div>

                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

      </div>

      {/* Confirmation Modal Overlay */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full border border-teal-50 shadow-2xl shadow-slate-950/20 transform transition-all scale-100">
            <div className="flex items-center gap-4 text-rose-600 mb-4 bg-rose-50 p-4 rounded-2xl border border-rose-100">
              <FaExclamationTriangle className="text-2xl shrink-0" />
              <div>
                <h4 className="font-bold text-slate-800 text-sm md:text-base">Confirm Deletion</h4>
                <p className="text-xs text-rose-700 mt-0.5">This action is irreversible.</p>
              </div>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              {deleteConfirm.kind === "group" ? (
                <>
                  Are you sure you want to delete the support group{" "}
                  <strong className="text-slate-800">"{deleteConfirm.name}"</strong>? This will remove the chatroom and all its message history permanently.
                </>
              ) : deleteConfirm.kind === "message" ? (
                "Are you sure you want to delete this message? It will be removed from the chat history permanently."
              ) : (
                `Are you sure you want to delete the ${deleteConfirm.ids?.length} selected messages permanently?`
              )}
            </p>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={cancelDelete}
                className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-5 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/10 cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPeerGroups;
