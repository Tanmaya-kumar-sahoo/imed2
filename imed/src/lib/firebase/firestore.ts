import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  limit,
  DocumentData,
  QueryConstraint,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

// Create a new document with auto-generated ID
export const createDocument = async (collectionName: string, data: any) => {
  try {
    const docRef = doc(collection(db, collectionName));
    await setDoc(docRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error('Error creating document:', error);
    throw error;
  }
};

// Create a document with a specific ID
export const createDocumentWithId = async (collectionName: string, docId: string, data: any) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: docId, ...data };
  } catch (error) {
    console.error('Error creating document with ID:', error);
    throw error;
  }
};

// Get a document by ID
export const getDocument = async (collectionName: string, docId: string) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
};

// Update a document
export const updateDocument = async (collectionName: string, docId: string, data: any) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return { id: docId, ...data };
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
};

// Delete a document
export const deleteDocument = async (collectionName: string, docId: string) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return { id: docId };
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

// Query documents
export const queryDocuments = async (
  collectionName: string,
  constraints: QueryConstraint[] = []
) => {
  try {
    const q = query(collection(db, collectionName), ...constraints);
    const querySnapshot = await getDocs(q);
    
    const documents: DocumentData[] = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    
    return documents;
  } catch (error) {
    console.error('Error querying documents:', error);
    throw error;
  }
};

// Helper to create where constraints
export const whereConstraint = (field: string, operator: any, value: any) => {
  return where(field, operator, value);
};

// Helper to create orderBy constraints
export const orderByConstraint = (field: string, direction: 'asc' | 'desc' = 'asc') => {
  return orderBy(field, direction);
};

// Helper to create limit constraint
export const limitConstraint = (limitCount: number) => {
  return limit(limitCount);
}; 