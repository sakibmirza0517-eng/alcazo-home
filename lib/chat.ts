import { db } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
  onSnapshot,
  orderBy,
  updateDoc,
  setDoc,
} from "firebase/firestore";

export interface ChatMessage {
  id: string;
  text: string;
  imageUrl: string | null;
  senderId: string;
  isSystem?: boolean;
  timestamp: any;
  read: boolean;
}

export const createOrGetChat = async (
  bookingId: string,
  customerId: string,
  professionalId: string
): Promise<string> => {
  try {
    const chatsRef = collection(db, "chats");
    const q = query(chatsRef, where("bookingId", "==", bookingId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].id;
    }

    const newChatRef = doc(chatsRef);
    await setDoc(newChatRef, {
      bookingId,
      customerId,
      professionalId,
      createdAt: serverTimestamp(),
      lastMessage: "",
      lastMessageTime: serverTimestamp(),
      typing: {},
      typingTime: {},
    });

    return newChatRef.id;
  } catch (error) {
    console.error("Error creating/getting chat:", error);
    throw error;
  }
};

export const sendMessage = async (
  chatId: string,
  senderId: string,
  text: string,
  imageUrl?: string | null
) => {
  try {
    const messagesRef = collection(db, "chats", chatId, "messages");
    
    await addDoc(messagesRef, {
      text: text,
      imageUrl: imageUrl || null,
      senderId: senderId,
      isSystem: false,
      timestamp: serverTimestamp(),
      read: false,
    });

    const chatRef = doc(db, "chats", chatId);
    await updateDoc(chatRef, {
      lastMessage: imageUrl ? "📷 Photo" : text,
      lastMessageTime: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const sendSystemMessage = async (chatId: string, text: string) => {
  try {
    const messagesRef = collection(db, "chats", chatId, "messages");
    
    await addDoc(messagesRef, {
      text: text,
      imageUrl: null,
      senderId: "system",
      isSystem: true,
      timestamp: serverTimestamp(),
      read: true,
    });

    const chatRef = doc(db, "chats", chatId);
    await updateDoc(chatRef, {
      lastMessage: text,
      lastMessageTime: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error sending system message:", error);
    throw error;
  }
};

export const listenToMessages = (
  chatId: string,
  callback: (messages: ChatMessage[]) => void
) => {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("timestamp", "asc"));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as ChatMessage[];
    callback(messages);
  });
};

export const markMessagesAsRead = async (chatId: string, userId: string) => {
  try {
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, where("read", "==", false));
    const snapshot = await getDocs(q);

    const updates = snapshot.docs
      .filter((docSnap) => docSnap.data().senderId !== userId)
      .map((docSnap) => updateDoc(docSnap.ref, { read: true }));

    if (updates.length > 0) {
      await Promise.all(updates);
    }
  } catch (error) {
    console.error("Error marking messages as read:", error);
  }
};

// ⭐ NEW: Typing Indicator Functions
export const setTypingStatus = async (
  chatId: string,
  userId: string,
  isTyping: boolean
) => {
  try {
    const chatRef = doc(db, "chats", chatId);
    await updateDoc(chatRef, {
      [`typing.${userId}`]: isTyping,
      [`typingTime.${userId}`]: isTyping ? serverTimestamp() : null,
    });
  } catch (error) {
    console.error("Error setting typing status:", error);
  }
};

export const listenToTypingStatus = (
  chatId: string,
  currentUserId: string,
  callback: (typingUsers: string[]) => void
) => {
  const chatRef = doc(db, "chats", chatId);
  
  return onSnapshot(chatRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      const typing = data.typing || {};
      
      const typingUsers = Object.keys(typing).filter(
        (uid) => uid !== currentUserId && typing[uid] === true
      );
      
      callback(typingUsers);
    }
  });
};