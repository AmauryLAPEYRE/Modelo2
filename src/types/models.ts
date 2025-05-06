// src/types/models.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'model' | 'professional';
  
  // Champs spécifiques aux professionnels
  professionalType?: 'coiffeur' | 'maquilleur' | 'photographe' | 'estheticienne';
  professionalStatus?: 'freelance' | 'auto-entrepreneur' | 'société';
  businessName?: string;
  
  // Infos communes
  avatar?: string;
  bio?: string;
  createdAt: Date;
  
  // Champs spécifiques aux modèles
  modelProfile?: {
    firstName: string;
    lastName: string;
    age: number;
    gender: 'homme' | 'femme' | 'non-binaire';
    height: number; // en cm
    eyeColor: string;
    hairColor: string;
    experience: string;
    photos: {
      face?: string;     // URL photo visage
      profile?: string;  // URL photo profil
      fullBody?: string; // URL photo plein pied
    };
    socialMedia: {
      instagram?: string;
      facebook?: string;
      tiktok?: string;
      portfolio?: string;
    };
    availability: {
      weekdays: boolean[]; // [lundi, mardi, mercredi, jeudi, vendredi, samedi, dimanche]
      timeSlots: string[]; // ["matin", "après-midi", "soir"]
      notes?: string;
    };
    location: {
      city: string;
      radius: number; // en km
      coordinates?: {
        latitude: number;
        longitude: number;
      };
    };
    // Paramètres pour l'algorithme de suggestion
    interests: string[]; // Types de prestations qui intéressent le modèle
  };
}

export interface Service {
  id: string;
  title: string;
  description: string;
  professionalId: string;
  date: Date;
  duration: number; // minutes
  compensation: {
    type: 'free' | 'paid' | 'tfp';
    amount?: number;
  };
  location: string;
  status: 'published' | 'completed' | 'cancelled';
  createdAt: Date;
  // Nouveaux champs selon cahier des charges
  criteria?: {
    gender?: 'homme' | 'femme' | 'non-binaire';
    minAge?: number;
    maxAge?: number;
    hairType?: string;
    minHeight?: number;
    maxHeight?: number;
    other?: string;
  };
  isUrgent?: boolean; // Pour les prestations urgentes (mise en avant payante)
}

export interface Application {
  id: string;
  serviceId: string;
  modelId: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  createdAt: Date;
  // Nouveaux champs
  photoUrl?: string; // Photo actuelle pour la candidature
  videoUrl?: string; // Vidéo de 30s (facultatif)
}