import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
          // Select the most recent session
          setActiveSessionId(fetchedSessions[0].id);
        } else {
          // Create a new default session if none exist
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
              content: "Hello! I'm MindMate, your mental health companion. How are you feeling today?",
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
            content: "Hello! I'm MindMate, your mental health companion. How are you feeling today?",
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

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation(); // Avoid switching to the session we are deleting

    if (!window.confirm("Are you sure you want to delete this conversation?")) return;

    try {
      await authService.deleteChatbotSession(sessionId);
      
      const updatedSessions = sessions.filter((s) => s.id !== sessionId);
      setSessions(updatedSessions);

      if (activeSessionId === sessionId) {
        if (updatedSessions.length > 0) {
          setActiveSessionId(updatedSessions[0].id);
        } else {
          // If no sessions remain, trigger creation of a new session
          const newSession = await authService.createChatbotSession("New Conversation");
          setSessions([newSession]);
          setActiveSessionId(newSession.id);
        }
      }
    } catch (err) {
      console.error("Failed to delete chat session:", err);
      alert("Failed to delete conversation. Please try again.");
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
      const response = await authService.sendMessageToChatbotSession(activeSessionId, message.trim());
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

      // Update sidebar title locally if it was a "New Conversation" or "New Chat"
      const activeSession = sessions.find((s) => s.id === activeSessionId);
      if (activeSession && (activeSession.title === "New Conversation" || activeSession.title === "New Chat")) {
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5bb5a1]"></div>
          <p className="text-gray-500 font-medium animate-pulse">
            Loading MindMate companion...
          </p>
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
        className={`fixed inset-y-0 left-0 w-80 bg-[#edf5f3] border-r border-[#d8ebe7] flex flex-col h-full z-30 transition-transform duration-300 md:relative md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#d8ebe7] flex justify-between items-center bg-white/50 backdrop-blur-md">
          <span className="font-semibold text-gray-700 flex items-center space-x-2">
            <FaComments className="text-[#5bb5a1] text-lg" />
            <span>Chat Histories</span>
          </span>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600 md:hidden hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <FaTimes />
          </button>
        </div>

        {/* Action Button: Start New Chat */}
        <div className="p-4">
          <button
            onClick={handleStartNewChat}
            className="w-full bg-[#5bb5a1] hover:bg-[#4a9d8b] text-white rounded-xl py-3 px-4 flex items-center justify-center space-x-2 font-medium shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <FaPlus className="text-xs" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Conversations Scrollable List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {sessions.map((session) => {
            const isActive = session.id === activeSessionId;
            return (
              <div
                key={session.id}
                onClick={() => {
                  setActiveSessionId(session.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all cursor-pointer group ${
                  isActive
                    ? "bg-[#5bb5a1] text-white shadow-sm font-medium"
                    : "hover:bg-[#e2edea] text-gray-700 bg-white/40 border border-[#e5f0ed]"
                }`}
              >
                <div className="flex items-center space-x-3 overflow-hidden mr-2">
                  <span className="text-base flex-shrink-0">🤖</span>
                  <span className="text-sm truncate block leading-normal">{session.title}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteSession(session.id, e)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer flex-shrink-0 ${
                    isActive
                      ? "text-teal-100 hover:text-white hover:bg-teal-600/40"
                      : "text-gray-400 hover:text-rose-500 hover:bg-rose-50 md:opacity-0 md:group-hover:opacity-100"
                  }`}
                  title="Delete Conversation"
                >
                  <FaRegTrashAlt className="text-xs" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer Back Link */}
        <div className="p-4 border-t border-[#d8ebe7] bg-white/40">
          <Link
            to="/dashboard"
            className="w-full py-2 px-3 border border-gray-200 rounded-lg text-xs text-gray-500 hover:text-[#5bb5a1] hover:border-[#5bb5a1] transition-all flex items-center justify-center space-x-1.5 bg-white/80"
          >
            <span>← Back to Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Right Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Main Header */}
        <div className="gradient-teal py-4 px-6 shadow-sm border-b border-gray-100/10 flex justify-between items-center z-10 flex-shrink-0">
          <div className="flex items-center space-x-3">
            {/* Mobile Menu Bars toggle */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 bg-white/20 text-white rounded-xl hover:bg-white/30 md:hidden cursor-pointer"
            >
              <FaBars className="text-lg" />
            </button>
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
              <span className="text-xl">🤖</span>
            </div>
            <div>
              <h1 className="font-semibold text-[#5bb5a1] text-lg leading-tight">
                MindMate AI Assistant
              </h1>
              <p className="text-xs text-gray-500">Always here to support you</p>
            </div>
          </div>
          <Link
            to="/experts"
            className="px-4 py-2 bg-[#5bb5a1] text-white text-sm font-medium rounded-xl hover:bg-[#4a9d8b] transition-all shadow-sm active:scale-95"
          >
            Connect to Expert
          </Link>
        </div>

        {/* Message Window Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-[#f9f5e7]">
          {isLoadingMessages ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5bb5a1]"></div>
                <p className="text-xs text-gray-400">Loading conversation...</p>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex items-end space-x-3 max-w-[75%] ${
                      message.type === "user" ? "flex-row-reverse space-x-reverse" : ""
                    }`}
                  >
                    {message.type === "bot" && (
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-100">
                        <span className="text-sm">🤖</span>
                      </div>
                    )}
                    <div>
                      <div
                        className={`px-4 py-3 rounded-2xl whitespace-pre-wrap ${
                          message.type === "user"
                            ? "bg-[#5bb5a1] text-white rounded-br-md shadow-sm"
                            : "bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>
                      <p
                        className={`text-[10px] text-gray-400 mt-1 ${
                          message.type === "user" ? "text-right" : ""
                        }`}
                      >
                        {message.timestamp}
                      </p>
                    </div>
                    {message.type === "user" && (
                      <div className="w-8 h-8 bg-[#e8f5f1] rounded-full flex items-center justify-center flex-shrink-0 border border-[#d2ebe4]">
                        <FaUser className="text-[#5bb5a1] text-xs" />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-end space-x-3">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm animate-pulse">
                      <span className="text-sm">🤖</span>
                    </div>
                    <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100">
                      <div className="flex space-x-1.5 py-1 px-0.5">
                        <div
                          className="w-2.5 h-2.5 bg-[#5bb5a1]/60 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="w-2.5 h-2.5 bg-[#5bb5a1]/80 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="w-2.5 h-2.5 bg-[#5bb5a1] rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
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
                  <button
                    key={index}
                    onClick={() => handleSendMessage(prompt)}
                    disabled={isTyping}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:bg-gray-50 hover:border-[#5bb5a1] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {prompt}
                  </button>
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
              className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5bb5a1] focus:bg-white transition-all text-sm disabled:opacity-60"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isTyping || isLoadingMessages}
              className={`px-5 py-3 rounded-xl font-semibold text-sm flex items-center space-x-1.5 transition-all shadow-md active:scale-95 cursor-pointer ${
                inputMessage.trim() && !isTyping && !isLoadingMessages
                  ? "bg-[#5bb5a1] text-white hover:bg-[#4a9d8b] hover:shadow-lg"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
              }`}
            >
              <span>Send</span>
              <FaPaperPlane className="text-xs" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
