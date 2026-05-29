import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaPaperPlane, FaUser } from "react-icons/fa";

const ChatPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content:
        "Hello! I'm MindMate, your mental health companion. How are you feeling today?",
      timestamp: "09:00",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
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

  const handleSendMessage = (message = inputMessage) => {
    if (!message.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: "user",
      content: message,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponses = [
        "I understand exam anxiety can be overwhelming. It's completely normal to feel this way. Can you tell me more about what specifically is making you anxious?",
        "Thank you for sharing that with me. Let's work through this together. What would help you feel more supported right now?",
        "I hear you. Remember, it's okay to feel this way. Would you like me to guide you through a quick breathing exercise?",
      ];

      const botMessage = {
        id: messages.length + 2,
        type: "bot",
        content: botResponses[Math.floor(Math.random() * botResponses.length)],
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
      <div className="gradient-teal py-4 px-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-xl">🤖</span>
            </div>
            <div>
              <h1 className="font-semibold text-[#5bb5a1]">
                MindMate AI Assistant
              </h1>
              <p className="text-sm text-gray-600">Always here to help</p>
            </div>
          </div>
          <Link
            to="/experts"
            className="px-4 py-2 bg-[#5bb5a1] text-white rounded-lg hover:bg-[#4a9d8b]"
          >
            Connect to Expert
          </Link>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex items-end space-x-3 max-w-[70%] ${message.type === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
              >
                {message.type === "bot" && (
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-sm">🤖</span>
                  </div>
                )}
                <div>
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      message.type === "user"
                        ? "bg-[#5bb5a1] text-white rounded-br-md"
                        : "bg-white text-gray-800 rounded-bl-md shadow-sm"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                  <p
                    className={`text-xs text-gray-400 mt-1 ${message.type === "user" ? "text-right" : ""}`}
                  >
                    {message.timestamp}
                  </p>
                </div>
                {message.type === "user" && (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaUser className="text-gray-500 text-sm" />
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-end space-x-3">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-sm">🤖</span>
                </div>
                <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex space-x-1">
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
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
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 hover:border-[#5bb5a1] transition-colors shadow-sm"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex items-center space-x-4">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 bg-gray-100 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-[#5bb5a1]"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim()}
            className={`px-6 py-3 rounded-xl font-medium ${
              inputMessage.trim()
                ? "bg-[#5bb5a1] text-white hover:bg-[#4a9d8b]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
