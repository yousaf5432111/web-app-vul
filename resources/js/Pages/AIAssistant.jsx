import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMessageSquare, FiX, FiSend, FiUser, FiCpu } from "react-icons/fi";

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I'm your cybersecurity assistant. Ask me about vulnerabilities, defenses, or ethical hacking concepts.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const GEMINI_API_KEY = "AIzaSyD3vGJxKCRKjFVOj4rbMJTlpoddMvbFV6M";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const callGeminiAPI = async (model, prompt) => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch (error) {
      console.error(`Error calling Gemini API (${model}):`, error);
      return null;
    }
  };

  const buildPrompt = (question, context, chatHistory) => {
    let contextBlock = "";
    if (context) {
      contextBlock =
        "\n\nCurrent Context:\n" +
        `- Page: ${context.page || "N/A"}\n` +
        `- Title: ${context.pageTitle || "N/A"}\n` +
        `- Time: ${new Date(context.timestamp).toLocaleString()}\n`;
    }

    let historyBlock = "";
    if (chatHistory.length > 0) {
      historyBlock =
        "\n\nChat History:\n" +
        chatHistory
          .map(
            (msg) =>
              `${msg.sender === "user" ? "User" : "AI"}: ${msg.text}\n` +
              `[${new Date(msg.timestamp).toLocaleTimeString()}]`
          )
          .join("\n");
    }

    return `You are a strict cybersecurity assistant. Your responses MUST follow these rules:

1. ONLY answer cybersecurity questions
2. NEVER provide attack payloads
3. For demonstrations, explain concepts theoretically
4. Reject illegal/dangerous queries
5. Keep answers concise but informative
6. Remind about authorization and test environments
7. Consider context and chat history when relevant
${contextBlock}${historyBlock}

Current Question: ${question}`;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || isLoading) return;

    // Add user message with timestamp
    const userMessage = {
      sender: "user",
      text: question,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Get current page context
      const context = {
        page: window.location.pathname,
        pageTitle: document.title,
        timestamp: new Date().toISOString(),
      };

      // Try models in order
      const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];

      let answer = "";
      const prompt = buildPrompt(question, context, messages);

      for (const model of models) {
        answer = await callGeminiAPI(model, prompt);
        if (answer) break;
      }

      if (!answer) {
        throw new Error("All model attempts failed");
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: answer,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Sorry, I encountered an error. Please try again later.",
          timestamp: new Date().toISOString(),
        },
      ]);
      console.error("AI Assistant error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full p-4 shadow-xl hover:shadow-2xl transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="AI Assistant"
      >
        {isOpen ? (
          <FiX size={24} className="transform transition-transform" />
        ) : (
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
          >
            <FiMessageSquare size={24} />
          </motion.div>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-40 w-full max-w-md h-[65vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 backdrop-blur-sm"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <FiCpu className="text-blue-200" />
                <span>Cybersecurity Assistant</span>
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-blue-100 hover:text-white transition-colors"
                aria-label="Close"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-gradient-to-b from-gray-50 to-gray-100">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-start gap-3 ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.sender === "ai" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mt-1 shadow-sm">
                      <FiCpu size={16} />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] p-3 rounded-lg text-sm relative ${
                      msg.sender === "user"
                        ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-none"
                        : "bg-white text-gray-800 shadow-sm rounded-bl-none"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                    <div
                      className={`text-xs mt-1 ${
                        msg.sender === "user"
                          ? "text-blue-200"
                          : "text-gray-500"
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  {msg.sender === "user" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center mt-1 shadow-sm">
                      <FiUser size={16} />
                    </div>
                  )}
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-white text-gray-500 text-sm shadow-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t border-gray-200 bg-white flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about cybersecurity..."
                className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={isLoading}
              />
              <motion.button
                type="submit"
                className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                disabled={!input.trim() || isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiSend size={18} />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
