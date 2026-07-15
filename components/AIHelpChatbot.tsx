"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import { X, Send } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const QUICK_QUESTIONS = [
  "How to book a service?",
  "How to choose a professional?",
  "How to upload ID/Photo?",
  "How to send a message?"
];

export default function AIHelpChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
        },
      ]);
    } catch (error: any) {
      console.error("Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `⚠️ AI is currently busy. Please try again in a moment.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };

  // ✅ CLOSED STATE: Floating Button
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          bottom: "15px",
          right: "15px",
          zIndex: 50,
          background: "linear-gradient(135deg, #d97706, #b45309)",
          border: "none",
          borderRadius: "50%",
          width: "60px",
          height: "60px",
          cursor: "pointer",
          boxShadow: "0 4px 16px rgba(217, 119, 6, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
        title="Help Chat"
      >
        <div style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #fbbf24, #d97706)",
          borderRadius: "50%",
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <circle cx="12" cy="5" r="2" />
            <path d="M12 7v4" />
            <line x1="8" y1="16" x2="8" y2="16" />
            <line x1="16" y1="16" x2="16" y2="16" />
          </svg>
        </div>
      </button>
    );
  }

  // ✅ OPEN STATE: Chat Window
  return (
    <div style={{
      position: "fixed",
      bottom: "0",
      right: "0",
      left: "0",
      zIndex: 50,
      width: "100%",
      maxWidth: "100%",
      height: "75vh",
      maxHeight: "600px",
      background: "white",
      borderRadius: "20px 20px 0 0",
      boxShadow: "0 -4px 20px rgba(0,0,0,0.15)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #d97706, #b45309)",
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        flexShrink: 0
      }}>
        <div style={{
          width: "40px",
          height: "40px",
          background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <circle cx="12" cy="5" r="2" />
            <path d="M12 7v4" />
            <line x1="8" y1="16" x2="8" y2="16" />
            <line x1="16" y1="16" x2="16" y2="16" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, color: "white", fontSize: "1rem", fontWeight: "700" }}>
            Alcazo Assistant
          </h3>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.9)", fontSize: "0.75rem" }}>
            Online • Ready to help
          </p>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", cursor: "pointer", padding: "6px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <X size={18} />
        </button>
      </div>

      {/* ✅ Messages Area: WhatsApp Style Smooth Scroll (No Scrollbar) */}
      <div style={{ 
        flex: 1, 
        overflowY: "auto", 
        overflowX: "hidden",
        padding: "12px", 
        background: "#f9fafb",
        // 🚀 Scrollbar chhupane ke magic styles:
        scrollbarWidth: "none", /* Firefox */
        msOverflowStyle: "none", /* IE/Edge */
        WebkitOverflowScrolling: "touch" /* Smooth iOS scrolling */
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "20px 12px" }}>
            <p style={{ margin: "0 0 16px 0", fontSize: "0.9rem", color: "#374151", fontWeight: "600" }}>
              Hello! How can I help you today?
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleQuickQuestion(q)}
                  style={{
                    background: "#fef3c7",
                    border: "1px solid #fcd34d",
                    padding: "10px 16px",
                    borderRadius: "20px",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    color: "#92400e",
                    fontWeight: "500",
                    width: "100%",
                    maxWidth: "280px"
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} style={{ marginBottom: "10px", display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "80%",
              padding: "10px 14px",
              borderRadius: "16px",
              background: m.role === "user" ? "#d97706" : "white",
              color: m.role === "user" ? "white" : "#111827",
              fontSize: "0.9rem",
              lineHeight: 1.4,
              boxShadow: m.role === "user" ? "none" : "0 2px 6px rgba(0,0,0,0.05)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word"
            }}>
              {m.content}
            </div>
          </div>
        ))}

        {/* Loading Animation */}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "10px" }}>
            <div style={{
              background: "white",
              padding: "12px 16px",
              borderRadius: "16px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              display: "flex",
              gap: "4px",
              alignItems: "center"
            }}>
              <div style={{ width: "8px", height: "8px", background: "#d97706", borderRadius: "50%", animation: "bounce 1.4s infinite ease-in-out", animationDelay: "0s" }} />
              <div style={{ width: "8px", height: "8px", background: "#d97706", borderRadius: "50%", animation: "bounce 1.4s infinite ease-in-out", animationDelay: "0.2s" }} />
              <div style={{ width: "8px", height: "8px", background: "#d97706", borderRadius: "50%", animation: "bounce 1.4s infinite ease-in-out", animationDelay: "0.4s" }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleFormSubmit} style={{ 
        padding: "12px", 
        borderTop: "1px solid #e5e7eb", 
        display: "flex", 
        gap: "8px", 
        background: "white",
        flexShrink: 0
      }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question here..."
          style={{ 
            flex: 1,
            padding: "10px 14px",
            border: "2px solid #e5e7eb",
            borderRadius: "24px",
            outline: "none",
            fontSize: "0.9rem"
          }}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          style={{
            background: !input.trim() || isLoading ? "#e5e7eb" : "#d97706",
            color: !input.trim() || isLoading ? "#9ca3af" : "white",
            border: "none",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            cursor: !input.trim() || isLoading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}
        >
          <Send size={18} />
        </button>
      </form>

      {/* ✅ Global Scrollbar Hide + Animation Styles */}
      <style>{`
        /* Chrome, Safari, Edge ke liye scrollbar chhupana */
        div::-webkit-scrollbar {
          display: none !important;
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}