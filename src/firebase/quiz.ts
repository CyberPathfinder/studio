
'use client';
import { doc, getDoc, setDoc, deleteDoc, writeBatch, Firestore } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// This is a helper function to get firestore, you might have this in a different place
function getFirestore(): Firestore {
    const { initializeFirebase } = require('@/firebase');
    return initializeFirebase().firestore;
}

/**
 * Saves a quiz draft to Firestore.
 * This is a non-blocking operation.
 * @param userId The user's unique ID.
 * @param quizId The ID of the quiz.
 * @param draftData The data to save.
 */
export const saveQuizDraft = (
  userId: string,
  quizId: string,
  draftData: any
) => {
  if (!userId) return;
  const draftRef = doc(getFirestore(), `users/${userId}/intake_drafts/${quizId}`);
  setDoc(draftRef, draftData, { merge: true }).catch(error => {
    const contextualError = new FirestorePermissionError({
      path: draftRef.path,
      operation: 'write',
      requestResourceData: draftData,
    });
    errorEmitter.emit('permission-error', contextualError);
    console.error("Error saving quiz draft:", error);
  });
};

/**
 * Retrieves a quiz draft from Firestore.
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
    // This could be a permission error, but getDoc doesn't provide enough context
    // for our custom error. We'll log it for now.
    console.error("Error getting quiz draft:", error);
    return null;
  }
};


/**
 * Saves the final intake data and deletes the draft.
 * @param userId The user's unique ID.
 * @param quizId The ID of the quiz.
 * @param intakeData The final answers to save.
 */
export const saveIntakeData = async (
    userId: string,
    quizId: string,
    intakeData: any
) => {
    if (!userId) return;
    const db = getFirestore();
    const intakeRef = doc(db, `users/${userId}/intake/${quizId}`);
    const draftRef = doc(db, `users/${userId}/intake_drafts/${quizId}`);

    const batch = writeBatch(db);
    batch.set(intakeRef, { ...intakeData, completedAt: new Date().toISOString() });
    batch.delete(draftRef);

    await batch.commit().catch(error => {
        const contextualError = new FirestorePermissionError({
            path: `users/${userId}`,
            operation: 'write',
            requestResourceData: intakeData,
        });
        errorEmitter.emit('permission-error', contextualError);
        console.error("Error committing intake data batch:", error);
        // Re-throw to be caught by the calling function
        throw error;
    });
};


/**
 * Deletes a quiz draft from Firestore.
 * @param userId The user's unique ID.
 * @param quizId The ID of the quiz.
 */
export const deleteQuizDraft = async (userId: string, quizId: string) => {
  if (!userId) return;
  const draftRef = doc(getFirestore(), `users/${userId}/intake_drafts/${quizId}`);
  await deleteDoc(draftRef).catch(error => {
    const contextualError = new FirestorePermissionError({
      path: draftRef.path,
      operation: 'delete',
    });
    errorEmitter.emit('permission-error', contextualError);
    console.error("Error deleting quiz draft:", error);
  });
};
