"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { 
  ArrowLeft, Send, Phone, MapPin, Calendar, 
  Check, CheckCheck, MessageCircle, Loader2, Paperclip 
} from "lucide-react";
import { 
  createOrGetChat, 
  sendMessage, 
  listenToMessages, 
  markMessagesAsRead,
  sendSystemMessage,
  setTypingStatus,
  listenToTypingStatus
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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus>("pending");
  const [lastTrackingStatus, setLastTrackingStatus] = useState<TrackingStatus>("pending");
  const [isProfessional, setIsProfessional] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentUser = auth.currentUser;

  const quickReplies = [
    { emoji: "", text: "Main 10 min mein pahunch raha hu" },
    { emoji: "📍", text: "Main location par aa gaya hu" },
    { emoji: "✅", text: "Kaam complete ho gaya hai" },
    { emoji: "", text: "Thoda time lagega" }
  ];

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    const initChat = async () => {
      if (!currentUser) { router.push("/login"); return; }

      try {
        const bookingDoc = await getDoc(doc(db, "bookings", bookingId));
        if (!bookingDoc.exists()) { alert("Booking not found"); router.push("/dashboard/customer"); return; }

        const bookingData = { id: bookingDoc.id, ...bookingDoc.data() };
        setBooking(bookingData);
        setTrackingStatus(bookingData.trackingStatus || "pending");
        setLastTrackingStatus(bookingData.trackingStatus || "pending");

        const isCustomer = bookingData.customerId === currentUser.uid;
        setIsProfessional(bookingData.professionalId === currentUser.uid);

        if (!isCustomer && bookingData.professionalId !== currentUser.uid) {
          alert("Access denied"); router.push("/dashboard/customer"); return;
        }

        const otherUserId = isCustomer ? bookingData.professionalId : bookingData.customerId;
        if (otherUserId) {
          const otherUserDoc = await getDoc(doc(db, "users", otherUserId));
          if (otherUserDoc.exists()) setOtherUser(otherUserDoc.data());
        }

        const chatRoomId = await createOrGetChat(bookingId, bookingData.customerId, bookingData.professionalId);
        setChatId(chatRoomId);
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setLoading(false);
      }
    };
    initChat();
  }, [bookingId, currentUser, router]);

  useEffect(() => {
    if (!bookingId || !chatId || !currentUser) return;
    const unsubscribe = onSnapshot(doc(db, "bookings", bookingId), async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const newStatus = data.trackingStatus || "pending";
        if (newStatus !== lastTrackingStatus && chatId) {
          const msgs: Record<string, string> = {
            "accepted": ` ${otherUser?.name || "Professional"} ne job accept ki`,
            "on_the_way": ` ${otherUser?.name || "Professional"} raste mein hai`,
            "arrived": ` ${otherUser?.name || "Professional"} aa gaya`,
            "working": ` ${otherUser?.name || "Professional"} kaam kar raha hai`,
            "completed": `✅ Job complete ho gayi`
          };
          if (msgs[newStatus]) {
            try { await sendSystemMessage(chatId, msgs[newStatus]); } catch(e) {}
          }
          setLastTrackingStatus(newStatus);
        }
        setTrackingStatus(newStatus);
      }
    });
    return () => unsubscribe();
  }, [bookingId, chatId, currentUser, lastTrackingStatus, otherUser?.name]);

  useEffect(() => {
    if (!chatId) return;
    const unsubscribe = listenToMessages(chatId, (msgs) => {
      setMessages(msgs);
      if (currentUser) markMessagesAsRead(chatId, currentUser.uid);
    });
    return () => unsubscribe();
  }, [chatId, currentUser]);

  // ⭐ NEW: Typing Indicator Listener
  useEffect(() => {
    if (!chatId || !currentUser) return;
    
    const unsubscribe = listenToTypingStatus(chatId, currentUser.uid, (users) => {
      setTypingUsers(users);
    });
    
    return () => unsubscribe();
  }, [chatId, currentUser]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatId || !currentUser || sending) return;
    setSending(true);
    try {
      await sendMessage(chatId, currentUser.uid, newMessage.trim());
      setNewMessage("");
      await setTypingStatus(chatId, currentUser.uid, false);
    } catch (e) { console.error(e); }
    finally { setSending(false); }
  };

  const handleQuickReply = async (text: string) => {
    if (!chatId || !currentUser || sending) return;
    setSending(true);
    try { await sendMessage(chatId, currentUser.uid, text); } 
    finally { setSending(false); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !chatId || !currentUser) return;
    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload-image', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) await sendMessage(chatId, currentUser.uid, "", data.url);
      else alert("Upload failed");
    } catch (e) { alert("Error"); }
    finally { 
      setUploadingImage(false); 
      if(fileInputRef.current) fileInputRef.current.value = ""; 
    }
  };

  // ⭐ NEW: Typing Handler
  const handleTyping = () => {
    if (!chatId || !currentUser) return;
    
    setTypingStatus(chatId, currentUser.uid, true);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setTypingStatus(chatId, currentUser.uid, false);
    }, 2000);
  };

  const handleBack = () => {
    router.push(booking?.customerId === currentUser?.uid ? "/dashboard/customer" : "/dashboard/professional");
  };

  const formatTime = (ts: any) => {
    if (!ts) return "";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  if (loading) return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}><Loader2 size={48} color="#d97706" style={{animation:"spin 1s linear infinite"}}/></div>;
  if (!booking || !chatId) return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>Loading...</div>;

  const statusInfo = {
    pending: { label: "Pending", color: "#6b7280", icon: "⏳" },
    accepted: { label: "Accepted", color: "#3b82f6", icon: "🤝" },
    on_the_way: { label: "On the way", color: "#f59e0b", icon: "" },
    arrived: { label: "Arrived", color: "#8b5cf6", icon: "📍" },
    working: { label: "Working", color: "#10b981", icon: "" },
    completed: { label: "Completed", color: "#22c55e", icon: "✅" }
  };
  const currentStatus = statusInfo[trackingStatus as keyof typeof statusInfo] || statusInfo.pending;

  return (
    <>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .image-upload-btn {
          background: transparent !important;
          border: 2px solid #e5e7eb !important;
          border-radius: 50% !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 8px !important;
          flex-shrink: 0 !important;
          min-width: 44px !important;
          min-height: 44px !important;
          width: 44px !important;
          height: 44px !important;
        }
        .image-upload-btn:hover {
          background: #fef3c7 !important;
          border-color: #d97706 !important;
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
      
      <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:"#f3f4f6",display:"flex",flexDirection:"column",fontFamily:"system-ui"}}>
        
        {/* HEADER */}
        <div style={{background:"white",padding:"14px 20px",display:"flex",alignItems:"center",gap:"12px",borderBottom:"1px solid #e5e7eb",flexShrink:0}}>
          <button onClick={handleBack} style={{background:"none",border:"none",cursor:"pointer",padding:"6px"}}><ArrowLeft size={22}/></button>
          <div style={{width:"40px",height:"40px",background:"linear-gradient(135deg,#d97706,#b45309)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:"700",flexShrink:0}}>
            {otherUser?.name?.[0]?.toUpperCase()||"U"}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <h3 style={{margin:0,fontSize:"1rem",fontWeight:"700",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{otherUser?.name||"User"}</h3>
            <p style={{margin:0,fontSize:"0.8rem",color:"#6b7280"}}>{booking.serviceType}</p>
          </div>
          <div style={{background:currentStatus.color+"20",color:currentStatus.color,padding:"5px 10px",borderRadius:"16px",fontSize:"0.7rem",fontWeight:"700",flexShrink:0}}>
            {currentStatus.icon} {currentStatus.label}
          </div>
        </div>

        {/* MESSAGES */}
        <div ref={messagesContainerRef} className="hide-scrollbar" style={{flex:1,overflowY:"auto",padding:"16px",display:"flex",flexDirection:"column",gap:"10px"}}>
          {messages.length===0 ? (
            <div style={{textAlign:"center",padding:"40px",color:"#6b7280",margin:"auto"}}>
              <MessageCircle size={48} color="#d97706" style={{margin:"0 auto 16px"}}/>
              <p style={{fontWeight:"600"}}>No messages yet</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.senderId === currentUser?.uid;
              const isSys = msg.isSystem === true;
              
              if (isSys) return (
                <div key={msg.id} style={{display:"flex",justifyContent:"center",margin:"8px 0"}}>
                  <div style={{background:"#f3f4f6",color:"#6b7280",padding:"8px 16px",borderRadius:"16px",fontSize:"0.8rem",border:"1px solid #e5e7eb"}}>
                    {msg.text}
                  </div>
                </div>
              );
              
              return (
                <div key={msg.id} style={{display:"flex",justifyContent:isOwn?"flex-end":"flex-start"}}>
                  <div style={{maxWidth:"80%",background:isOwn?"linear-gradient(135deg,#d97706,#b45309)":"white",color:isOwn?"white":"#111827",padding:msg.imageUrl?"4px":"10px 14px",borderRadius:isOwn?"16px 16px 4px 16px":"16px 16px 16px 4px",boxShadow:"0 1px 2px rgba(0,0,0,0.1)"}}>
                    {msg.imageUrl && <img src={msg.imageUrl} alt="" style={{maxWidth:"250px",maxHeight:"300px",borderRadius:"12px",display:"block"}}/>}
                    {msg.text && <p style={{margin:0,fontSize:"0.9rem",lineHeight:1.4,padding:msg.imageUrl?"8px 12px 0":0}}>{msg.text}</p>}
                    <div style={{display:"flex",justifyContent:"flex-end",gap:"4px",marginTop:"4px",fontSize:"0.7rem",color:isOwn?"rgba(255,255,255,0.8)":"#9ca3af",padding:"0 8px 4px"}}>
                      <span>{formatTime(msg.timestamp)}</span>
                      {isOwn && (msg.read?<CheckCheck size={12} color="#60a5fa"/>:<Check size={12}/>)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef}/>
        </div>

        {/* QUICK REPLIES - Professional Only */}
        {isProfessional && (
          <div style={{background:"white",padding:"10px 16px",borderTop:"1px solid #e5e7eb",display:"flex",gap:"8px",overflowX:"auto",flexShrink:0}}>
            {quickReplies.map((r,i)=>(
              <button key={i} onClick={()=>handleQuickReply(r.text)} disabled={sending} style={{background:"#fef3c7",color:"#92400e",border:"1px solid #fcd34d",padding:"6px 12px",borderRadius:"16px",fontSize:"0.8rem",fontWeight:"600",cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>
                {r.emoji} {r.text}
              </button>
            ))}
          </div>
        )}

        {/*  TYPING INDICATOR */}
        {typingUsers.length > 0 && (
          <div style={{
            background: "white",
            padding: "8px 16px",
            borderTop: "1px solid #f3f4f6",
            fontSize: "0.8rem",
            color: "#6b7280",
            fontStyle: "italic",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <div style={{display: "flex", gap: "3px"}}>
              <span style={{
                width: "6px",
                height: "6px",
                background: "#9ca3af",
                borderRadius: "50%",
                animation: "bounce 1.4s infinite ease-in-out both"
              }}></span>
              <span style={{
                width: "6px",
                height: "6px",
                background: "#9ca3af",
                borderRadius: "50%",
                animation: "bounce 1.4s infinite ease-in-out 0.16s both"
              }}></span>
              <span style={{
                width: "6px",
                height: "6px",
                background: "#9ca3af",
                borderRadius: "50%",
                animation: "bounce 1.4s infinite ease-in-out 0.32s both"
              }}></span>
            </div>
            <span>{typingUsers.length === 1 ? `${otherUser?.name || "User"} is typing...` : `${typingUsers.length} users are typing...`}</span>
          </div>
        )}

        {/* INPUT AREA */}
        <div style={{background:"white",padding:"14px 16px",borderTop:"1px solid #e5e7eb",display:"flex",gap:"10px",alignItems:"center",flexShrink:0}}>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} style={{display:"none"}}/>
          
          {/* IMAGE UPLOAD BUTTON */}
          <button 
            className="image-upload-btn"
            onClick={()=>fileInputRef.current?.click()} 
            disabled={uploadingImage} 
            title="Upload Image"
          >
            {uploadingImage ? (
              <Loader2 size={20} color="#d97706" style={{animation:"spin 1s linear infinite"}}/>
            ) : (
              <Paperclip size={20} color="#6b7280" />
            )}
          </button>

          <input 
            type="text" 
            value={newMessage} 
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }} 
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }} 
            placeholder="Type a message..." 
            style={{flex:1,padding:"10px 14px",border:"2px solid #e5e7eb",borderRadius:"20px",fontSize:"0.95rem",outline:"none",background:"#f9fafb"}}
          />
          
          <button onClick={handleSendMessage} disabled={!newMessage.trim()||sending} style={{background:newMessage.trim()&&!sending?"linear-gradient(135deg,#d97706,#b45309)":"#e5e7eb",color:newMessage.trim()&&!sending?"white":"#9ca3af",border:"none",borderRadius:"50%",width:"44px",height:"44px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            {sending?<Loader2 size={18} style={{animation:"spin 1s linear infinite"}}/>:<Send size={18}/>}
          </button>
        </div>
      </div>
    </>
  );
}