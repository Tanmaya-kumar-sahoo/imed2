import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyATRCrlLRLe_XR5paKpYmPS7Xgg8kGCEDY",
  authDomain: "imed-dd6ca.firebaseapp.com",
  projectId: "imed-dd6ca",
  storageBucket: "imed-dd6ca.firebasestorage.app",
  messagingSenderId: "741441903969",
  appId: "1:741441903969:web:726cf396e136c458753920",
  measurementId: "G-H8DY2M6DDH"
};

// Initialize Firebase
let firebaseApp: FirebaseApp;
let analytics: any;

if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
  // Only initialize analytics on the client side
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(firebaseApp);
  }
} else {
  firebaseApp = getApps()[0];
}

// Initialize Firebase services
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

export { auth, db, storage, analytics }; 