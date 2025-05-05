// src/utils/validation.ts

// Expressions régulières pour validation
export const REGEX_PATTERNS = {
  EMAIL: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  PHONE: /^(\+33|0)[1-9](\d{2}){4}$/,
  INSTAGRAM: /^@([A-Za-z0-9_.]+)$/,
  URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
};

// Validation simple pour les formulaires
export const validateRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return Boolean(value);
};

// Nettoyage des entrées utilisateur
export const sanitizeInput = (input: string): string => {
  // Supprime les caractères spéciaux potentiellement dangereux
  return input.replace(/[<>]/g, '').trim();
};

// Validation d'email
export const validateEmail = (email: string): boolean => {
  return REGEX_PATTERNS.EMAIL.test(email);
};

// Validation du mot de passe
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('Le mot de passe doit contenir au moins 6 caractères');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validation des informations de prestation
export const validateServiceInput = (data: {
  title: string;
  description: string;
  location: string;
  duration: string;
  compensationType: 'free' | 'paid' | 'tfp';
  amount?: string;
}): {
  isValid: boolean;
  errors: Record<string, string>;
} => {
  const errors: Record<string, string> = {};
  
  if (!validateRequired(data.title)) {
    errors.title = 'Le titre est requis';
  } else if (data.title.length < 3) {
    errors.title = 'Le titre doit contenir au moins 3 caractères';
  }
  
  if (!validateRequired(data.description)) {
    errors.description = 'La description est requise';
  } else if (data.description.length < 10) {
    errors.description = 'La description doit contenir au moins 10 caractères';
  }
  
  if (!validateRequired(data.location)) {
    errors.location = 'Le lieu est requis';
  }
  
  const duration = parseInt(data.duration);
  if (isNaN(duration) || duration < 15 || duration > 480) {
    errors.duration = 'La durée doit être entre 15 et 480 minutes';
  }
  
  if (data.compensationType === 'paid') {
    const amount = parseInt(data.amount || '');
    if (isNaN(amount) || amount < 0) {
      errors.amount = 'Le montant doit être un nombre positif';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Validation du format de date
export const validateDate = (date: Date | string): boolean => {
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime()) && dateObj > new Date();
};

// Vérification de sécurité des mots de passe (côté client basique)
export const checkPasswordStrength = (password: string): {
  score: number;
  feedback: string;
} => {
  let score = 0;
  const feedback: string[] = [];
  
  if (password.length >= 8) {
    score += 20;
  } else {
    feedback.push('Utilisez au moins 8 caractères');
  }
  
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[0-9]/.test(password)) score += 15;
  if (/[^A-Za-z0-9]/.test(password)) score += 20;
  
  if (/(.)\1{2,}/.test(password)) {
    score -= 15;
    feedback.push('Évitez les caractères répétés');
  }
  
  if (score > 100) score = 100;
  
  let strength = 'Faible';
  if (score >= 40) strength = 'Moyen';
  if (score >= 60) strength = 'Fort';
  if (score >= 80) strength = 'Très fort';
  
  return {
    score,
    feedback: `Force du mot de passe: ${strength}` + (feedback.length ? ` (${feedback.join(', ')})` : '')
  };
};