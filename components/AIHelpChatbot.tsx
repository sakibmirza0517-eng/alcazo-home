"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import { MessageSquare, Send, X } from "lucide-react";

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

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Simple JSON response read karta hai (No streaming errors)
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

      // ✅ Backend se JSON response read karo
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
          content: `⚠️ Error: ${error.message}. Please try again later.`,
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

  // ✅ CLOSED STATE: Floating Button (No Hover Effects - Touch/Click Only)
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 50,
          background: "linear-gradient(135deg, #d97706, #b45309)",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: 64,
          height: 64,
          cursor: "pointer",
          boxShadow: "0 6px 16px rgba(217, 119, 6, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        title="Help Chat"
      >
        <MessageSquare size={28} />
      </button>
    );
  }

  // ✅ OPEN STATE: Chat Window
  return (
    <div style={{
      position: "fixed",
      bottom: 24,
      right: 24,
      zIndex: 50,
      width: 380,
      maxWidth: "90vw",
      background: "white",
      borderRadius: 20,
      boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      height: 500,
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #d97706, #b45309)",
        padding: "14px 18px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <h3 style={{ margin: 0, color: "white", fontSize: "1.05rem", fontWeight: "700" }}>
          Alcazo Assistant 🤖
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          style={{ background: "none", border: "none", color: "white", cursor: "pointer", padding: 4 }}
        >
          <X size={22} />
        </button>
      </div>

      {/* Messages Area */}
      <div style={{ flex: 1, overflowY: "auto", padding: 16, background: "#f9fafb" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "24px 12px" }}>
            <p style={{ margin: "0 0 12px 0", fontSize: "0.95rem", color: "#374151", fontWeight: "600" }}>
              Hello! How can I help you today?
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleQuickQuestion(q)}
                  style={{
                    background: "#fef3c7", border: "1px solid #fcd34d", padding: "8px 12px",
                    borderRadius: 20, fontSize: "0.85rem", cursor: "pointer", color: "#92400e",
                    fontWeight: "500"
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} style={{ marginBottom: 12, display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "85%", padding: "10px 14px", borderRadius: 16,
              background: m.role === "user" ? "#d97706" : "white",
              color: m.role === "user" ? "white" : "#111827",
              fontSize: "0.92rem", lineHeight: 1.45,
              boxShadow: m.role === "user" ? "none" : "0 2px 6px rgba(0,0,0,0.05)",
              whiteSpace: "pre-wrap"
            }}>
              {m.content}
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div style={{ fontSize: "0.85rem", color: "#6b7280", paddingLeft: 12, fontStyle: "italic" }}>
            Typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleFormSubmit} style={{ padding: 14, borderTop: "1px solid #e5e7eb", display: "flex", gap: 10, background: "white" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question here..."
          style={{ 
            flex: 1, padding: "11px 14px", border: "2px solid #e5e7eb", borderRadius: 24, 
            outline: "none", fontSize: "0.95rem"
          }}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          style={{
            background: !input.trim() || isLoading ? "#e5e7eb" : "#d97706",
            color: !input.trim() || isLoading ? "#9ca3af" : "white",
            border: "none", borderRadius: "50%", width: 42, height: 42,
            cursor: !input.trim() || isLoading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}