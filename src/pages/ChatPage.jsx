import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPaperPlane,
  FaUser,
  FaComments,
  FaRegTrashAlt,
  FaPlus,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { authService } from "../services/authService";

const ChatPage = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [deleteSessionId, setDeleteSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  const suggestedPrompts = [
    "I'm feeling anxious",
    "I need someone to talk to",
    "I'm stressed about studies",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auth and initial sessions load
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!authService.isAuthenticated()) {
      navigate("/login");
      return;
    }

    if (user?.role !== "student") {
      alert("Only students are allowed to access the AI Chatbot companion.");
      if (user?.role === "expert") {
        navigate("/expert/dashboard");
      } else if (user?.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
      return;
    }

    const loadInitialData = async () => {
      try {
        setIsLoadingSessions(true);
        const fetchedSessions = await authService.getChatbotSessions();
        setSessions(fetchedSessions);

        if (fetchedSessions && fetchedSessions.length > 0) {
          setActiveSessionId(fetchedSessions[0].id);
        } else {
          const newSession = await authService.createChatbotSession("New Conversation");
          setSessions([newSession]);
          setActiveSessionId(newSession.id);
        }
      } catch (err) {
        console.error("Failed to load chatbot data:", err);
      } finally {
        setIsLoadingSessions(false);
      }
    };

    loadInitialData();
  }, [navigate]);

  // Load messages when active session changes
  useEffect(() => {
    if (!activeSessionId) return;

    const loadMessages = async () => {
      try {
        setIsLoadingMessages(true);
        const history = await authService.getChatbotSessionMessages(activeSessionId);
        if (history && history.length > 0) {
          const mapped = history.map((msg) => ({
            id: msg.id,
            type: msg.role === "assistant" ? "bot" : "user",
            content: msg.content,
            timestamp: new Date(msg.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          }));
          setMessages(mapped);
        } else {
          setMessages([
            {
              id: "default-greeting",
              type: "bot",
              content:
                "Hello! I'm MindMate, your mental health companion. How are you feeling today?",
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ]);
        }
      } catch (err) {
        console.error(`Failed to load messages for session ${activeSessionId}:`, err);
        setMessages([
          {
            id: "default-greeting",
            type: "bot",
            content:
              "Hello! I'm MindMate, your mental health companion. How are you feeling today?",
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadMessages();
  }, [activeSessionId]);

  const handleStartNewChat = async () => {
    try {
      setIsTyping(false);
      const newSession = await authService.createChatbotSession("New Conversation");
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      setIsSidebarOpen(false);
    } catch (err) {
      console.error("Failed to start new chat:", err);
      alert("Failed to create new conversation. Please try again.");
    }
  };

  const handleDeleteSession = (sessionId, e) => {
    e.stopPropagation();
    setDeleteSessionId(sessionId);
  };

  const confirmDeleteSession = async () => {
    if (!deleteSessionId) return;

    try {
      await authService.deleteChatbotSession(deleteSessionId);

      const updatedSessions = sessions.filter((s) => s.id !== deleteSessionId);
      setSessions(updatedSessions);

      if (activeSessionId === deleteSessionId) {
        if (updatedSessions.length > 0) {
          setActiveSessionId(updatedSessions[0].id);
        } else {
          const newSession = await authService.createChatbotSession("New Conversation");
          setSessions([newSession]);
          setActiveSessionId(newSession.id);
        }
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err);
      alert("Failed to delete conversation. Please try again.");
    } finally {
      setDeleteSessionId(null);
    }
  };

  const handleSendMessage = async (message = inputMessage) => {
    if (!message.trim() || isTyping || !activeSessionId) return;

    const tempUserMsgId = `temp-user-${Date.now()}`;
    const userMessage = {
      id: tempUserMsgId,
      type: "user",
      content: message.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const response = await authService.sendMessageToChatbotSession(
        activeSessionId,
        message.trim()
      );
      const botMsg = response.botMessage;
      const userMsg = response.userMessage;

      const botMessage = {
        id: botMsg.id,
        type: "bot",
        content: botMsg.content,
        timestamp: new Date(botMsg.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== tempUserMsgId);
        const realUserMsg = {
          id: userMsg.id,
          type: "user",
          content: userMsg.content,
          timestamp: new Date(userMsg.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        return [...filtered, realUserMsg, botMessage];
      });

      const activeSession = sessions.find((s) => s.id === activeSessionId);
      if (
        activeSession &&
        (activeSession.title === "New Conversation" || activeSession.title === "New Chat")
      ) {
        const trimmedMsg = message.trim();
        const newTitle = trimmedMsg.length > 25 ? trimmedMsg.slice(0, 25) + "..." : trimmedMsg;
        setSessions((prev) =>
          prev.map((s) => (s.id === activeSessionId ? { ...s, title: newTitle } : s))
        );
      }
    } catch (err) {
      console.error("Failed to send message to chatbot:", err);
      const botMessage = {
        id: `error-${Date.now()}`,
        type: "bot",
        content: "I'm sorry, I had trouble sending your message. Please try again.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoadingSessions) {
    return (
      <div className="min-h-screen bg-[#f9f5e7] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2c6e5f]"></div>
          <p className="text-gray-500 font-bold animate-pulse">Loading MindMate companion...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#f9f5e7] flex overflow-hidden">
      {/* Mobile Sidebar Overlay Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar Pane */}
      <div
        className={`fixed inset-y-0 left-0 bg-[#edf5f3] flex flex-col h-full z-30 transition-all duration-300 md:relative ${
          isSidebarVisible
            ? "translate-x-0 w-80 opacity-100 border-r border-[#d8ebe7]"
            : "-translate-x-full w-0 opacity-0 pointer-events-none border-r-0 md:w-0 md:opacity-0 md:-translate-x-full"
        } ${isSidebarOpen ? "translate-x-0 w-80 opacity-100 border-r border-[#d8ebe7] pointer-events-auto" : ""}`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#d8ebe7] flex justify-between items-center bg-white/50 backdrop-blur-md">
          <span className="font-bold text-gray-700 flex items-center space-x-2">
            <FaComments className="text-[#2c6e5f] text-lg" />
            <span>Chat Histories</span>
          </span>
          {/* Mobile close sidebar button */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600 md:hidden hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <FaTimes />
          </button>
          {/* Desktop close sidebar button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSidebarVisible(false)}
            className="hidden md:flex p-1.5 text-gray-400 hover:text-[#2c6e5f] hover:bg-white/65 rounded-lg transition-all cursor-pointer border border-gray-200/60 bg-white shadow-sm"
            title="Close sidebar"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
              <line x1="9" y1="3" x2="9" y2="21" />
              <path d="M16 15l-3-3 3-3" />
            </svg>
          </motion.button>
        </div>

        {/* Action Button: Start New Chat */}
        <div className="p-4">
          <motion.button
            onClick={handleStartNewChat}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-[#2c6e5f] hover:bg-[#1b4d42] text-white rounded-xl py-3 px-4 flex items-center justify-center space-x-2 font-bold shadow-sm transition-all cursor-pointer text-sm"
          >
            <FaPlus className="text-xs" />
            <span>New Chat</span>
          </motion.button>
        </div>

        {/* Conversations Scrollable List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {sessions.map((session) => {
            const isActive = session.id === activeSessionId;
            return (
              <motion.div
                key={session.id}
                whileHover={{ x: 3 }}
                onClick={() => {
                  setActiveSessionId(session.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all cursor-pointer group border ${
                  isActive
                    ? "bg-[#2c6e5f] text-white shadow-sm font-semibold border-[#2c6e5f]"
                    : "hover:bg-[#e2edea] text-gray-700 bg-white/40 border-[#e5f0ed]"
                }`}
              >
                <div className="flex items-center space-x-3 overflow-hidden mr-2">
                  <span className="text-base flex-shrink-0">🤖</span>
                  <span className="text-sm truncate block leading-normal">{session.title}</span>
                </div>
                <motion.button
                  onClick={(e) => handleDeleteSession(session.id, e)}
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer flex-shrink-0 ${
                    isActive
                      ? "text-teal-100 hover:text-white hover:bg-teal-600/40"
                      : "text-gray-400 hover:text-rose-500 hover:bg-rose-50 md:opacity-0 md:group-hover:opacity-100"
                  }`}
                  title="Delete Conversation"
                >
                  <FaRegTrashAlt className="text-xs" />
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Right Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Main Header */}
        <div className="gradient-premium-header py-4 px-6 shadow-sm border-b border-[#2c6e5f]/10 flex justify-between items-center z-10 flex-shrink-0">
          <div className="flex items-center space-x-3">
            {/* Mobile Menu Bars toggle */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 bg-white/20 text-[#2c6e5f] rounded-xl hover:bg-white/30 md:hidden cursor-pointer"
            >
              <FaBars className="text-lg animate-bounce" style={{ animationDuration: "3s" }} />
            </button>
            {/* Desktop Sidebar Toggle Button (Only visible when sidebar is hidden to allow reopening) */}
            {!isSidebarVisible && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSidebarVisible(true)}
                className="hidden md:flex p-2 text-gray-500 hover:text-[#2c6e5f] hover:bg-white/60 rounded-xl transition-all cursor-pointer border border-[#2c6e5f]/15 shadow-sm bg-white"
                title="Open sidebar"
              >
                <svg
                  className="w-5 h-5 animate-pulse"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                  <path d="M13 9l3 3-3 3" />
                </svg>
              </motion.button>
            )}
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md border border-[#2c6e5f]/15 animate-float">
              <span className="text-xl">🤖</span>
            </div>
            <div>
              <h1 className="font-extrabold text-[#1b4d42] text-base leading-tight">
                MindMate AI Assistant
              </h1>
              <p className="text-[10px] text-gray-500 font-semibold mt-0.5">
                Always here to support you
              </p>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link
              to="/experts"
              className="px-4 py-2 bg-[#2c6e5f] text-white text-xs font-bold rounded-2xl hover:bg-[#1b4d42] transition-all shadow-sm hover-glow-teal"
            >
              Connect to Expert
            </Link>
          </motion.div>
        </div>

        {/* Message Window Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-[#f9f5e7]">
          {isLoadingMessages ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2c6e5f]"></div>
                <p className="text-xs text-gray-400">Loading conversation...</p>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 240, damping: 20 }}
                    className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex items-end space-x-3 max-w-[75%] ${
                        message.type === "user" ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                    >
                      {message.type === "bot" && (
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-100 animate-float">
                          <span className="text-sm">🤖</span>
                        </div>
                      )}
                      <div>
                        <div
                          className={`px-4 py-3 rounded-2xl whitespace-pre-wrap ${
                            message.type === "user"
                              ? "bg-[#2c6e5f] text-white rounded-br-none shadow-sm font-semibold"
                              : "bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100 font-semibold leading-relaxed"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <p
                          className={`text-[9px] text-gray-400 mt-1 font-bold ${
                            message.type === "user" ? "text-right" : ""
                          }`}
                        >
                          {message.timestamp}
                        </p>
                      </div>
                      {message.type === "user" && (
                        <div className="w-8 h-8 bg-[#e8f5f1] rounded-full flex items-center justify-center flex-shrink-0 border border-[#d2ebe4] shadow-sm">
                          <FaUser className="text-[#2c6e5f] text-xs" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-end space-x-3">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm animate-pulse">
                      <span className="text-sm">🤖</span>
                    </div>
                    <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 shadow-sm border border-gray-100">
                      <div className="flex space-x-1.5 py-1 px-0.5">
                        <div
                          className="w-2.5 h-2.5 bg-[#2c6e5f]/60 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="w-2.5 h-2.5 bg-[#2c6e5f]/80 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="w-2.5 h-2.5 bg-[#2c6e5f] rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Suggested Prompt Buttons */}
        {!isLoadingMessages && messages.length <= 1 && (
          <div className="px-6 pb-2 bg-[#f9f5e7]">
            <div className="max-w-3xl mx-auto">
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestedPrompts.map((prompt, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, type: "spring", stiffness: 220 }}
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSendMessage(prompt)}
                    disabled={isTyping}
                    className="px-4 py-2.5 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-600 hover:text-[#2c6e5f] hover:border-[#2c6e5f]/25 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input Text Form Area */}
        <div className="bg-white border-t border-gray-150 p-4 flex-shrink-0">
          <div className="max-w-3xl mx-auto flex items-center space-x-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isTyping || isLoadingMessages}
              placeholder={
                isTyping
                  ? "MindMate is processing..."
                  : isLoadingMessages
                    ? "Loading session..."
                    : "Type your message..."
              }
              className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2c6e5f]/15 focus:bg-white focus:border-[#2c6e5f]/30 transition-all text-sm disabled:opacity-60 font-semibold"
            />
            <motion.button
              onClick={() => handleSendMessage()}
              whileHover={
                inputMessage.trim() && !isTyping && !isLoadingMessages ? { scale: 1.05 } : {}
              }
              whileTap={
                inputMessage.trim() && !isTyping && !isLoadingMessages ? { scale: 0.95 } : {}
              }
              disabled={!inputMessage.trim() || isTyping || isLoadingMessages}
              className={`px-5 py-3 rounded-xl font-bold text-sm flex items-center space-x-1.5 transition-all shadow-md active:scale-95 cursor-pointer ${
                inputMessage.trim() && !isTyping && !isLoadingMessages
                  ? "bg-[#2c6e5f] text-white hover:bg-[#1b4d42] hover:shadow-lg"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
              }`}
            >
              <span>Send</span>
              <FaPaperPlane className="text-xs" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteSessionId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity"
              onClick={() => setDeleteSessionId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="relative w-full max-w-sm mx-auto my-6 p-6 bg-white rounded-3xl shadow-xl z-50 border border-gray-100 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4 mx-auto animate-bounce">
                <span className="text-xl font-bold">🗑️</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Conversation?</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed font-semibold">
                Are you sure you want to delete this conversation? This will clear all history in
                this chat session.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteSessionId(null)}
                  className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-750 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteSession}
                  className="px-5 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPage;
