// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { User } from '../types/models';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser({ id: firebaseUser.uid, ...userDoc.data() } as User);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  };

  const register = async (email: string, password: string, name: string, role: 'model' | 'professional') => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    const userData: Omit<User, 'id'> = {
      email,
      name,
      role,
      createdAt: new Date(),
    };

    await setDoc(doc(db, 'users', result.user.uid), userData);
    return result.user;
  };

  const logout = async () => {
    await signOut(auth);
  };

  return { user, loading, login, register, logout };
};