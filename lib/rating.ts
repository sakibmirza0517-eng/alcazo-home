import { db } from "./firebase";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  getDocs,
  serverTimestamp
} from "firebase/firestore";

// Rating submit karna
export const submitRating = async (
  bookingId: string,
  customerId: string,
  professionalId: string,
  rating: number,
  review: string
) => {
  try {
    // 1. Rating ko database mein save karo
    await addDoc(collection(db, "ratings"), {
      bookingId,
      customerId,
      professionalId,
      rating,
      review,
      createdAt: serverTimestamp()
    });

    // 2. Booking ko "rated" mark karo
    await updateDoc(doc(db, "bookings", bookingId), {
      rated: true,
      rating: rating,
      review: review
    });

    // 3. Professional ki average rating calculate karo
    const ratingsQuery = query(
      collection(db, "ratings"),
      where("professionalId", "==", professionalId)
    );
    const ratingsSnapshot = await getDocs(ratingsQuery);
    
    let totalRating = 0;
    ratingsSnapshot.forEach(doc => {
      totalRating += doc.data().rating;
    });
    
    const averageRating = totalRating / ratingsSnapshot.size;
    
    // 4. Professional document update karo
    await updateDoc(doc(db, "professionals", professionalId), {
      averageRating: averageRating,
      totalRatings: ratingsSnapshot.size
    });

    return { success: true };
  } catch (error) {
    console.error("Error submitting rating:", error);
    return { success: false, error };
  }
};

// Professional ki ratings fetch karna
export const getProfessionalRatings = async (professionalId: string) => {
  try {
    const ratingsQuery = query(
      collection(db, "ratings"),
      where("professionalId", "==", professionalId)
    );
    const ratingsSnapshot = await getDocs(ratingsQuery);
    
    const ratings = ratingsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return ratings;
  } catch (error) {
    console.error("Error fetching ratings:", error);
    return [];
  }
};