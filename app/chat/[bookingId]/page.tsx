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
import { statusInfo, TrackingStatus } from "@/lib/tracking";

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
  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus>("pending");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const currentUser = auth.currentUser;

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    const initChat = async () => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      try {
        const bookingDoc = await getDoc(doc(db, "bookings", bookingId));
        if (!bookingDoc.exists()) {
          alert("Booking not found");
          router.push("/dashboard/customer");
          return;
        }

        const bookingData = { id: bookingDoc.id, ...bookingDoc.data() };
        setBooking(bookingData);
        setTrackingStatus(bookingData.trackingStatus || "pending");

        const isCustomer = bookingData.customerId === currentUser.uid;
        const isProfessional = bookingData.professionalId === currentUser.uid;

        if (!isCustomer && !isProfessional) {
          alert("You don't have access to this chat");
          router.push(isCustomer ? "/dashboard/customer" : "/dashboard/professional");
          return;
        }

        const otherUserId = isCustomer ? bookingData.professionalId : bookingData.customerId;
        if (otherUserId) {
          const otherUserDoc = await getDoc(doc(db, "users", otherUserId));
          if (otherUserDoc.exists()) {
            setOtherUser(otherUserDoc.data());
          }
        }

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

  // ⭐ NEW: Real-time tracking status listener
  useEffect(() => {
    if (!bookingId) return;

    const unsubscribe = onSnapshot(doc(db, "bookings", bookingId), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setTrackingStatus(data.trackingStatus || "pending");
      }
    });

    return () => unsubscribe();
  }, [bookingId]);

  useEffect(() => {
    if (!chatId) return;

    const unsubscribe = listenToMessages(chatId, (msgs) => {
      setMessages(msgs);
      if (currentUser) {
        markMessagesAsRead(chatId, currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, [chatId, currentUser]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatId || !currentUser || sending) return;

    setSending(true);
    try {
      await sendMessage(chatId, currentUser.uid, newMessage.trim());
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBack = () => {
    if (booking?.customerId === currentUser?.uid) {
      router.push("/dashboard/customer");
    } else {
      router.push("/dashboard/professional");
    }
  };

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
        <Loader2 size={48} color="#d97706" style={{ animation: "spin 1s linear infinite" }} />
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
        <div style={{ background: "white", padding: "40px", borderRadius: "16px", textAlign: "center" }}>
          <p style={{ color: "#6b7280" }}>Chat not available</p>
          <button 
            onClick={handleBack}
            style={{ marginTop: "16px", padding: "10px 20px", background: "#d97706", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentStatusInfo = statusInfo[trackingStatus];

  return (
    <>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        background: "#f3f4f6", 
        display: "flex", 
        flexDirection: "column",
        zIndex: 50 
      }}>
        
        {/* 1. HEADER with Tracking Status Badge */}
        <div style={{
          background: "white",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          borderBottom: "1px solid #e5e7eb",
          flexShrink: 0
        }}>
          <button 
            onClick={handleBack}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "8px", display: "flex" }}
          >
            <ArrowLeft size={24} color="#111827" />
          </button>

          <div style={{
            width: "45px", height: "45px", background: "linear-gradient(135deg, #d97706, #b45309)",
            borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: "700", fontSize: "1.2rem"
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

          {/* ⭐ NEW: Tracking Status Badge */}
          <div style={{
            background: currentStatusInfo.color + "20",
            color: currentStatusInfo.color,
            padding: "6px 12px",
            borderRadius: "20px",
            fontSize: "0.75rem",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}>
            <span>{currentStatusInfo.icon}</span>
            <span>{currentStatusInfo.label}</span>
          </div>

          {otherUser?.phone && (
            <a 
              href={`tel:${otherUser.phone}`}
              style={{ background: "#d97706", color: "white", padding: "10px", borderRadius: "50%", display: "flex", textDecoration: "none" }}
            >
              <Phone size={18} />
            </a>
          )}
        </div>

        {/* Booking Info with Tracking Timeline Preview */}
        <div style={{
          background: "#fffbeb", padding: "12px 20px", 
          borderBottom: "1px solid #e5e7eb", flexShrink: 0
        }}>
          <div style={{ display: "flex", gap: "16px", fontSize: "0.8rem", color: "#6b7280", marginBottom: "8px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Calendar size={14} /> {booking.date}</span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><MapPin size={14} /> {booking.address}</span>
          </div>
          
          {/* ⭐ NEW: Mini Timeline Preview */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem" }}>
            {["pending", "accepted", "on_the_way", "arrived", "working", "completed"].map((status, index) => {
              const statusKey = status as TrackingStatus;
              const info = statusInfo[statusKey];
              const isActive = ["pending", "accepted", "on_the_way", "arrived", "working", "completed"].indexOf(trackingStatus) >= index;
              
              return (
                <div key={status} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <div style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: isActive ? info.color : "#e5e7eb",
                    color: isActive ? "white" : "#9ca3af",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                    fontWeight: "700"
                  }}>
                    {info.icon}
                  </div>
                  {index < 5 && (
                    <div style={{
                      width: "20px",
                      height: "2px",
                      background: isActive ? info.color : "#e5e7eb"
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. MESSAGES AREA */}
        <div 
          ref={messagesContainerRef}
          className="hide-scrollbar"
          style={{
            flex: 1, 
            overflowY: "auto", 
            overflowX: "hidden",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            scrollBehavior: "smooth",
            WebkitOverflowScrolling: "touch"
          }}
        >
          {messages.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#6b7280", marginTop: "auto", marginBottom: "auto" }}>
              <MessageCircle size={48} color="#d97706" style={{ margin: "0 auto 16px" }} />
              <p style={{ fontSize: "1rem", fontWeight: "600", margin: "0 0 8px 0" }}>No messages yet</p>
              <p style={{ fontSize: "0.9rem", margin: 0 }}>Start the conversation! </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwnMessage = msg.senderId === currentUser?.uid;
              return (
                <div key={msg.id} style={{ display: "flex", justifyContent: isOwnMessage ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: "75%",
                    background: isOwnMessage ? "linear-gradient(135deg, #d97706, #b45309)" : "white",
                    color: isOwnMessage ? "white" : "#111827",
                    padding: "10px 14px",
                    borderRadius: isOwnMessage ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    wordBreak: "break-word"
                  }}>
                    <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.4 }}>{msg.text}</p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px", marginTop: "4px", fontSize: "0.7rem", color: isOwnMessage ? "rgba(255,255,255,0.8)" : "#9ca3af" }}>
                      <span>{formatTime(msg.timestamp)}</span>
                      {isOwnMessage && (msg.read ? <CheckCheck size={12} color="#60a5fa" /> : <Check size={12} />)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 3. INPUT AREA */}
        <div style={{
          background: "white", padding: "16px 20px", borderTop: "1px solid #e5e7eb",
          display: "flex", gap: "12px", alignItems: "center", flexShrink: 0
        }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            style={{
              flex: 1, padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "24px",
              fontSize: "1rem", outline: "none", background: "#f9fafb"
            }}
            onFocus={(e) => e.target.style.borderColor = "#d97706"}
            onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            style={{
              background: newMessage.trim() && !sending ? "linear-gradient(135deg, #d97706, #b45309)" : "#e5e7eb",
              color: newMessage.trim() && !sending ? "white" : "#9ca3af",
              border: "none", borderRadius: "50%", width: "48px", height: "48px",
              cursor: newMessage.trim() && !sending ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}
          >
            {sending ? <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={20} />}
          </button>
        </div>
      </div>
    </>
  );
}