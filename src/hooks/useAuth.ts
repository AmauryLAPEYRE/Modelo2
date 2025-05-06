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

  const register = async (
    email: string, 
    password: string, 
    name: string, 
    role: 'model' | 'professional', 
    professionalType?: 'coiffeur' | 'maquilleur' | 'photographe' | 'estheticienne',
    professionalStatus?: 'freelance' | 'auto-entrepreneur' | 'société',
    businessName?: string
  ) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Données de base pour tous les utilisateurs
    const userData: Omit<User, 'id'> = {
      email,
      name,
      role,
      createdAt: new Date(),
    };

    // Ajouter les champs spécifiques au rôle
    if (role === 'professional') {
      if (professionalType) {
        userData.professionalType = professionalType;
      }
      if (professionalStatus) {
        userData.professionalStatus = professionalStatus;
      }
      if (businessName) {
        userData.businessName = businessName;
      }
    } 
    else if (role === 'model') {
      // Initialiser la structure pour les modèles
      userData.modelProfile = {
        firstName: '',
        lastName: '',
        age: 0,
        gender: 'homme',
        height: 0,
        eyeColor: '',
        hairColor: '',
        experience: '',
        photos: {},
        socialMedia: {},
        availability: {
          weekdays: Array(7).fill(false),
          timeSlots: [],
        },
        location: {
          city: '',
          radius: 10,
        },
        interests: [],
      };
    }

    // Enregistrer les données dans Firestore
    await setDoc(doc(db, 'users', result.user.uid), userData);
    return result.user;
  };

  const logout = async () => {
    await signOut(auth);
  };

  // Fonction pour mettre à jour le profil utilisateur
  const updateUserProfile = async (userId: string, data: Partial<User>) => {
    if (!userId) throw new Error('ID utilisateur requis');
    
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, data, { merge: true });
    
    // Mettre à jour l'état local si c'est l'utilisateur actuel
    if (user && user.id === userId) {
      setUser({ ...user, ...data });
    }
  };

  return { user, loading, login, register, logout, updateUserProfile };
};