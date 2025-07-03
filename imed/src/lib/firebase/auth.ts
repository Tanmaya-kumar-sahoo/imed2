import { 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from './config';
import { createDocumentWithId } from './firestore';

// Sign out
export const signOutUser = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Store user in Firestore
const storeUserInFirestore = async (user: User) => {
  try {
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: 'user', // Default role
      lastLogin: new Date().toISOString(),
    };
    
    await createDocumentWithId('users', user.uid, userData);
  } catch (error) {
    console.error('Error storing user in Firestore:', error);
  }
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
}; 