import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { authService } from "../services/authService";
import {
  FaUsers,
  FaComment,
  FaThumbsUp,
  FaReply,
  FaHeart,
  FaArrowLeft,
} from "react-icons/fa";

// Will be loaded from server (public groups)

const samplePosts = [
  {
    id: 1,
    author: "Sahan P.",
    avatar: "🧑",
    time: "2 hours ago",
    content:
      "Anyone else struggling with time management during finals? I feel like I'm drowning in assignments.",
    likes: 23,
    replies: 12,
    isAnonymous: false,
  },
  {
    id: 2,
    author: "Anonymous",
    avatar: "🎭",
    time: "1 hour ago",
    content:
      "Try the Pomodoro technique! 25 min study, 5 min break. It really helped me stay focused.",
    likes: 45,
    replies: 8,
    isAnonymous: true,
  },
];

const PeerSupportPage = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newPost, setNewPost] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const data = await authService.getPeerGroups({ publicOnly: true });
      setGroups(data || []);
    } catch (err) {
      console.error("Failed to load peer groups", err);
    }
  };

  const joinGroup = async (groupId) => {
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        alert("Please login to join a group.");
        return;
      }
      const resp = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/peer-groups/${groupId}/join`, {
        method: "POST",
        headers: { ...authService.getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });
      const j = await resp.json();
      if (!resp.ok) throw new Error(j.message || "Join failed");
      alert("Joined group");
    } catch (err) {
      alert(err.message || "Failed to join");
    }
  };

  if (selectedGroup) {
    const group = groups.find((g) => g.id === selectedGroup) || selectedGroup;

    return (
      <div className="min-h-screen bg-[#f9f5e7] py-8 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => setSelectedGroup(null)}
            className="text-[#5bb5a1] text-sm flex items-center mb-6 hover:underline"
          >
            <FaArrowLeft className="mr-2" /> Back to Groups
          </button>

          {/* Group Header */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl flex items-center justify-center">
                <span className="text-3xl">{group.icon}</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  {group.name}
                </h1>
                <p className="text-gray-500 mb-2">{group.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded">{group.is_public ? 'Public' : 'Private'}</span>
                  <span className="text-xs text-slate-500">Created: {group.created_at ? new Date(group.created_at).toLocaleDateString() : ''}</span>
                </div>
              </div>
            </div>
          </div>

          {/* New Post Card */}
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
            />
            <div className="flex justify-between items-center">
              <label className="flex items-center text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="mr-2 rounded"
                />
                Post Anonymously
              </label>
              <button className="px-6 py-2 bg-[#5bb5a1] text-white rounded-lg font-medium hover:bg-[#4a9d8b]">
                Post
              </button>
            </div>
          </div>

          {/* Recent Discussions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-4">
              Recent Discussions
            </h2>
            <div className="space-y-6">
              {samplePosts.map((post) => (
                <div
                  key={post.id}
                  className="border-b border-gray-100 pb-6 last:border-0 last:pb-0"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-xl">{post.avatar}</span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-800">
                          {post.author}
                        </span>
                        {post.isAnonymous && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                            Anonymous
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#5bb5a1]">
                        {post.time}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">{post.content}</p>
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <button className="flex items-center space-x-1 hover:text-[#5bb5a1]">
                      <FaThumbsUp /> <span>{post.likes} Like</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-[#5bb5a1]">
                      <FaReply /> <span>{post.replies} Reply</span>
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
        {/* Header */}
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

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div
              key={group.id}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl flex items-center justify-center mb-4">
                <span className="text-3xl">{group.name ? group.name.charAt(0).toUpperCase() : 'G'}</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{group.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{group.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded">{group.is_public ? 'Public' : 'Private'}</span>
                  <span className="text-xs text-slate-500">{group.created_at ? new Date(group.created_at).toLocaleDateString() : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setSelectedGroup(group.id)} className="px-3 py-1 bg-[#5bb5a1] text-white rounded text-sm">View</button>
                  <button onClick={() => joinGroup(group.id)} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Join</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PeerSupportPage;
