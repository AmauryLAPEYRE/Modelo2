// src/domain/models/ServiceModel.ts
export type ServiceType = 'haircut' | 'coloring' | 'makeup' | 'photoshoot' | 'other';
export type ServiceStatus = 'draft' | 'published' | 'completed' | 'cancelled';

export interface ServiceModel {
  id: string;
  title: string;
  description: string;
  type: ServiceType;
  professionalId: string;
  status: ServiceStatus;
  date: Date;
  duration: number; // en minutes
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  compensation: {
    type: 'free' | 'paid' | 'tfp'; // TFP = Time For Prints
    amount?: number; // Montant si payé
  };
  requirements?: {
    gender?: 'male' | 'female' | 'all';
    minHeight?: number;
    maxHeight?: number;
    hairColor?: string[];
    hairLength?: 'short' | 'medium' | 'long';
    experience?: 'beginner' | 'intermediate' | 'experienced';
  };
  images?: string[]; // URLs des images d'exemple
  createdAt: Date;
  updatedAt: Date;
}