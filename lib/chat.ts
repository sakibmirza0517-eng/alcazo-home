import { db } from "./firebase";
import { 
  collection, 
  doc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  serverTimestamp,
  getDocs
} from "firebase/firestore";

// Chat room create karna (agar nahi hai toh)
export const createOrGetChat = async (bookingId: string, customerUid: string, professionalUid: string) => {
  try {
    // Check if chat already exists
    const chatQuery = query(collection(db, "chats"), where("bookingId", "==", bookingId));
    const chatSnapshot = await getDocs(chatQuery);
    
    if (!chatSnapshot.empty) {
      // Chat already exists
      return chatSnapshot.docs[0].id;
    }
    
    // Create new chat
    const chatRef = await addDoc(collection(db, "chats"), {
      bookingId: bookingId,
      participants: [customerUid, professionalUid],
      lastMessage: "",
      lastMessageTime: serverTimestamp(),
      createdAt: serverTimestamp()
    });
    
    return chatRef.id;
  } catch (error) {
    console.error("Error creating chat:", error);
    throw error;
  }
};

// Message send karna
export const sendMessage = async (chatId: string, senderId: string, text: string) => {
  try {
    const messageRef = collection(db, "chats", chatId, "messages");
    
    await addDoc(messageRef, {
      text: text,
      senderId: senderId,
      timestamp: serverTimestamp(),
      read: false
    });
    
    // Update last message in chat document
    await updateDoc(doc(db, "chats", chatId), {
      lastMessage: text,
      lastMessageTime: serverTimestamp()
    });
    
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// Messages ko real-time listen karna
export const listenToMessages = (chatId: string, callback: (messages: any[]) => void) => {
  const messagesQuery = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("timestamp", "asc")
  );
  
  const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
    const messagesList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(messagesList);
  });
  
  return unsubscribe;
};

// Messages ko mark as read karna
export const markMessagesAsRead = async (chatId: string, userId: string) => {
  try {
    const messagesQuery = query(
      collection(db, "chats", chatId, "messages"),
      where("read", "==", false)
    );
    
    const snapshot = await getDocs(messagesQuery);
    
    const updatePromises = snapshot.docs.map(messageDoc => {
      const messageData = messageDoc.data();
      // Sirf dusre user ke messages mark karo
      if (messageData.senderId !== userId) {
        return updateDoc(messageDoc.ref, { read: true });
      }
      return Promise.resolve();
    });
    
    await Promise.all(updatePromises);
  } catch (error) {
    console.error("Error marking messages as read:", error);
  }
};

// Chat ID get karna booking se
export const getChatIdByBooking = async (bookingId: string): Promise<string | null> => {
  try {
    const chatQuery = query(collection(db, "chats"), where("bookingId", "==", bookingId));
    const chatSnapshot = await getDocs(chatQuery);
    
    if (chatSnapshot.empty) {
      return null;
    }
    
    return chatSnapshot.docs[0].id;
  } catch (error) {
    console.error("Error getting chat ID:", error);
    return null;
  }
};