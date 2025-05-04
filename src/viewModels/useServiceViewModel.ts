// src/viewModels/useServiceViewModel.ts
import { create } from 'zustand';
import { ServiceModel, ServiceStatus, ServiceType } from '../domain/models/ServiceModel';
import {
  createDocument,
  deleteDocument,
  getDocument,
  queryDocuments,
  updateDocument
} from '../services/firebase/firestore';
import { calculateDistance } from '../utils/location';
import { uploadFile } from '../services/firebase/storage';

interface ServiceState {
  services: ServiceModel[];
  currentService: ServiceModel | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchServices: (filters?: {
    type?: ServiceType;
    status?: ServiceStatus;
    professionalId?: string;
    searchTerm?: string;
    locationRadius?: {
      latitude: number;
      longitude: number;
      radius: number; // en km
    };
  }) => Promise<ServiceModel[]>;
  
  fetchServiceById: (id: string) => Promise<ServiceModel | null>;
  
  createService: (
    data: Omit<ServiceModel, 'id' | 'createdAt' | 'updatedAt'>,
    images?: { uri: string; name: string; type: string }[]
  ) => Promise<ServiceModel>;
  
  updateService: (
    id: string,
    data: Partial<ServiceModel>,
    newImages?: { uri: string; name: string; type: string }[]
  ) => Promise<ServiceModel>;
  
  deleteService: (id: string) => Promise<void>;
  
  setCurrentService: (service: ServiceModel | null) => void;
  clearError: () => void;
}

export const useServiceViewModel = create<ServiceState>((set, get) => ({
  services: [],
  currentService: null,
  isLoading: false,
  error: null,

  fetchServices: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const constraints = [];
      
      // Ajouter les filtres à la requête
      if (filters?.type) {
        constraints.push({
          field: 'type',
          operator: '==',
          value: filters.type
        });
      }
      
      if (filters?.status) {
        constraints.push({
          field: 'status',
          operator: '==',
          value: filters.status
        });
      }
      
      if (filters?.professionalId) {
        constraints.push({
          field: 'professionalId',
          operator: '==',
          value: filters.professionalId
        });
      }
      
      // Pour la recherche, nous devons filtrer après avoir récupéré les résultats
      let services = await queryDocuments<ServiceModel>('services', constraints, 'createdAt', 'desc');
      
      // Appliquer le filtre de recherche si nécessaire
      if (filters?.searchTerm) {
        const searchTermLower = filters.searchTerm.toLowerCase();
        services = services.filter(service => 
          service.title.toLowerCase().includes(searchTermLower) || 
          service.description.toLowerCase().includes(searchTermLower)
        );
      }
      
      // Appliquer le filtre de localisation si nécessaire
      if (filters?.locationRadius) {
        const { latitude, longitude, radius } = filters.locationRadius;
        services = services.filter(service => {
          // Calculer la distance entre les deux points en km
          const distance = calculateDistance(
            latitude, longitude,
            service.location.latitude, service.location.longitude
          );
          return distance <= radius;
        });
      }
      
      set({ services });
      return services;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchServiceById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const service = await getDocument<ServiceModel>('services', id);
      set({ currentService: service });
      return service;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  createService: async (data, images = []) => {
    set({ isLoading: true, error: null });
    try {
      // Uploader les images d'abord
      const imageUrls = await Promise.all(
        images.map(async (image, index) => {
          const response = await fetch(image.uri);
          const blob = await response.blob();
          const path = `services/${Date.now()}_${index}.${image.type.split('/')[1]}`;
          return await uploadFile(path, blob);
        })
      );
      
      // Créer le document avec les URLs des images
      const service = await createDocument<ServiceModel>('services', {
        ...data,
        images: imageUrls,
      });
      
      // Mettre à jour l'état
      set(state => ({
        services: [service, ...state.services],
        currentService: service
      }));
      
      return service;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateService: async (id, data, newImages = []) => {
    set({ isLoading: true, error: null });
    try {
      // Récupérer le service actuel
      const currentService = await getDocument<ServiceModel>('services', id);
      if (!currentService) {
        throw new Error('Service not found');
      }
      
      // Uploader les nouvelles images
      const newImageUrls = await Promise.all(
        newImages.map(async (image, index) => {
          const response = await fetch(image.uri);
          const blob = await response.blob();
          const path = `services/${id}_${Date.now()}_${index}.${image.type.split('/')[1]}`;
          return await uploadFile(path, blob);
        })
      );
      
      // Fusionner les anciennes et nouvelles images
      const allImages = [...(currentService.images || []), ...newImageUrls];
      
      // Mettre à jour le document
      const updatedService = await updateDocument<ServiceModel>('services', id, {
        ...data,
        images: allImages,
      });
      
      // Mettre à jour l'état
      set(state => ({
        services: state.services.map(s => s.id === id ? updatedService : s),
        currentService: state.currentService?.id === id ? updatedService : state.currentService
      }));
      
      return updatedService;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteService: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteDocument('services', id);
      
      // Mettre à jour l'état
      set(state => ({
        services: state.services.filter(s => s.id !== id),
        currentService: state.currentService?.id === id ? null : state.currentService
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  setCurrentService: (service) => {
    set({ currentService: service });
  },

  clearError: () => {
    set({ error: null });
  },
}));