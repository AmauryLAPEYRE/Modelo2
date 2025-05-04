// src/domain/models/UserModel.ts
export type UserRole = 'model' | 'professional';

export interface UserBase {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phone?: string;
  bio?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  createdAt: Date;
  updatedAt: Date;
  role: UserRole;
}

export interface ModelUser extends UserBase {
  role: 'model';
  height?: number; // en cm
  measurements?: {
    bust?: number;
    waist?: number;
    hips?: number;
  };
  experience?: string;
  portfolio?: string[];
  hairColor?: string;
  eyeColor?: string;
  disponibility?: string[];
}

export interface ProfessionalUser extends UserBase {
  role: 'professional';
  profession: 'hairdresser' | 'makeup_artist' | 'photographer' | 'other';
  specialties?: string[];
  website?: string;
  instagram?: string;
  studio?: boolean;
  studioAddress?: string;
}

export type User = ModelUser | ProfessionalUser;
