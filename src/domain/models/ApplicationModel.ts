// src/domain/models/ApplicationModel.ts
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';

export interface ApplicationModel {
  id: string;
  serviceId: string;
  modelId: string;
  status: ApplicationStatus;
  message?: string; // Message de candidature
  responseMessage?: string; // Message de réponse du professionnel
  createdAt: Date;
  updatedAt: Date;
}