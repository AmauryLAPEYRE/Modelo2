// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  UserCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

// Types pour les utilisateurs
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'model' | 'professional';
  professionalType?: 'coiffeur' | 'maquilleur' | 'photographe' | 'estheticienne';
  createdAt: Date;
  // autres champs...
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            setUser({
              id: firebaseUser.uid,
              ...userDoc.data() as Omit<User, 'id'>
            });
          } else {
            setUser(null);
            await signOut(auth);
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des données utilisateur:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fonction d'inscription
  const register = async (
    email: string,
    password: string,
    name: string,
    role: 'model' | 'professional',
    professionalType?: 'coiffeur' | 'maquilleur' | 'photographe' | 'estheticienne'
  ): Promise<UserCredential> => {
    try {
      // Vérifications de base
      if (!email) throw new Error('Email manquant');
      if (!password) throw new Error('Mot de passe manquant');
      if (!name) throw new Error('Nom manquant');
      if (!role) throw new Error('Rôle manquant');
      if (role === 'professional' && !professionalType) {
        throw new Error('Type professionnel manquant pour un compte professionnel');
      }
      
      // Validation du mot de passe
      if (password.length < 6) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères');
      }
      
      // Validation de l'email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Format d\'email invalide');
      }
      
      // Création de l'utilisateur dans Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Création du document utilisateur dans Firestore
      const userData: Omit<User, 'id'> & { createdAt: Date } = {
        email,
        name,
        role,
        createdAt: new Date(),
      };
      
      if (role === 'professional' && professionalType) {
        userData.professionalType = professionalType;
      }
      
      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      
      return userCredential;
    } catch (error: any) {
      console.error("Erreur lors de l'inscription:", error);
      
      // Fournir des messages d'erreur plus spécifiques basés sur les codes d'erreur Firebase
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Cette adresse email est déjà utilisée');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('L\'adresse email est invalide');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Le mot de passe est trop faible');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Problème de connexion réseau. Vérifiez votre connexion internet.');
      }
      
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<UserCredential> => {
    try {
      if (!email) throw new Error('Email manquant');
      if (!password) throw new Error('Mot de passe manquant');
      
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error("Erreur lors de la connexion:", error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error('Email ou mot de passe incorrect');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Format d\'email invalide');
      } else if (error.code === 'auth/user-disabled') {
        throw new Error('Ce compte a été désactivé');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Trop de tentatives infructueuses. Veuillez réessayer plus tard');
      }
      
      throw error;
    }
  };

  // Fonction de déconnexion
  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      throw error;
    }
  };

  return {
    user,
    loading,
    register,
    login,
    logout
  };
};