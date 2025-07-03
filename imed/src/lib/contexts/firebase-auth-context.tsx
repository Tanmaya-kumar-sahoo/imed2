"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { getUserById } from "../services/user-service";
import { User as ImedUser } from "../models/user";

interface FirebaseAuthContextProps {
  currentUser: User | null;
  userData: ImedUser | null;
  loading: boolean;
  isAdmin: boolean;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextProps>({
  currentUser: null,
  userData: null,
  loading: true,
  isAdmin: false,
});

export const useFirebaseAuth = () => useContext(FirebaseAuthContext);

export const FirebaseAuthProvider = ({ 
  children 
}: { 
  children: React.ReactNode 
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<ImedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Get additional user data from Firestore
          const userDoc = await getUserById(user.uid);
          setUserData(userDoc);
          setIsAdmin(userDoc?.role === 'admin');
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUserData(null);
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
    isAdmin,
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}; 