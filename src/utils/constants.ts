// src/utils/constants.ts
import { Platform } from 'react-native';

export const APP_CONFIG = {
  name: 'Modelo',
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
} as const;

export const LIMITS = {
  MAX_IMAGES_PER_SERVICE: 5,
  MAX_MESSAGE_LENGTH: 1000,
  MIN_SERVICE_DURATION: 15, // minutes
  MAX_SERVICE_DURATION: 480, // minutes
  SEARCH_RADIUS_OPTIONS: [5, 10, 20, 50], // km
} as const;

export const STORAGE_KEYS = {
  LAST_LOCATION: 'modelo_last_location',
  APP_PREFERENCES: 'modelo_app_preferences',
  SEARCH_FILTERS: 'modelo_search_filters',
} as const;

export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
  INSTAGRAM: /^@?[a-zA-Z0-9._]{3,30}$/,
  URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
} as const;

export const PLATFORM_CONSTANTS = {
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  headerHeight: Platform.OS === 'ios' ? 44 : 56,
  statusBarHeight: Platform.OS === 'ios' ? 20 : 0,
} as const;
