
import { initializeApp, getApp, getApps, type FirebaseOptions } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { credential } from 'firebase-admin';

// IMPORTANT: Path to your service account key file
const serviceAccount = require('../../service-account.json');

const firebaseConfig: FirebaseOptions = {
    credential: credential.cert(serviceAccount),
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
