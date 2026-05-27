import { useEffect, useMemo, useState } from "react";
import {
  FaUsers,
  FaComment,
  FaThumbsUp,
  FaReply,
  FaHeart,
  FaArrowLeft,
} from "react-icons/fa";
import { authService } from "../services/authService";

const PeerSupportPage = () => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newPost, setNewPost] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
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
      setIsAnonymous(false);
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
      const postedReply = await authService.postPeerGroupMessage(selectedGroup, {
        userId: currentUserId,
        content: replyText.trim(),
        metadata: { replyTo: parentMessageId },
      });

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
        <div className="min-h-screen bg-[#f9f5e7] py-8 px-6">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setSelectedGroup(null)}
              className="text-[#5bb5a1] text-sm flex items-center mb-6 hover:underline"
            >
              <FaArrowLeft className="mr-2" /> Back to Groups
            </button>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <p className="text-gray-600">
                This group is no longer available.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#f9f5e7] py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedGroup(null)}
            className="text-[#5bb5a1] text-sm flex items-center mb-6 hover:underline"
          >
            <FaArrowLeft className="mr-2" /> Back to Groups
          </button>

          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl flex items-center justify-center">
                <span className="text-3xl">💬</span>
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-800">
                  {activeGroup.name}
                </h1>
                <p className="text-gray-500 mb-2">{activeGroup.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span className="flex items-center">
                    <FaUsers className="mr-1" /> Public group
                  </span>
                  <span>🏅 Moderated by Admin</span>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {isStudent && !isMember && (
                    <div className="flex flex-wrap items-center gap-3">
                      <button
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
                        className="px-4 py-2 bg-[#5bb5a1] text-white rounded-lg font-medium hover:bg-[#4a9d8b] disabled:opacity-60"
                      >
                        {joining ? "Joining..." : "Join Group"}
                      </button>
                      <span className="text-sm text-blue-700">
                        Join this group first to start posting.
                      </span>
                    </div>
                  )}
                  {isStudent && isMember && (
                    <div className="flex items-center space-x-3">
                      <div className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-3 py-1 text-sm font-medium">
                        Joined
                      </div>
                      <button
                        onClick={() => setShowLeaveConfirm(true)}
                        disabled={leaving}
                        className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 disabled:opacity-60"
                      >
                        {leaving ? "Leaving..." : "Leave Group"}
                      </button>
                    </div>
                  )}
                </div>
                {leaveFeedback && (
                  <div
                    className={`mt-4 rounded-lg px-4 py-2 text-sm ${
                      leaveFeedback.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {leaveFeedback.message}
                  </div>
                )}
              </div>
            </div>
          </div>

          {showLeaveConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Leave this group?
                </h3>
                <p className="text-sm text-gray-600 mb-5">
                  You can rejoin later, but you will lose access to posting until
                  you join again.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowLeaveConfirm(false)}
                    disabled={leaving}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLeaveGroup}
                    disabled={leaving}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    {leaving ? "Leaving..." : "Yes, Leave"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {canParticipate && (
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
              <h2 className="font-semibold text-gray-800 mb-4">
                Share with the Group
              </h2>
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5bb5a1] resize-none mb-4"
                rows={4}
                disabled={posting}
              />
              <div className="flex justify-between items-center">
                <label className="flex items-center text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="mr-2 rounded"
                    disabled={posting}
                  />
                  Post Anonymously
                </label>
                <button
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
                          metadata: { isAnonymous },
                        },
                      );
                      setGroupMessages((currentMessages) => [
                        posted,
                        ...currentMessages,
                      ]);
                      setNewPost("");
                      setIsAnonymous(false);
                    } catch (err) {
                      alert(err.message || "Failed to post message");
                    } finally {
                      setPosting(false);
                    }
                  }}
                  disabled={posting}
                  className="px-6 py-2 bg-[#5bb5a1] text-white rounded-lg font-medium hover:bg-[#4a9d8b] disabled:opacity-60"
                >
                  {posting ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          )}

          {canParticipate && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-4">
                Recent Discussions
              </h2>
              {groupLoading && (
                <div className="text-sm text-gray-500">
                  Loading discussion...
                </div>
              )}
              {!groupLoading && groupError && (
                <div className="text-sm text-red-600">{groupError}</div>
              )}
              {!groupLoading && !groupError && groupMessages.length === 0 && (
                <div className="text-sm text-gray-500">
                  No messages yet. Start the conversation.
                </div>
              )}
              <div className="space-y-6">
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
                  const supportedByCurrentUser = supportUsers.includes(currentUserId);
                  const isReactionLoading = Boolean(reactionLoadingByMessage[post.id]);

                  return (
                  <div
                    key={post.id}
                    className="border-b border-gray-100 pb-6 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-xl">🧑</span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-800">
                            {getDisplayName(post)}
                          </span>
                          {post.metadata?.isAnonymous && (
                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                              Anonymous
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-[#5bb5a1]">
                          {post.created_at
                            ? new Date(post.created_at).toLocaleString()
                            : "Just now"}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">{post.content}</p>
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <button
                        onClick={() => handleReaction(post.id, "like")}
                        disabled={isReactionLoading}
                        className={`flex items-center space-x-1 disabled:opacity-60 ${
                          likedByCurrentUser
                            ? "text-[#5bb5a1]"
                            : "hover:text-[#5bb5a1]"
                        }`}
                      >
                        <FaThumbsUp />
                        <span>Like {likeUsers.length > 0 ? `(${likeUsers.length})` : ""}</span>
                      </button>
                      <button
                        onClick={() => {
                          setReplyingTo(replyingTo === post.id ? null : post.id);
                          setReplyText("");
                        }}
                        className="flex items-center space-x-1 hover:text-[#5bb5a1]"
                      >
                        <FaReply /> <span>Reply {replies.length > 0 ? `(${replies.length})` : ""}</span>
                      </button>
                      <button
                        onClick={() => handleReaction(post.id, "support")}
                        disabled={isReactionLoading}
                        className={`flex items-center space-x-1 disabled:opacity-60 ${
                          supportedByCurrentUser
                            ? "text-red-500"
                            : "hover:text-red-500"
                        }`}
                      >
                        <FaHeart />
                        <span>
                          Support {supportUsers.length > 0 ? `(${supportUsers.length})` : ""}
                        </span>
                      </button>
                    </div>

                    {replyingTo === post.id && (
                      <div className="mt-4 pl-4 border-l-2 border-gray-200">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write a reply..."
                          rows={2}
                          disabled={replyPosting}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5bb5a1] resize-none"
                        />
                        <div className="mt-2 flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText("");
                            }}
                            className="px-3 py-1 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                            disabled={replyPosting}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleReplySubmit(post.id)}
                            className="px-3 py-1 text-sm rounded-lg bg-[#5bb5a1] text-white hover:bg-[#4a9d8b] disabled:opacity-60"
                            disabled={replyPosting}
                          >
                            {replyPosting ? "Replying..." : "Reply"}
                          </button>
                        </div>
                      </div>
                    )}

                    {replies.length > 0 && (
                      <div className="mt-4 pl-4 border-l-2 border-gray-100 space-y-3">
                        {replies.map((reply) => (
                          <div key={reply.id} className="bg-gray-50 rounded-lg px-3 py-2">
                            <div className="flex items-center gap-2 text-sm mb-1">
                              <span className="font-medium text-gray-800">
                                {getDisplayName(reply)}
                              </span>
                              <span className="text-xs text-[#5bb5a1]">
                                {reply.created_at
                                  ? new Date(reply.created_at).toLocaleString()
                                  : "Just now"}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            </div>
          )}

          {!canParticipate && selectedGroup && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <p className="text-sm text-gray-600">
                Join this group to unlock posting and discussions.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f5e7] py-8 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Peer Support Groups
            </h1>
            <p className="text-gray-500">
              Connect with others in moderated support groups
            </p>
          </div>
        </div>

        {loading && (
          <div className="bg-white rounded-2xl p-6 shadow-sm text-gray-600">
            Loading public groups...
          </div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-2xl p-6 shadow-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && groups.length === 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm text-gray-600">
            No public peer support groups have been published yet.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div
              key={group.id}
              onClick={() => setSelectedGroup(group.id)}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 cursor-pointer"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl flex items-center justify-center mb-4">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{group.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{group.description}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-400">
                <span className="flex items-center">
                  <FaUsers className="mr-1" /> Public
                </span>
                <span className="flex items-center">
                  <FaComment className="mr-1" /> Moderated
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PeerSupportPage;
