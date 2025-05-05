// src/types/navigation.ts
import { User } from './models';

export type RootStackParamList = {
  '(public)': undefined;
  '(auth)': undefined;
};

export type PublicStackParamList = {
  login: undefined;
  register: undefined;
};

export type AuthTabParamList = {
  home: undefined;
  services: undefined;
  applications: undefined;
  profile: undefined;
};

export type ServicesStackParamList = {
  index: undefined;
  '[id]': { id: string };
  create: undefined;
};

export type ApplicationsStackParamList = {
  index: undefined;
  '[id]': { id: string };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

// Type pour les props de navigation
export interface NavigationProps {
  user: User | null;
  loading: boolean;
}