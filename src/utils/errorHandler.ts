// src/utils/errorHandler.ts
import { Alert } from 'react-native';

export interface AppError {
  code: string;
  message: string;
  details?: any;
}

export const handleError = (error: unknown, context?: string): void => {
  console.error(`Error in ${context || 'unknown context'}:`, error);
  
  let message = 'Une erreur est survenue';
  
  if (error instanceof Error) {
    // Gérer les erreurs Firebase spécifiques
    if (error.message.includes('auth/')) {
      switch (error.message) {
        case 'auth/user-not-found':
          message = 'Utilisateur non trouvé';
          break;
        case 'auth/wrong-password':
          message = 'Mot de passe incorrect';
          break;
        case 'auth/email-already-in-use':
          message = 'Cet email est déjà utilisé';
          break;
        case 'auth/invalid-email':
          message = 'Email invalide';
          break;
        case 'auth/weak-password':
          message = 'Le mot de passe est trop faible';
          break;
        default:
          message = error.message;
      }
    } else {
      message = error.message;
    }
  }
  
  Alert.alert('Erreur', message, [{ text: 'OK' }]);
};

export const createAppError = (code: string, message: string, details?: any): AppError => {
  return {
    code,
    message,
    details,
  };
};