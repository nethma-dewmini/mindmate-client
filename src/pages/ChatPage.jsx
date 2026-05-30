import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaPaperPlane, FaUser } from "react-icons/fa";
import { authService } from "../services/authService";

const ChatPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
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

    const loadChatHistory = async () => {
      try {
        setIsLoadingHistory(true);
        const history = await authService.getChatbotHistory();
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
        console.error("Failed to load chat history:", err);
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
        setIsLoadingHistory(false);
      }
    };

    loadChatHistory();
  }, [navigate]);

  const handleSendMessage = async (message = inputMessage) => {
    if (!message.trim() || isTyping) return;

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
      const response = await authService.sendMessageToChatbot(message.trim());
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

  if (isLoadingHistory) {
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
    <div className="min-h-screen bg-[#f9f5e7] flex flex-col">
      {/* Back Link */}
      <div className="max-w-4xl w-full mx-auto px-6 pt-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center text-sm text-[#5bb5a1] hover:text-[#4a9d8b] font-medium transition-colors"
        >
          <span className="mr-1.5">←</span> Back to Dashboard
        </Link>
      </div>

      {/* Chat Header */}
      <div className="gradient-teal py-4 px-6 mt-2">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
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
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
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
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-sm">🤖</span>
                  </div>
                )}
                <div>
                  <div
                    className={`px-4 py-3 rounded-2xl whitespace-pre-wrap ${
                      message.type === "user"
                        ? "bg-[#5bb5a1] text-white rounded-br-md"
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
      </div>

      {/* Suggested Prompts */}
      <div className="px-6 pb-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(prompt)}
                disabled={isTyping}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 hover:border-[#5bb5a1] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-150 p-4">
        <div className="max-w-4xl mx-auto flex items-center space-x-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isTyping}
            placeholder={isTyping ? "MindMate is processing..." : "Type your message..."}
            className="flex-1 px-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5bb5a1] focus:bg-white transition-all text-sm disabled:opacity-60"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isTyping}
            className={`px-5 py-3.5 rounded-xl font-semibold text-sm flex items-center space-x-1.5 transition-all shadow-md active:scale-95 cursor-pointer ${
              inputMessage.trim() && !isTyping
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
  );
};

export default ChatPage;
