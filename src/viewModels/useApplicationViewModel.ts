// src/viewModels/useApplicationViewModel.ts
import { create } from 'zustand';
import { ApplicationModel, ApplicationStatus } from '../domain/models/ApplicationModel';
import {
  createDocument,
  getDocument,
  queryDocuments,
  updateDocument
} from '../services/firebase/firestore';

interface ApplicationState {
  applications: ApplicationModel[];
  currentApplication: ApplicationModel | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchApplications: (filters?: {
    serviceId?: string;
    modelId?: string;
    status?: ApplicationStatus;
  }) => Promise<ApplicationModel[]>;
  
  fetchApplicationById: (id: string) => Promise<ApplicationModel | null>;
  
  createApplication: (data: Omit<ApplicationModel, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ApplicationModel>;
  
  updateApplicationStatus: (
    id: string, 
    status: ApplicationStatus, 
    responseMessage?: string
  ) => Promise<ApplicationModel>;
  
  setCurrentApplication: (application: ApplicationModel | null) => void;
  clearError: () => void;
}

export const useApplicationViewModel = create<ApplicationState>((set, get) => ({
  applications: [],
  currentApplication: null,
  isLoading: false,
  error: null,

  fetchApplications: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const constraints = [];
      
      if (filters?.serviceId) {
        constraints.push({
          field: 'serviceId',
          operator: '==',
          value: filters.serviceId
        });
      }
      
      if (filters?.modelId) {
        constraints.push({
          field: 'modelId',
          operator: '==',
          value: filters.modelId
        });
      }
      
      if (filters?.status) {
        constraints.push({
          field: 'status',
          operator: '==',
          value: filters.status
        });
      }
      
      const applications = await queryDocuments<ApplicationModel>(
        'applications', 
        constraints, 
        'createdAt', 
        'desc'
      );
      
      set({ applications });
      return applications;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchApplicationById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const application = await getDocument<ApplicationModel>('applications', id);
      set({ currentApplication: application });
      return application;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  createApplication: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const application = await createDocument<ApplicationModel>('applications', {
        ...data,
        status: 'pending', 
      });
      
      set(state => ({
        applications: [application, ...state.applications],
        currentApplication: application
      }));
      
      return application;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateApplicationStatus: async (id, status, responseMessage) => {
    set({ isLoading: true, error: null });
    try {
      const updatedApplication = await updateDocument<ApplicationModel>('applications', id, {
        status,
        responseMessage,
      });
      
      set(state => ({
        applications: state.applications.map(a => a.id === id ? updatedApplication : a),
        currentApplication: state.currentApplication?.id === id ? updatedApplication : state.currentApplication
      }));
      
      return updatedApplication;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  setCurrentApplication: (application) => {
    set({ currentApplication: application });
  },

  clearError: () => {
    set({ error: null });
  },
}));