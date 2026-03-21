import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const trackGeneratorClick = async (generatorId: string) => {
  if (!auth.currentUser) return;
  try {
    await addDoc(collection(db, 'generator_clicks'), {
      userId: auth.currentUser.uid,
      userEmail: auth.currentUser.email,
      generatorId: generatorId,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Error tracking generator click:", error);
  }
};
