// src/services/firebase/firestore.ts
import {
    collection,
    deleteDoc,
    DocumentData,
    getDoc,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    Query,
    updateDoc,
    where,
    WhereFilterOp
} from 'firebase/firestore';

export const createDocument = async <T>(
  collectionName: string, 
  data: Omit<T, 'id'>, 
  id?: string
): Promise<T> => {
  try {
    const docRef = id 
      ? doc(firestore, collectionName, id) 
      : doc(collection(firestore, collectionName));
    
    const timestamp = new Date();
    const docData = {
      ...data,
      id: docRef.id,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    await setDoc(docRef, docData);
    return docData as T;
  } catch (error) {
    console.error(`Error creating document in ${collectionName}:`, error);
    throw error;
  }
};

export const updateDocument = async <T>(
  collectionName: string, 
  id: string, 
  data: Partial<T>
): Promise<T> => {
  try {
    const docRef = doc(firestore, collectionName, id);
    const updateData = {
      ...data,
      updatedAt: new Date()
    };
    
    await updateDoc(docRef, updateData);
    
    // Récupérer et retourner le document mis à jour
    const docSnap = await getDoc(docRef);
    return { id: docSnap.id, ...docSnap.data() } as T;
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw error;
  }
};

export const getDocument = async <T>(
  collectionName: string, 
  id: string
): Promise<T | null> => {
  try {
    const docRef = doc(firestore, collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error);
    throw error;
  }
};

export const queryDocuments = async <T>(
  collectionName: string,
  constraints: Array<{
    field: string;
    operator: WhereFilterOp;
    value: any;
  }> = [],
  orderByField?: string,
  orderDirection?: 'asc' | 'desc',
  limitCount?: number
): Promise<T[]> => {
  try {
    let q: Query<DocumentData> = collection(firestore, collectionName);
    
    // Appliquer les filtres
    constraints.forEach(constraint => {
      q = query(q, where(constraint.field, constraint.operator, constraint.value));
    });
    
    // Appliquer le tri
    if (orderByField) {
      q = query(q, orderBy(orderByField, orderDirection || 'asc'));
    }
    
    // Appliquer la limite
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  } catch (error) {
    console.error(`Error querying documents from ${collectionName}:`, error);
    throw error;
  }
};

export const deleteDocument = async (
  collectionName: string, 
  id: string
): Promise<void> => {
  try {
    await deleteDoc(doc(firestore, collectionName, id));
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    throw error;
  }
};

export const subscribeToDocument = <T>(
  collectionName: string,
  id: string,
  callback: (data: T | null) => void
) => {
  const docRef = doc(firestore, collectionName, id);
  
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() } as T);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error(`Error subscribing to document from ${collectionName}:`, error);
  });
};
