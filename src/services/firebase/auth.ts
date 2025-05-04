// src/services/firebase/auth.ts
import {
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { User, UserRole } from '../../domain/models/UserModel';
import { auth, firestore } from './config';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends AuthCredentials {
  displayName: string;
  role: UserRole;
}

export const registerUser = async (data: RegisterData): Promise<User> => {
  try {
    // Créer l'utilisateur dans Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      data.email, 
      data.password
    );
    
    // Mettre à jour le profil avec le nom d'affichage
    await updateProfile(userCredential.user, {
      displayName: data.displayName
    });

    // Créer le document utilisateur dans Firestore
    const userData: Omit<User, 'id'> & { id: string } = {
      id: userCredential.user.uid,
      email: data.email,
      displayName: data.displayName,
      role: data.role,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Champs spécifiques au rôle
      ...(data.role === 'professional' ? { profession: 'other' } : {})
    } as User;

    await setDoc(doc(firestore, 'users', userCredential.user.uid), userData);

    return userData;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const loginUser = async (credentials: AuthCredentials) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth, 
      credentials.email, 
      credentials.password
    );
    return userCredential.user;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};