import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaUsers,
  FaComment,
  FaThumbsUp,
  FaReply,
  FaHeart,
  FaArrowLeft,
} from "react-icons/fa";

const groups = [
  {
    id: 1,
    name: "Exam Stress Support",
    description: "Share strategies and support each other through exam periods",
    members: 234,
    posts: 567,
    moderator: "Dr. Silva",
    icon: "📚",
  },
  {
    id: 2,
    name: "Anxiety Management",
    description: "A safe space to discuss anxiety and coping strategies",
    members: 189,
    posts: 423,
    moderator: "Dr. Perera",
    icon: "🧘",
  },
  {
    id: 3,
    name: "Work-Life Balance",
    description: "Tips and support for maintaining balance in your life",
    members: 156,
    posts: 312,
    moderator: "Dr. Fernando",
    icon: "⚖️",
  },
];

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
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newPost, setNewPost] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  if (selectedGroup) {
    const group = groups.find((g) => g.id === selectedGroup);

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
                  <span className="flex items-center">
                    <FaUsers className="mr-1" /> {group.members} members
                  </span>
                  <span className="flex items-center">
                    <FaComment className="mr-1" /> {group.posts} posts
                  </span>
                  <span>🏅 Moderated by {group.moderator}</span>
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
              onClick={() => setSelectedGroup(group.id)}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 cursor-pointer"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl flex items-center justify-center mb-4">
                <span className="text-3xl">{group.icon}</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{group.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{group.description}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-400">
                <span className="flex items-center">
                  <FaUsers className="mr-1" /> {group.members} members
                </span>
                <span className="flex items-center">
                  <FaComment className="mr-1" /> {group.posts} posts
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
