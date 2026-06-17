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

  if (selectedGroup) {
    if (!activeGroup) {
      return (
        <div className="min-h-screen bg-[#f9f5e7] py-10 px-6">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setSelectedGroup(null)}
              className="text-[#2c6e5f] text-sm font-bold flex items-center mb-6 hover:underline link-arrow-left"
            >
              <span className="mr-1">←</span> Back to Groups
            </button>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-150 text-center">
              <p className="text-gray-500 font-semibold">
                This group is no longer available.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#f9f5e7] py-10 px-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Back to Catalog button */}
          <button
            onClick={() => setSelectedGroup(null)}
            className="text-[#2c6e5f] text-sm font-bold flex items-center mb-6 hover:underline link-arrow-left cursor-pointer"
          >
            <span className="mr-1">←</span> Back to Groups
          </button>

          {/* Group header details card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm mb-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl flex items-center justify-center animate-float">
                <span className="text-3xl">💬</span>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-extrabold text-gray-800">
                  {activeGroup.name}
                </h1>
                <p className="text-gray-500 text-sm leading-relaxed mt-1 font-semibold">{activeGroup.description}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-400 font-bold mt-3">
                  <span className="flex items-center">
                    <FaUsers className="mr-1.5 text-[#2c6e5f]" /> Public group
                  </span>
                  <span>🏅 Moderated by Admin</span>
                </div>
                
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {isStudent && !isMember && (
                    <div className="flex flex-wrap items-center gap-3">
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
                        className="px-5 py-2 bg-[#2c6e5f] hover:bg-[#1b4d42] text-white rounded-xl font-bold shadow-sm transition-all disabled:opacity-60 cursor-pointer text-xs"
                      >
                        {joining ? "Joining..." : "Join Group"}
                      </motion.button>
                      <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-lg">
                        Join this group first to start posting.
                      </span>
                    </div>
                  )}
                  {isStudent && isMember && (
                    <div className="flex items-center space-x-3">
                      <div className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 px-3.5 py-1 text-xs font-bold shadow-sm animate-pulse">
                        ✓ Joined
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowLeaveConfirm(true)}
                        disabled={leaving}
                        className="px-3.5 py-1 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white border border-red-100 transition-all disabled:opacity-60 cursor-pointer shadow-sm"
                      >
                        {leaving ? "Leaving..." : "Leave Group"}
                      </motion.button>
                    </div>
                  )}
                </div>
                
                {leaveFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 rounded-xl px-4 py-2.5 text-xs font-bold shadow-inner ${
                      leaveFeedback.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {leaveFeedback.message}
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Leave confirm modal popup */}
          <AnimatePresence>
            {showLeaveConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
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
                      className="px-5 py-2 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
                    >
                      {leaving ? "Leaving..." : "Yes, Leave"}
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Posting Composer */}
          {canParticipate && (
            <div className="bg-white rounded-3xl p-6 shadow-sm mb-6 border border-gray-100">
              <h2 className="text-base font-extrabold text-[#1b4d42] mb-4 flex items-center gap-1.5">
                <span>✍️</span> Share with the Group
              </h2>
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2c6e5f]/15 focus:border-[#2c6e5f]/30 resize-none mb-4 text-sm font-semibold leading-relaxed"
                rows={3}
                disabled={posting}
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 font-bold bg-gray-50 px-3 py-1 rounded-lg">
                  🔒 Messages are posted anonymously.
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
                  className="px-6 py-2.5 bg-[#2c6e5f] hover:bg-[#1b4d42] text-white rounded-xl font-bold transition-all disabled:opacity-60 cursor-pointer text-xs shadow-md"
                >
                  {posting ? "Posting..." : "Post Message"}
                </motion.button>
              </div>
            </div>
          )}

          {/* Discussions Thread */}
          {canParticipate && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-base font-extrabold text-[#1b4d42] mb-5 flex items-center gap-1.5">
                <span>💬</span> Recent Discussions
              </h2>
              
              {groupLoading && (
                <div className="text-xs text-gray-400 font-bold flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#2c6e5f]"></div>
                  <span>Loading discussions...</span>
                </div>
              )}
              {!groupLoading && groupError && (
                <div className="text-xs text-red-600 font-semibold">{groupError}</div>
              )}
              {!groupLoading && !groupError && groupMessages.length === 0 && (
                <div className="text-xs text-gray-500 font-semibold bg-gray-50 p-4 rounded-2xl text-center border border-dashed border-gray-150">
                  No messages yet. Be the first to start the conversation!
                </div>
              )}
              
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
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="border-b border-gray-100 pb-6 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center animate-float">
                            <span className="text-xl">🧑</span>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-gray-800 text-sm">
                                {getDisplayName(post)}
                              </span>
                              {post.metadata?.isAnonymous && (
                                <span className="text-[9px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-bold uppercase">
                                  Anonymous
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400 font-bold">
                              {post.created_at
                                ? new Date(post.created_at).toLocaleString()
                                : "Just now"}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 text-sm leading-relaxed font-semibold mb-4 bg-gray-50/35 p-3 rounded-2xl border border-gray-50">{post.content}</p>
                        
                        <div className="flex items-center space-x-5 text-xs text-gray-400 font-bold">
                          <motion.button
                            onClick={() => handleReaction(post.id, "like")}
                            disabled={isReactionLoading}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.9 }}
                            className={`flex items-center space-x-1.5 disabled:opacity-60 cursor-pointer ${
                              likedByCurrentUser
                                ? "text-[#2c6e5f] bg-[#2c6e5f]/5 border-[#2c6e5f]/15 px-2.5 py-1 rounded-xl border"
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
                            className={`flex items-center space-x-1.5 hover:text-[#2c6e5f] cursor-pointer ${
                              replyingTo === post.id
                                ? "text-[#2c6e5f] bg-[#2c6e5f]/5 border-[#2c6e5f]/15 px-2.5 py-1 rounded-xl border"
                                : "bg-transparent"
                            }`}
                          >
                            <FaReply />{" "}
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
                            className={`flex items-center space-x-1.5 disabled:opacity-60 cursor-pointer ${
                              supportedByCurrentUser
                                ? "text-rose-500 bg-rose-50 border-rose-100 px-2.5 py-1 rounded-xl border"
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
                              animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                              exit={{ height: 0, opacity: 0, marginTop: 0 }}
                              className="pl-4 border-l-2 border-[#2c6e5f]/20 overflow-hidden"
                            >
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write a reply..."
                                rows={2}
                                disabled={replyPosting}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2c6e5f]/15 focus:border-[#2c6e5f]/30 resize-none text-xs font-semibold leading-relaxed"
                              />
                              <div className="mt-2 flex justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setReplyingTo(null);
                                    setReplyText("");
                                  }}
                                  className="px-3.5 py-1.5 text-xs font-bold rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 cursor-pointer"
                                  disabled={replyPosting}
                                >
                                  Cancel
                                </button>
                                <motion.button
                                  onClick={() => handleReplySubmit(post.id)}
                                  whileTap={{ scale: 0.95 }}
                                  className="px-4 py-1.5 text-xs font-bold rounded-xl bg-[#2c6e5f] text-white hover:bg-[#1b4d42] disabled:opacity-60 shadow-sm cursor-pointer"
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
                          <div className="mt-4 pl-4 border-l-2 border-gray-100 space-y-3">
                            {replies.map((reply) => (
                              <div
                                key={reply.id}
                                className="bg-gray-50/60 rounded-2xl px-4 py-3 border border-gray-100/50 shadow-inner"
                              >
                                <div className="flex items-center gap-2 text-xs mb-1 font-bold">
                                  <span className="font-bold text-gray-800">
                                    {getDisplayName(reply)}
                                  </span>
                                  <span className="text-[10px] text-gray-400">
                                    {reply.created_at
                                      ? new Date(
                                          reply.created_at,
                                        ).toLocaleString()
                                      : "Just now"}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 leading-relaxed font-semibold">
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
            </div>
          )}

          {!canParticipate && selectedGroup && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center font-bold text-xs text-gray-500">
              🔒 Join this group to unlock posting and discussions.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f5e7] py-10 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header Title section */}
        <div className="flex justify-between items-start mb-8 pb-4 border-b border-[#2c6e5f]/10">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1b4d42] tracking-tight">
              Peer Support Groups
            </h1>
            <p className="text-[#2c6e5f]/80 mt-1 font-medium max-w-2xl leading-relaxed text-sm md:text-base">
              Share your journey, find mutual understanding, and grow together in a safe, compassionate community
            </p>
          </div>
        </div>

        {loading && (
          <div className="bg-white rounded-3xl p-6 shadow-sm text-gray-400 text-xs font-bold flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#2c6e5f]"></div>
            <span>Loading public groups...</span>
          </div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-3xl p-6 shadow-sm text-red-600 text-xs font-semibold">
            {error}
          </div>
        )}

        {!loading && !error && groups.length === 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-sm text-gray-450 text-xs font-bold text-center border border-dashed border-gray-150">
            No public peer support groups have been published yet.
          </div>
        )}

        {/* Catalog Grid Cards */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {groups.map((group) => (
            <motion.div
              key={group.id}
              variants={cardVariants}
              whileHover={{ y: -5 }}
              onClick={() => setSelectedGroup(group.id)}
              className="glass-card p-6 rounded-3xl shadow-sm hover:shadow-md border border-gray-100 bg-white cursor-pointer hover-glow-teal flex flex-col justify-between"
            >
              <div>
                <div className="w-16 h-16 bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl flex items-center justify-center mb-5 animate-float">
                  <span className="text-3xl">💬</span>
                </div>
                <h3 className="text-lg font-extrabold text-gray-800 mb-2 group-hover:text-[#2c6e5f] transition-colors">{group.name}</h3>
                <p className="text-xs text-gray-550 mb-5 leading-relaxed font-semibold">{group.description}</p>
              </div>
              
              <div className="flex items-center space-x-4 text-[10px] text-gray-400 font-bold border-t border-gray-50 pt-4">
                <span className="flex items-center bg-gray-50 px-2.5 py-1 rounded-xl">
                  <FaUsers className="mr-1.5 text-[#2c6e5f]" /> Public
                </span>
                <span className="flex items-center bg-gray-50 px-2.5 py-1 rounded-xl">
                  <FaComment className="mr-1.5 text-[#2c6e5f]" /> Moderated
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default PeerSupportPage;
