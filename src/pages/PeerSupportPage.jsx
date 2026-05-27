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
  const [posting, setPosting] = useState(false);

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
                <div className="mt-4 flex items-center gap-3">
                  {isStudent && !isMember && (
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
                          const detail = await authService.getPeerGroup(
                            selectedGroup,
                          );
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
                  )}
                  {isStudent && isMember && (
                    <div className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-3 py-1 text-sm font-medium">
                      Joined
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="font-semibold text-gray-800 mb-4">
              Share with the Group
            </h2>
            {!isStudent && (
              <div className="mb-4 rounded-xl bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                Only logged-in students can join and post in peer groups.
              </div>
            )}
            {isStudent && !isMember && (
              <div className="mb-4 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800">
                Join this group first to start posting.
              </div>
            )}
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5bb5a1] resize-none mb-4"
              rows={4}
              disabled={!isStudent || !isMember || posting}
            />
            <div className="flex justify-between items-center">
              <label className="flex items-center text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="mr-2 rounded"
                  disabled={!isStudent || !isMember || posting}
                />
                Post Anonymously
              </label>
              <button
                onClick={async () => {
                  if (!currentUserId) {
                    alert("Please log in as a student first.");
                    return;
                  }
                  if (!isMember) {
                    alert("Join the group before posting.");
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
                disabled={!isStudent || !isMember || posting}
                className="px-6 py-2 bg-[#5bb5a1] text-white rounded-lg font-medium hover:bg-[#4a9d8b] disabled:opacity-60"
              >
                {posting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-4">
              Recent Discussions
            </h2>
            {groupLoading && (
              <div className="text-sm text-gray-500">Loading discussion...</div>
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
              {groupMessages.map((post) => (
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
                          {post.metadata?.isAnonymous
                            ? "Anonymous"
                            : post.user_id === currentUserId
                              ? "You"
                              : "Student"}
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
                    <button className="flex items-center space-x-1 hover:text-[#5bb5a1]">
                      <FaThumbsUp /> <span>Like</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-[#5bb5a1]">
                      <FaReply /> <span>Reply</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-red-500">
                      <FaHeart /> <span>Support</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
