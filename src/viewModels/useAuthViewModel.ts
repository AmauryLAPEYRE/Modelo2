// src/viewModels/useAuthViewModel.ts
import { User as FirebaseUser } from 'firebase/auth';
import { create } from 'zustand';
import { User } from '../domain/models/UserModel';
import {
  AuthCredentials,
  RegisterData,
  loginUser,
  registerUser,
  signOut
} from '../services/firebase/auth';
import { getDocument } from '../services/firebase/firestore';

interface AuthState {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: AuthCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  setCurrentUser: (firebaseUser: FirebaseUser | null) => Promise<void>;
  setIsLoading: (isLoading: boolean) => void;
  clearError: () => void;
}

export const useAuthViewModel = create<AuthState>((set, get) => ({
  currentUser: null,
  firebaseUser: null,
  isLoading: true,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const firebaseUser = await loginUser(credentials);
      await get().setCurrentUser(firebaseUser);
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const user = await registerUser(data);
      set({ currentUser: user, firebaseUser: null });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await signOut();
      set({ currentUser: null, firebaseUser: null });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  setCurrentUser: async (firebaseUser) => {
    if (!firebaseUser) {
      set({ currentUser: null, firebaseUser: null });
      return;
    }

    try {
      // Récupérer les données utilisateur depuis Firestore
      const userData = await getDocument<User>('users', firebaseUser.uid);
      set({ 
        currentUser: userData,
        firebaseUser: firebaseUser 
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Même en cas d'erreur, nous gardons l'utilisateur Firebase
      set({ 
        currentUser: null,
        firebaseUser: firebaseUser,
        error: (error as Error).message
      });
    }
  },

  setIsLoading: (isLoading) => {
    set({ isLoading });
  },

  clearError: () => {
    set({ error: null });
  },
}));
