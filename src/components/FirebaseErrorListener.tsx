
'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

/**
 * An invisible component that listens for globally emitted 'permission-error' events.
 * In development, it throws the error to be caught by Next.js's global-error.tsx.
 * In production, it shows a user-friendly toast notification.
 */
export function FirebaseErrorListener() {
  const [error, setError] = useState<FirestorePermissionError | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
        if (process.env.NODE_ENV === 'development') {
            // In development, throw the error to get the rich overlay
            setError(error);
        } else {
            // In production, show a generic toast and log the error
            logger.error('Firestore Permission Error:', error);
            toast({
                variant: 'destructive',
                title: 'Permission Denied',
                description: 'You do not have permission to perform this action.',
            });
        }
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  // On re-render, if an error exists in state (only in dev), throw it.
  if (error) {
    throw error;
  }

  // This component renders nothing.
  return null;
}
