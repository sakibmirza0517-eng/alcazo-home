"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  doc, 
  getDoc 
} from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { ArrowLeft, MessageCircle, Search } from "lucide-react";

interface ChatItem {
  id: string;
  bookingId: string;
  otherUserName: string;
  otherUserRole: string;
  lastMessage: string;
  lastMessageTime: any;
  serviceType?: string;
}

export default function MessagesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
        fetchChats(currentUser.uid);
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  // ✅ SUPER FIXED: Fetches name from bookings -> users/professionals if chat data is missing
  const fetchChats = async (uid: string) => {
    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatList: ChatItem[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        
        const isCustomer = data.customerId === uid;
        
        // Step 1: Pehle chat document se ID aur Name lo
        let otherUserId = isCustomer ? data.professionalId : data.customerId;
        let otherUserName = isCustomer ? data.professionalName : data.customerName;
        
        console.log("🔍 Chat ID:", docSnap.id, "| Initial Other User ID:", otherUserId, "| Current Name:", otherUserName);

        // 🚨 STEP 2: SUPER FALLBACK - Agar chat mein ID undefined hai, toh Booking se lo!
        if (!otherUserId && data.bookingId) {
          console.log("⚠️ User ID missing in chat. Fetching from Booking:", data.bookingId);
          try {
            const bookingDoc = await getDoc(doc(db, "bookings", data.bookingId));
            if (bookingDoc.exists()) {
              const bookingData = bookingDoc.data();
              otherUserId = isCustomer ? bookingData.professionalId : bookingData.customerId;
              otherUserName = isCustomer ? bookingData.professionalName : bookingData.customerName;
              console.log("✅ Found IDs in Booking! New Other User ID:", otherUserId);
            }
          } catch (err) {
            console.error("Error fetching booking for fallback:", err);
          }
        }

        const isPlaceholder = !otherUserName || otherUserName === "Customer" || otherUserName === "Professional" || otherUserName === "Unknown User";

        // Step 3: Ab jab hamare paas valid otherUserId hai, users/professionals collection se naam lao
        if (isPlaceholder && otherUserId) {
          try {
            let userData = null;

            // Pehle 'professionals' check karo
            let userDoc = await getDoc(doc(db, "professionals", otherUserId));
            if (userDoc.exists()) {
              userData = userDoc.data();
              console.log("✅ Found in 'professionals':", userData);
            }

            // Nahi mila toh 'users' collection check karo (jahan 'name' field hai)
            if (!userData) {
              userDoc = await getDoc(doc(db, "users", otherUserId));
              if (userDoc.exists()) {
                userData = userDoc.data();
                console.log("✅ Found in 'users':", userData);
              }
            }

            // Naam extract karo (tumhare database mein 'name' field hai)
            if (userData) {
              otherUserName = userData.name || userData.fullName || userData.displayName || userData.firstName || userData.shopName || "User";
              console.log("🎯 Final Name Set To:", otherUserName);
            } else {
              console.log("❌ User ID", otherUserId, "not found in 'users' or 'professionals'");
            }

          } catch (error) {
            console.error("Error fetching user name:", error);
          }
        }

        // Final fallback agar phir bhi kuch na mile
        if (!otherUserName || otherUserName === "Customer" || otherUserName === "Professional" || otherUserName === "Unknown User") {
          otherUserName = isCustomer ? "Professional" : "Customer";
        }

        const otherUserRole = isCustomer ? "Professional" : "Customer";

        chatList.push({
          id: docSnap.id,
          bookingId: data.bookingId,
          otherUserName: otherUserName,
          otherUserRole,
          lastMessage: data.lastMessage || "Say hi! 👋",
          lastMessageTime: data.lastMessageTime,
          serviceType: data.serviceType || "Service",
        });
      }

      // JavaScript se sort karo (Instant, no Firebase index needed!)
      chatList.sort((a, b) => {
        const timeA = a.lastMessageTime?.toDate ? a.lastMessageTime.toDate().getTime() : 0;
        const timeB = b.lastMessageTime?.toDate ? b.lastMessageTime.toDate().getTime() : 0;
        return timeB - timeA; 
      });

      setChats(chatList);
      setLoading(false);
    });

    return () => unsubscribe();
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    } else if (days === 1) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    }
  };

  const handleChatClick = (bookingId: string) => {
    router.push(`/chat/${bookingId}`);
  };

  const filteredChats = chats.filter((chat) =>
    chat.otherUserName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", fontFamily: "system-ui" }}>
      {/* Header */}
      <div style={{ 
        background: "linear-gradient(135deg, #d97706, #b45309)", 
        padding: "16px 20px", 
        display: "flex", 
        alignItems: "center", 
        gap: "16px", 
        position: "sticky", 
        top: 0, 
        zIndex: 10, 
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)" 
      }}>
        <button 
          onClick={() => router.back()} 
          style={{ 
            background: "none", 
            border: "none", 
            cursor: "pointer", 
            color: "white", 
            padding: "4px",
            display: "flex",
            alignItems: "center"
          }}
        >
          <ArrowLeft size={24} />
        </button>
        <h1 style={{ margin: 0, color: "white", fontSize: "1.25rem", fontWeight: "700" }}>
          Messages
        </h1>
      </div>

      {/* Search Bar */}
      <div style={{ padding: "12px 16px", background: "white", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "10px", 
          background: "#f3f4f6", 
          padding: "10px 16px", 
          borderRadius: "24px" 
        }}>
          <Search size={18} color="#9ca3af" />
          <input 
            type="text" 
            placeholder="Search chats..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              border: "none", 
              background: "transparent", 
              outline: "none", 
              flex: 1, 
              fontSize: "0.95rem" 
            }} 
          />
        </div>
      </div>

      {/* Chat List */}
      <div style={{ padding: "0 0 80px 0" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#6b7280" }}>
            <div style={{
              width: "40px",
              height: "40px",
              border: "4px solid #fbbf24",
              borderTop: "4px solid #d97706",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px"
            }} />
            <p>Loading chats...</p>
          </div>
        ) : filteredChats.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "#6b7280" }}>
            <MessageCircle size={80} style={{ margin: "0 auto 20px", opacity: 0.3 }} />
            <h3 style={{ margin: "0 0 8px 0", color: "#374151", fontSize: "1.3rem" }}>
              {searchQuery ? "No chats found" : "No messages yet"}
            </h3>
            <p style={{ margin: 0, fontSize: "0.95rem" }}>
              {searchQuery ? "Try a different search term" : "Book a service to start chatting!"}
            </p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div 
              key={chat.id} 
              onClick={() => handleChatClick(chat.bookingId)}
              style={{ 
                background: "white", 
                padding: "16px", 
                borderBottom: "1px solid #f3f4f6", 
                display: "flex", 
                gap: "14px", 
                cursor: "pointer",
                transition: "background 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
              onMouseLeave={(e) => e.currentTarget.style.background = "white"}
            >
              {/* Avatar */}
              <div style={{ 
                width: "56px", 
                height: "56px", 
                borderRadius: "50%", 
                background: "linear-gradient(135deg, #d97706, #b45309)", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                color: "white", 
                fontWeight: "700", 
                fontSize: "1.3rem",
                flexShrink: 0,
                boxShadow: "0 2px 8px rgba(217, 119, 6, 0.2)"
              }}>
                {chat.otherUserName.charAt(0).toUpperCase()}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "baseline", 
                  marginBottom: "6px" 
                }}>
                  <h3 style={{ 
                    margin: 0, 
                    fontSize: "1.05rem", 
                    fontWeight: "600", 
                    color: "#111827",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}>
                    {chat.otherUserName}
                  </h3>
                  <span style={{ fontSize: "0.75rem", color: "#9ca3af", flexShrink: 0, marginLeft: "8px" }}>
                    {formatTime(chat.lastMessageTime)}
                  </span>
                </div>
                
                <p style={{ 
                  margin: "0 0 6px 0", 
                  fontSize: "0.9rem", 
                  color: "#6b7280", 
                  overflow: "hidden", 
                  textOverflow: "ellipsis", 
                  whiteSpace: "nowrap" 
                }}>
                  {chat.lastMessage}
                </p>
                
                <div style={{ 
                  display: "inline-block",
                  background: "#fef3c7",
                  color: "#92400e",
                  padding: "3px 10px",
                  borderRadius: "12px",
                  fontSize: "0.75rem",
                  fontWeight: "500"
                }}>
                  {chat.serviceType} • {chat.otherUserRole}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}