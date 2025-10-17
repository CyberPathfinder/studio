
'use client';

import { deleteDoc, doc, getDoc, setDoc, writeBatch, type Firestore } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { logger } from '@/lib/logger';

// This is a helper function to get firestore, you might have this in a different place
function getFirestore(): Firestore {
    const { initializeFirebase } = require('@/firebase');
    return initializeFirebase().firestore;
}

/**
 * Saves a quiz draft to Firestore.
 * The caller can choose to await this Promise or let it resolve in the background.
 * @param userId The user's unique ID.
 * @param quizId The ID of the quiz.
 * @param draftData The data to save.
 */
export const saveQuizDraft = async (
  userId: string,
  quizId: string,
  draftData: any
): Promise<void> => {
  if (!userId) return;

  const draftRef = doc(getFirestore(), `users/${userId}/intake_drafts/${quizId}`);

  try {
    await setDoc(draftRef, draftData, { merge: true });
  } catch (error) {
    const contextualError = new FirestorePermissionError({
      path: draftRef.path,
      operation: 'write',
      requestResourceData: draftData,
    });
    errorEmitter.emit('permission-error', contextualError);
    throw error;
  }
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
    logger.error("Error getting quiz draft:", error);
    return null;
  }
};


/**
 * Saves the final intake data and deletes the draft.
 * @param userId The user's unique ID.
 * @param intakeDocId The document ID for the intake data (e.g., 'initial').
 * @param intakeData The final answers to save.
 */
export const saveIntakeData = async (
    userId: string,
    intakeDocId: string,
    intakeData: any
) => {
    if (!userId) return;
    const db = getFirestore();
    // The original quizId is used to find the draft to delete
    const quizId = 'vivaform_intake_v1';
    const intakeRef = doc(db, `users/${userId}/intake/${intakeDocId}`);
    const draftRef = doc(db, `users/${userId}/intake_drafts/${quizId}`);

    const batch = writeBatch(db);
    batch.set(intakeRef, intakeData);
    batch.delete(draftRef);

    await batch.commit().catch(error => {
        const contextualError = new FirestorePermissionError({
            path: `users/${userId}`,
            operation: 'write',
            requestResourceData: intakeData,
        });
        errorEmitter.emit('permission-error', contextualError);
        // logger.error("Error committing intake data batch:", error);
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
    // logger.error("Error deleting quiz draft:", error);
  });
};
