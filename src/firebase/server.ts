import { readFileSync } from 'node:fs';

import type { ServiceAccount } from 'firebase-admin';
import { credential } from 'firebase-admin';
import { getApp, getApps, initializeApp, type AppOptions } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function loadServiceAccount(): ServiceAccount {
  const serviceAccountFromEnv = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (serviceAccountFromEnv) {
    try {
      return JSON.parse(serviceAccountFromEnv) as ServiceAccount;
    } catch (error) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable contains invalid JSON.');
    }
  }

  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (credentialsPath) {
    try {
      const fileContents = readFileSync(credentialsPath, 'utf-8');
      return JSON.parse(fileContents) as ServiceAccount;
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to read Firebase service account file at ${credentialsPath}: ${reason}`);
    }
  }

  throw new Error(
    'Firebase service account credentials are not configured. Set FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS.'
  );
}

const firebaseConfig: AppOptions = {
  credential: credential.cert(loadServiceAccount()),
};

export function initializeFirebase() {
  if (!getApps().length) {
    const firebaseApp = initializeApp(firebaseConfig);
    return {
      firestore: getFirestore(firebaseApp),
    };
  }
  const firebaseApp = getApp();
  return {
    firestore: getFirestore(firebaseApp),
  };
}
