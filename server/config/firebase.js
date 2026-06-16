import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

dotenv.config();

let db = null;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString('utf8'));
    
    initializeApp({
      credential: cert(serviceAccount)
    });
    
    db = getFirestore();
    console.log("🔥 Firebase Firestore initialized successfully.");
  } else {
    console.warn("⚠️ FIREBASE_SERVICE_ACCOUNT_KEY is missing in .env. Firestore will not be connected.");
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
}

export { db };
