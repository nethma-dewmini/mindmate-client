import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUsers,
  FaComment,
  FaThumbsUp,
  FaReply,
  FaHeart,
  FaArrowLeft,
  FaTimes,
  FaSearch,
  FaBars,
} from "react-icons/fa";
import { authService } from "../services/authService";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const PeerSupportPage = () => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newPost, setNewPost] = useState("");
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [groupDetails, setGroupDetails] = useState(null);
  const [groupMessages, setGroupMessages] = useState([]);
  const [groupLoading, setGroupLoading] = useState(false);
  const [groupError, setGroupError] = useState("");
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [leaveFeedback, setLeaveFeedback] = useState(null);
  const [posting, setPosting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyPosting, setReplyPosting] = useState(false);
  const [reactionLoadingByMessage, setReactionLoadingByMessage] = useState({});
  const [animatingReactionMessageId, setAnimatingReactionMessageId] = useState(null);

  // New Interactive Dashboard States
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const currentUser = authService.getCurrentUser();
  const currentUserId = currentUser?.id || currentUser?.user_id || null;
  const isStudent = currentUser?.role === "student";

  useEffect(() => {
    let isMounted = true;

    const loadGroups = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await authService.getPeerGroups({ publicOnly: true });
        if (isMounted) {
          setGroups(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to load peer support groups");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadGroups();

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-select the first group when groups list loads and none is selected
  useEffect(() => {
    if (groups.length > 0 && !selectedGroup) {
      setSelectedGroup(groups[0].id);
    }
  }, [groups, selectedGroup]);

  // Real-time group filtering
  const filteredGroups = useMemo(() => {
    return groups.filter((group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (group.description && group.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [groups, searchQuery]);

  const selectedGroupData = useMemo(
    () => groups.find((group) => group.id === selectedGroup) || null,
    [groups, selectedGroup],
  );

  useEffect(() => {
    if (!selectedGroup) {
      setGroupDetails(null);
      setGroupMessages([]);
      setGroupError("");
      setNewPost("");
      return;
    }

    let isMounted = true;

    const loadGroup = async () => {
      setGroupLoading(true);
      setGroupError("");

      try {
        const [detail, messages] = await Promise.all([
          authService.getPeerGroup(selectedGroup),
          authService.getPeerGroupMessages(selectedGroup),
        ]);

        if (isMounted) {
          setGroupDetails(detail);
          setGroupMessages(Array.isArray(messages) ? messages : []);
        }
      } catch (err) {
        if (isMounted) {
          setGroupError(err.message || "Failed to load group details");
        }
      } finally {
        if (isMounted) {
          setGroupLoading(false);
        }
      }
    };

    loadGroup();

    return () => {
      isMounted = false;
    };
  }, [selectedGroup]);

  const activeGroup = groupDetails || selectedGroupData;
  const isMember = Boolean(
    groupDetails?.members?.some((member) => member.user_id === currentUserId),
  );
  const canParticipate = isStudent && isMember;

  const mainMessages = useMemo(
    () =>
      groupMessages.filter(
        (message) => !message.metadata || !message.metadata.replyTo,
      ),
    [groupMessages],
  );

  const repliesByParentId = useMemo(() => {
    const groupedReplies = {};

    groupMessages.forEach((message) => {
      const parentId = message.metadata?.replyTo;
      if (!parentId) return;

      if (!groupedReplies[parentId]) groupedReplies[parentId] = [];
      groupedReplies[parentId].push(message);
    });

    Object.keys(groupedReplies).forEach((parentId) => {
      groupedReplies[parentId].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at),
      );
    });

    return groupedReplies;
  }, [groupMessages]);

  const getDisplayName = (message) => {
    if (message.metadata?.isAnonymous) return "Anonymous";
    if (message.user_id === currentUserId) return "You";
    if (message.author_role === "admin") return "Admin";
    return message.author_name || "Student";
  };

  const handleReaction = async (messageId, type) => {
    if (!currentUserId) {
      setGroupError("Please log in as a student first.");
      return;
    }

    setReactionLoadingByMessage((current) => ({
      ...current,
      [messageId]: true,
    }));
    
    // Trigger pop bounce animation temporarily
    setAnimatingReactionMessageId(messageId);
    setTimeout(() => setAnimatingReactionMessageId(null), 350);

    try {
      const updatedMessage = await authService.reactToPeerGroupMessage(
        selectedGroup,
        messageId,
        { userId: currentUserId, type },
      );

      setGroupMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === messageId
            ? {
                ...message,
                metadata: updatedMessage.metadata,
              }
            : message,
        ),
      );
    } catch (err) {
      setGroupError(err.message || "Failed to react to message");
    } finally {
      setReactionLoadingByMessage((current) => ({
        ...current,
        [messageId]: false,
      }));
    }
  };

  const handleReplySubmit = async (parentMessageId) => {
    if (!currentUserId) {
      setGroupError("Please log in as a student first.");
      return;
    }

    if (!replyText.trim()) {
      setGroupError("Write a reply before posting.");
      return;
    }

    setReplyPosting(true);
    setGroupError("");

    try {
      const postedReply = await authService.postPeerGroupMessage(
        selectedGroup,
        {
          userId: currentUserId,
          content: replyText.trim(),
          metadata: { replyTo: parentMessageId, isAnonymous: true },
        },
      );

      setGroupMessages((currentMessages) => [postedReply, ...currentMessages]);
      setReplyText("");
      setReplyingTo(null);
    } catch (err) {
      setGroupError(err.message || "Failed to post reply");
    } finally {
      setReplyPosting(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!currentUserId) {
      setLeaveFeedback({
        type: "error",
        message: "Please log in as a student first.",
      });
      return;
    }

    setLeaving(true);
    setLeaveFeedback(null);

    try {
      await authService.leavePeerGroup(selectedGroup, currentUserId);

      const detail = await authService.getPeerGroup(selectedGroup);
      const messages = await authService.getPeerGroupMessages(selectedGroup);
      setGroupDetails(detail);
      setGroupMessages(Array.isArray(messages) ? messages : []);
      setLeaveFeedback({ type: "success", message: "You left the group." });
    } catch (err) {
      setLeaveFeedback({
        type: "error",
        message: err.message || "Failed to leave group",
      });
    } finally {
      setLeaving(false);
      setShowLeaveConfirm(false);
    }
  };

  if (selectedGroup && !activeGroup && groupLoading) {
    return (
      <div className="min-h-screen bg-[#f9f5e7] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2c6e5f]"></div>
          <p className="text-gray-550 font-bold animate-pulse">Loading peer group...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f5e7] py-6 px-4 md:px-8">
      <div className="max-w-7xl mx-auto bg-white rounded-[32px] shadow-md border border-gray-100 overflow-hidden flex flex-col md:flex-row min-h-[85vh] h-[85vh] relative">
        {/* Mobile Sidebar Overlay Backdrop */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Left Sidebar Pane: Groups Selector */}
        <div
          className={`fixed inset-y-0 left-0 bg-[#edf5f3] flex flex-col h-full z-45 transition-all duration-300 md:relative md:translate-x-0 md:opacity-100 ${
            isSidebarOpen
              ? "translate-x-0 w-80 opacity-100 border-r border-[#d8ebe7]"
              : "-translate-x-full w-0 opacity-0 pointer-events-none md:w-80 md:opacity-100 md:pointer-events-auto md:border-r md:border-[#d8ebe7]"
          }`}
        >
          {/* Sidebar Header */}
          <div className="p-5 border-b border-[#d8ebe7] flex justify-between items-center bg-white/50 backdrop-blur-md">
            <span className="font-extrabold text-gray-700 flex items-center space-x-2">
              <FaUsers className="text-[#2c6e5f] text-lg animate-pulse" />
              <span className="text-sm uppercase tracking-wider">Support Groups</span>
            </span>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 text-gray-450 hover:text-gray-650 md:hidden hover:bg-white/60 rounded-lg transition-colors cursor-pointer"
            >
              <FaTimes />
            </button>
          </div>

          {/* Search bar inside Sidebar */}
          <div className="p-4 border-b border-[#d8ebe7] bg-white/35">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search groups..."
                className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2c6e5f]/15 focus:border-[#2c6e5f]/30 transition-all"
              />
              <span className="absolute left-3 top-2.5 text-gray-400 text-xs">
                <FaSearch />
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1.5 text-gray-400 hover:text-gray-600 text-sm cursor-pointer"
                >
                  &times;
                </button>
              )}
            </div>
          </div>

          {/* Catalog / Sidebar List */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex-1 overflow-y-auto p-4 space-y-2"
          >
            {loading ? (
              <div className="flex items-center justify-center py-8 text-xs text-gray-450 font-bold gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#2c6e5f]"></div>
                <span>Loading groups...</span>
              </div>
            ) : error ? (
              <p className="text-xs text-red-500 text-center font-semibold p-2">{error}</p>
            ) : filteredGroups.length === 0 ? (
              <p className="text-xs text-gray-450 text-center font-bold py-6">No groups found</p>
            ) : (
              filteredGroups.map((group) => {
                const isActive = group.id === selectedGroup;
                const isGroupMember = group.members?.some(m => m.user_id === currentUserId) || 
                                      (selectedGroup === group.id && isMember);
                
                return (
                  <motion.div
                    key={group.id}
                    variants={cardVariants}
                    whileHover={{ x: 3 }}
                    onClick={() => {
                      setSelectedGroup(group.id);
                      setIsSidebarOpen(false);
                    }}
                    className={`p-3.5 rounded-2xl transition-all cursor-pointer border flex flex-col justify-between ${
                      isActive
                        ? "bg-[#2c6e5f] text-white shadow-sm border-[#2c6e5f]"
                        : "hover:bg-[#e2edea] bg-white/40 border-[#e5f0ed] text-gray-700"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl mt-0.5">💬</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 justify-between">
                          <h4 className={`text-sm font-extrabold truncate ${isActive ? "text-white" : "text-gray-800"}`}>
                            {group.name}
                          </h4>
                          {isGroupMember && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                              isActive ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            }`}>
                              Joined
                            </span>
                          )}
                        </div>
                        <p className={`text-xs line-clamp-2 mt-1 font-semibold leading-normal ${
                          isActive ? "text-white/80" : "text-gray-500"
                        }`}>
                          {group.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </div>

        {/* Right Pane: Selected Group Details & Discussions */}
        <div className="flex-1 flex flex-col h-full min-w-0 bg-white">
          {groupLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50/20">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2c6e5f]"></div>
                <p className="text-xs text-gray-400 font-bold animate-pulse">Loading discussion thread...</p>
              </div>
            </div>
          ) : activeGroup ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Header inside thread */}
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white flex-shrink-0 z-10 shadow-sm">
                <div className="flex items-center min-w-0">
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 bg-gray-50 text-[#2c6e5f] rounded-xl hover:bg-gray-100 md:hidden cursor-pointer mr-3 shadow-sm border border-gray-150"
                  >
                    <FaBars className="text-base" />
                  </button>
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0 mr-3 shadow-sm animate-float">
                    <span className="text-xl">💬</span>
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-extrabold text-gray-800 truncate leading-tight">
                      {activeGroup.name}
                    </h2>
                    <p className="text-xs text-gray-500 truncate font-semibold mt-0.5">
                      {activeGroup.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <span className="hidden sm:inline-flex items-center text-xs bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-xl text-gray-400 font-bold gap-1">
                    <FaUsers className="text-[#2c6e5f]" /> Public group
                  </span>
                  
                  {isStudent && !isMember && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={async () => {
                        if (!currentUserId) {
                          alert("Please log in as a student first.");
                          return;
                        }

                        setJoining(true);
                        try {
                          await authService.joinPeerGroup(
                            selectedGroup,
                            currentUserId,
                          );
                          const detail =
                            await authService.getPeerGroup(selectedGroup);
                          setGroupDetails(detail);
                        } catch (err) {
                          alert(err.message || "Failed to join group");
                        } finally {
                          setJoining(false);
                        }
                      }}
                      disabled={joining}
                      className="px-4 py-2 bg-[#2c6e5f] hover:bg-[#1b4d42] text-white rounded-xl font-bold shadow-sm transition-all disabled:opacity-60 cursor-pointer text-sm uppercase tracking-wider"
                    >
                      {joining ? "Joining..." : "Join Group"}
                    </motion.button>
                  )}
                  
                  {isStudent && isMember && (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 px-2.5 py-1 text-sm font-bold shadow-sm">
                        ✓ Joined
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowLeaveConfirm(true)}
                        disabled={leaving}
                        className="px-2.5 py-1 bg-red-50 text-red-650 rounded-xl text-sm font-bold hover:bg-red-500 hover:text-white border border-red-100 transition-all disabled:opacity-60 cursor-pointer shadow-sm"
                      >
                        Leave
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>

              {/* Feed Area (Composer + Discussion) */}
              <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6 bg-gray-50/25">
                {leaveFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl px-4 py-2.5 text-sm font-bold shadow-inner ${
                      leaveFeedback.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {leaveFeedback.message}
                  </motion.div>
                )}

                {/* Posting Composer */}
                {canParticipate && (
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex-shrink-0 transition-all hover:shadow-md">
                    <textarea
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      placeholder={`Post to #${activeGroup.name}...`}
                      className="w-full px-3 py-2 rounded-xl border border-gray-150 focus:outline-none focus:ring-2 focus:ring-[#2c6e5f]/15 focus:border-[#2c6e5f]/30 resize-none mb-3 text-sm font-semibold leading-relaxed"
                      rows={2}
                      disabled={posting}
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 font-bold bg-gray-55 px-2.5 py-1 rounded-lg">
                        🔒 Anonymous Post
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={async () => {
                          if (!currentUserId) {
                            alert("Please log in as a student first.");
                            return;
                          }
                          if (!newPost.trim()) {
                            alert("Write a message before posting.");
                            return;
                          }

                          setPosting(true);
                          try {
                            const posted = await authService.postPeerGroupMessage(
                              selectedGroup,
                              {
                                userId: currentUserId,
                                content: newPost.trim(),
                                metadata: { isAnonymous: true },
                              },
                            );
                            setGroupMessages((currentMessages) => [
                              posted,
                              ...currentMessages,
                            ]);
                            setNewPost("");
                          } catch (err) {
                            alert(err.message || "Failed to post message");
                          } finally {
                            setPosting(false);
                          }
                        }}
                        disabled={posting}
                        className="px-4 py-2 bg-[#2c6e5f] hover:bg-[#1b4d42] text-white rounded-xl font-bold transition-all disabled:opacity-60 cursor-pointer text-xs shadow-sm uppercase tracking-wider"
                      >
                        {posting ? "Posting..." : "Post Message"}
                      </motion.button>
                    </div>
                  </div>
                )}

                {/* Discussions List */}
                {canParticipate ? (
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <h3 className="text-sm font-extrabold text-[#1b4d42] mb-4 uppercase tracking-wider">
                      Recent Discussions
                    </h3>
                    
                    {groupError && (
                      <div className="text-sm text-red-650 font-semibold p-2">{groupError}</div>
                    )}
                    
                    {groupMessages.length === 0 ? (
                      <div className="text-sm text-gray-500 font-semibold bg-gray-55 p-4 rounded-xl text-center border border-dashed border-gray-150">
                        No messages yet. Be the first to start the conversation!
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <AnimatePresence initial={false}>
                          {mainMessages.map((post) => {
                            const replies = repliesByParentId[post.id] || [];
                            const reactions = post.metadata?.reactions || {};
                            const likeUsers = Array.isArray(reactions.like)
                              ? reactions.like
                              : [];
                            const supportUsers = Array.isArray(reactions.support)
                              ? reactions.support
                              : [];
                            const likedByCurrentUser = likeUsers.includes(currentUserId);
                            const supportedByCurrentUser =
                              supportUsers.includes(currentUserId);
                            const isReactionLoading = Boolean(
                              reactionLoadingByMessage[post.id],
                            );
                            const isPopAnimating = animatingReactionMessageId === post.id;

                            return (
                              <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="border-b border-gray-100 pb-5 last:border-0 last:pb-0"
                              >
                                <div className="flex items-center space-x-3 mb-2">
                                  <div className="w-8 h-8 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center shrink-0">
                                    <span className="text-base">🧑</span>
                                  </div>
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <span className="font-bold text-gray-800 text-sm">
                                        {getDisplayName(post)}
                                      </span>
                                      {post.metadata?.isAnonymous && (
                                        <span className="text-[10px] bg-gray-100 text-gray-450 px-2 py-0.5 rounded font-bold uppercase shrink-0">
                                          Anon
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-bold block mt-0.5">
                                      {post.created_at
                                        ? new Date(post.created_at).toLocaleString()
                                        : "Just now"}
                                    </span>
                                  </div>
                                </div>
                                
                                <p className="text-gray-700 text-sm leading-relaxed font-semibold mb-3 bg-gray-50/40 p-3.5 rounded-xl border border-gray-50">
                                  {post.content}
                                </p>
                                
                                <div className="flex items-center space-x-4 text-xs text-gray-450 font-bold">
                                  <motion.button
                                    onClick={() => handleReaction(post.id, "like")}
                                    disabled={isReactionLoading}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.9 }}
                                    className={`flex items-center space-x-1 cursor-pointer ${
                                      likedByCurrentUser
                                        ? "text-[#2c6e5f] bg-[#2c6e5f]/5 border-[#2c6e5f]/15 px-2 py-0.5 rounded-lg border"
                                        : "hover:text-[#2c6e5f] bg-transparent"
                                    } ${isPopAnimating ? "animate-pop" : ""}`}
                                  >
                                    <FaThumbsUp />
                                    <span>
                                      Like{" "}
                                      {likeUsers.length > 0
                                        ? `(${likeUsers.length})`
                                        : ""}
                                    </span>
                                  </motion.button>
                                  
                                  <motion.button
                                    onClick={() => {
                                      setReplyingTo(
                                        replyingTo === post.id ? null : post.id,
                                      );
                                      setReplyText("");
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.9 }}
                                    className={`flex items-center space-x-1 cursor-pointer ${
                                      replyingTo === post.id
                                        ? "text-[#2c6e5f] bg-[#2c6e5f]/5 border-[#2c6e5f]/15 px-2 py-0.5 rounded-lg border"
                                        : "bg-transparent"
                                    }`}
                                  >
                                    <FaReply />
                                    <span>
                                      Reply{" "}
                                      {replies.length > 0 ? `(${replies.length})` : ""}
                                    </span>
                                  </motion.button>
                                  
                                  <motion.button
                                    onClick={() => handleReaction(post.id, "support")}
                                    disabled={isReactionLoading}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.9 }}
                                    className={`flex items-center space-x-1 cursor-pointer ${
                                      supportedByCurrentUser
                                        ? "text-rose-500 bg-rose-50 border-rose-100 px-2 py-0.5 rounded-lg border"
                                        : "hover:text-rose-500 bg-transparent"
                                    } ${isPopAnimating ? "animate-pop" : ""}`}
                                  >
                                    <FaHeart />
                                    <span>
                                      Support{" "}
                                      {supportUsers.length > 0
                                        ? `(${supportUsers.length})`
                                        : ""}
                                    </span>
                                  </motion.button>
                                </div>

                                {/* Slide-down Reply input form */}
                                <AnimatePresence>
                                  {replyingTo === post.id && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                      animate={{ height: "auto", opacity: 1, marginTop: 12 }}
                                      exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                      className="pl-3 border-l-2 border-[#2c6e5f]/20 overflow-hidden"
                                    >
                                      <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Write a reply..."
                                        rows={2}
                                        disabled={replyPosting}
                                        className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2c6e5f]/15 focus:border-[#2c6e5f]/30 resize-none text-sm font-semibold leading-relaxed"
                                      />
                                      <div className="mt-2 flex justify-end gap-2">
                                        <button
                                          onClick={() => {
                                            setReplyingTo(null);
                                            setReplyText("");
                                          }}
                                          className="px-3 py-1 text-xs font-bold rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 cursor-pointer"
                                          disabled={replyPosting}
                                        >
                                          Cancel
                                        </button>
                                        <motion.button
                                          onClick={() => handleReplySubmit(post.id)}
                                          whileTap={{ scale: 0.95 }}
                                          className="px-3.5 py-1 text-xs font-bold rounded-lg bg-[#2c6e5f] text-white hover:bg-[#1b4d42] disabled:opacity-60 shadow-sm cursor-pointer"
                                          disabled={replyPosting}
                                        >
                                          {replyPosting ? "Replying..." : "Reply"}
                                        </motion.button>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>

                                {/* Nested replies list */}
                                {replies.length > 0 && (
                                  <div className="mt-3 pl-3 border-l-2 border-gray-100 space-y-2">
                                    {replies.map((reply) => (
                                      <div
                                        key={reply.id}
                                        className="bg-gray-50/50 rounded-xl px-3 py-2 border border-gray-100 shadow-inner"
                                      >
                                        <div className="flex items-center gap-1.5 text-xs mb-1 font-bold">
                                          <span className="text-gray-800">
                                            {getDisplayName(reply)}
                                          </span>
                                          <span className="text-[10px] text-gray-400 font-bold">
                                            {reply.created_at
                                              ? new Date(reply.created_at).toLocaleString()
                                              : "Just now"}
                                          </span>
                                        </div>
                                        <p className="text-sm text-gray-650 leading-relaxed font-semibold">
                                          {reply.content}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center font-bold text-sm text-gray-400 flex flex-col items-center justify-center py-12 gap-3">
                    <span className="text-3xl">🔒</span>
                    <div>
                      <p className="text-gray-800 font-extrabold mb-1">Locked Discussion Board</p>
                      <p className="text-xs text-gray-450 leading-relaxed max-w-xs font-semibold">
                        You have not joined this group yet. Join the group using the button above to view past discussions and share posts.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/15">
              <div className="max-w-sm space-y-4">
                <div className="w-16 h-16 bg-[#2c6e5f]/10 rounded-full flex items-center justify-center mx-auto text-3xl animate-float">
                  💬
                </div>
                <h3 className="text-base font-extrabold text-gray-800">No Group Selected</h3>
                <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                  Select a support group from the left sidebar to load the conversation thread. Connect and share anonymously with other students!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Leave confirm modal popup (remains mounted globally) */}
      <AnimatePresence>
        {showLeaveConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40"
              onClick={() => setShowLeaveConfirm(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl z-50 border border-gray-100 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4 mx-auto animate-bounce">
                <span className="text-xl font-bold">🚪</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Leave this group?
              </h3>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed font-semibold">
                You can rejoin later, but you will lose access to posting
                until you join again.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowLeaveConfirm(false)}
                  disabled={leaving}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLeaveGroup}
                  disabled={leaving}
                  className="px-5 py-2 text-xs font-bold text-white bg-red-500 hover:bg-red-650 rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
                >
                  {leaving ? "Leaving..." : "Yes, Leave"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PeerSupportPage;
