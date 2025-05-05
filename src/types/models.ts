// src/types/models.ts
export interface User {
    id: string;
    email: string;
    name: string;
    role: 'model' | 'professional';
    avatar?: string;
    bio?: string;
    height?: number;
    specialty?: string;
    createdAt: Date;
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
  }
  
  export interface Application {
    id: string;
    serviceId: string;
    modelId: string;
    status: 'pending' | 'accepted' | 'rejected';
    message?: string;
    createdAt: Date;
  }