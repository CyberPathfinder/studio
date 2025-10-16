'use client';
import { doc, getDoc, setDoc, Firestore } from 'firebase/firestore';

/**
 * Saves a quiz draft to Firestore.
 * @param db The Firestore instance.
 * @param userId The user's unique ID.
 * @param quizId The ID of the quiz.
 * @param draftData The data to save.
 */
export const saveQuizDraft = async (
  userId: string,
  quizId: string,
  draftData: any
) => {
  if (!userId) return;
  const draftRef = doc(getFirestore(), `users/${userId}/intake_drafts/${quizId}`);
  try {
    await setDoc(draftRef, draftData, { merge: true });
  } catch (error) {
    console.error("Error saving quiz draft:", error);
    // In a real app, you'd emit this to a global error handler.
    // For now, we'll just log it.
  }
};

/**
 * Retrieves a quiz draft from Firestore.
 * @param db The Firestore instance.
 * @param userId The user's unique ID.
 * @param quizId The ID of the quiz.
 * @returns The draft data or null if not found.
 */
export const getQuizDraft = async (
  userId: string,
  quizId: string,
): Promise<any | null> => {
  if (!userId) return null;
  const draftRef = doc(getFirestore(), `users/${userId}/intake_drafts/${quizId}`);
  try {
    const docSnap = await getDoc(draftRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting quiz draft:", error);
    return null;
  }
};

// This is a helper function to get firestore, you might have this in a different place
function getFirestore(): Firestore {
    const { initializeFirebase } = require('@/firebase');
    return initializeFirebase().firestore;
}
