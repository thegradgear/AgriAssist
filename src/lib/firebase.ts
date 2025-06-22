import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, updateProfile } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  addDoc,
  query,
  getDocs,
  orderBy,
  deleteDoc,
  serverTimestamp,
  where,
  limit
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { 
    app, 
    auth, 
    db, 
    updateProfile, 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc,
    collection,
    addDoc,
    query,
    getDocs,
    orderBy,
    deleteDoc,
    serverTimestamp,
    where,
    limit
};
