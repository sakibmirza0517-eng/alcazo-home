"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { 
  ArrowLeft, Send, Phone, MapPin, Calendar, Clock, 
  Check, CheckCheck, MessageCircle, Loader2 
} from "lucide-react";
import { 
  createOrGetChat, 
  sendMessage, 
  listenToMessages, 
  markMessagesAsRead 
} from "@/lib/chat";

export default function ChatRoom() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.bookingId as string;
  
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = auth.currentUser;

  // Scroll to bottom jab naya message aaye
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const initChat = async () => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      try {
        // 1. Booking details fetch karo
        const bookingDoc = await getDoc(doc(db, "bookings", bookingId));
        if (!bookingDoc.exists()) {
          alert("Booking not found");
          router.push("/dashboard/customer");
          return;
        }

        const bookingData = { id: bookingDoc.id, ...bookingDoc.data() };
        setBooking(bookingData);

        // 2. Check if user is participant
        const isCustomer = bookingData.customerId === currentUser.uid;
        const isProfessional = bookingData.professionalId === currentUser.uid;

        if (!isCustomer && !isProfessional) {
          alert("You don't have access to this chat");
          router.push(isCustomer ? "/dashboard/customer" : "/dashboard/professional");
          return;
        }

        // 3. Other user ki details fetch karo
        const otherUserId = isCustomer ? bookingData.professionalId : bookingData.customerId;
        if (otherUserId) {
          const otherUserDoc = await getDoc(doc(db, "users", otherUserId));
          if (otherUserDoc.exists()) {
            setOtherUser(otherUserDoc.data());
          }
        }

        // 4. Chat room create/get karo
        const chatRoomId = await createOrGetChat(
          bookingId, 
          bookingData.customerId, 
          bookingData.professionalId
        );
        setChatId(chatRoomId);

        setLoading(false);
      } catch (error) {
        console.error("Error initializing chat:", error);
        alert("Error loading chat");
        setLoading(false);
      }
    };

    initChat();
  }, [bookingId, currentUser, router]);

  // Real-time messages listen karo
  useEffect(() => {
    if (!chatId) return;

    const unsubscribe = listenToMessages(chatId, (msgs) => {
      setMessages(msgs);
      // Messages ko mark as read karo
      if (currentUser) {
        markMessagesAsRead(chatId, currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, [chatId, currentUser]);

  // Message send karna
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatId || !currentUser || sending) return;

    setSending(true);
    try {
      await sendMessage(chatId, currentUser.uid, newMessage.trim());
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  // Enter key se message send
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Back button - user role ke hisaab se redirect
  const handleBack = () => {
    if (booking?.customerId === currentUser?.uid) {
      router.push("/dashboard/customer");
    } else {
      router.push("/dashboard/professional");
    }
  };

  // Time format karo
  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString("en-IN", { 
      hour: "2-digit", 
      minute: "2-digit",
      hour12: true 
    });
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        background: "#fffbeb", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center" 
      }}>
        <div style={{ textAlign: "center" }}>
          <Loader2 size={48} color="#d97706" style={{ animation: "spin 1s linear infinite" }} />
          <p style={{ marginTop: "16px", color: "#d97706", fontSize: "1.2rem", fontWeight: "600" }}>
            Loading Chat...
          </p>
        </div>
      </div>
    );
  }

  if (!booking || !chatId) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        background: "#fffbeb", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        padding: "20px"
      }}>
        <div style={{ 
          background: "white", 
          padding: "40px", 
          borderRadius: "16px", 
          textAlign: "center" 
        }}>
          <p style={{ color: "#6b7280" }}>Chat not available</p>
          <button 
            onClick={handleBack}
            style={{
              marginTop: "16px",
              padding: "10px 20px",
              background: "#d97706",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "#f3f4f6", 
      display: "flex", 
      flexDirection: "column",
      height: "100vh"
    }}>
      {/* Header */}
      <div style={{
        background: "white",
        padding: "16px 20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        borderBottom: "2px solid #d97706"
      }}>
        <button 
          onClick={handleBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <ArrowLeft size={24} color="#111827" />
        </button>

        <div style={{
          width: "45px",
          height: "45px",
          background: "linear-gradient(135deg, #d97706, #b45309)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: "700",
          fontSize: "1.2rem"
        }}>
          {otherUser?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>

        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "#111827" }}>
            {otherUser?.name || "User"}
          </h3>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>
            {booking.serviceType} • {booking.date}
          </p>
        </div>

        {otherUser?.phone && (
          <a 
            href={`tel:${otherUser.phone}`}
            style={{
              background: "#d97706",
              color: "white",
              padding: "10px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none"
            }}
            title="Emergency Call"
          >
            <Phone size={18} />
          </a>
        )}
      </div>

      {/* Booking Info Card */}
      <div style={{
        background: "#fffbeb",
        padding: "12px 20px",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        gap: "16px",
        fontSize: "0.85rem",
        color: "#6b7280",
        flexWrap: "wrap"
      }}>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <Calendar size={14} /> {booking.date}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <Clock size={14} /> {booking.timeSlot}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <MapPin size={14} /> {booking.address}
        </span>
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px"
      }}>
        {messages.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "40px 20px",
            color: "#6b7280"
          }}>
            <MessageCircle size={48} color="#d97706" style={{ margin: "0 auto 16px" }} />
            <p style={{ fontSize: "1rem", fontWeight: "600", margin: "0 0 8px 0" }}>
              No messages yet
            </p>
            <p style={{ fontSize: "0.9rem", margin: 0 }}>
              Start the conversation! 👋
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.senderId === currentUser?.uid;
            return (
              <div 
                key={msg.id}
                style={{
                  display: "flex",
                  justifyContent: isOwnMessage ? "flex-end" : "flex-start"
                }}
              >
                <div style={{
                  maxWidth: "70%",
                  background: isOwnMessage 
                    ? "linear-gradient(135deg, #d97706, #b45309)" 
                    : "white",
                  color: isOwnMessage ? "white" : "#111827",
                  padding: "10px 14px",
                  borderRadius: isOwnMessage 
                    ? "16px 16px 4px 16px" 
                    : "16px 16px 16px 4px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  wordBreak: "break-word"
                }}>
                  <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.4 }}>
                    {msg.text}
                  </p>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: "4px",
                    marginTop: "4px",
                    fontSize: "0.7rem",
                    color: isOwnMessage ? "rgba(255,255,255,0.8)" : "#9ca3af"
                  }}>
                    <span>{formatTime(msg.timestamp)}</span>
                    {isOwnMessage && (
                      msg.read ? (
                        <CheckCheck size={12} color="#60a5fa" />
                      ) : (
                        <Check size={12} />
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div style={{
        background: "white",
        padding: "16px 20px",
        borderTop: "1px solid #e5e7eb",
        display: "flex",
        gap: "12px",
        alignItems: "center"
      }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: "12px 16px",
            border: "2px solid #e5e7eb",
            borderRadius: "24px",
            fontSize: "1rem",
            outline: "none",
            background: "#f9fafb"
          }}
          onFocus={(e) => e.target.style.borderColor = "#d97706"}
          onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
        />
        <button
          onClick={handleSendMessage}
          disabled={!newMessage.trim() || sending}
          style={{
            background: !newMessage.trim() || sending ? "#e5e7eb" : "linear-gradient(135deg, #d97706, #b45309)",
            color: !newMessage.trim() || sending ? "#9ca3af" : "white",
            border: "none",
            borderRadius: "50%",
            width: "48px",
            height: "48px",
            cursor: !newMessage.trim() || sending ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s"
          }}
        >
          {sending ? (
            <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
          ) : (
            <Send size={20} />
          )}
        </button>
      </div>
    </div>
  );
}