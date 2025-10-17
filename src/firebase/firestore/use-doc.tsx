
'use client';
    
import { useState, useEffect } from 'react';
import {
  DocumentReference,
  onSnapshot,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useMemoFirebase } from '@/firebase/provider'; // Ensure this is imported if useMemoFirebase is in provider.tsx

/** Utility type to add an 'id' field to a given type T. */
type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useDoc hook.
 * @template T Type of the document data.
 */
export interface UseDocResult<T> {
  data: WithId<T> | null; // Document data with ID, or null if not found.
  isLoading: boolean;       // True if loading.
  error: FirestoreError | Error | null; // Error object, or null.
}

/**
 * React hook to subscribe to a single Firestore document in real-time.
 * Handles nullable references.
 * 
 * IMPORTANT! YOU MUST MEMOIZE the inputted memoizedDocRef or BAD THINGS WILL HAPPEN.
 * Use useMemoFirebase to memoize it.
 *
 * @template T Optional type for document data. Defaults to any.
 * @param {DocumentReference<DocumentData> | null | undefined} memoizedDocRef -
 * The Firestore DocumentReference, created with useMemoFirebase. Waits if null/undefined.
 * @returns {UseDocResult<T>} Object with data, isLoading, error.
 */
export function useDoc<T = any>(
  memoizedDocRef: (DocumentReference<DocumentData> & {__memo?: boolean}) | null | undefined,
): UseDocResult<T> {
  type StateDataType = WithId<T> | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start loading true
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    // If the ref is not ready, reset state and wait.
    if (!memoizedDocRef) {
      setData(null);
      setIsLoading(true); // Technically waiting for the ref, so considered loading.
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      memoizedDocRef,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        if (snapshot.exists()) {
          setData({ ...(snapshot.data() as T), id: snapshot.id });
        } else {
          // Document does not exist, this is a valid state, not an error.
          setData(null);
        }
        setError(null); // Clear any previous error on successful snapshot
        setIsLoading(false);
      },
      (error: FirestoreError) => {
        const contextualError = new FirestorePermissionError({
          operation: 'get',
          path: memoizedDocRef.path,
        });

        // Set the error state for the component to handle.
        setError(contextualError);
        setData(null);
        setIsLoading(false);

        // Globally emit the rich error for developer visibility (dev-only feature).
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    return () => unsubscribe();
  }, [memoizedDocRef]);

  // Enforce memoization to prevent infinite loops.
  if (memoizedDocRef && !memoizedDocRef.__memo) {
    console.error('The DocumentReference passed to useDoc was not created with useMemoFirebase. This can cause infinite loops.', memoizedDocRef);
    throw new Error('useDoc requires a memoized DocumentReference. Please use the useMemoFirebase() hook.');
  }

  return { data, isLoading, error };
}
