// src/theme/index.ts
import { StyleSheet } from 'react-native';

export const theme = {
  colors: {
    primary: '#3B82F6',      // Bleu professionnel - Couleur principale
    secondary: '#71717A',    // Zinc 500
    background: '#000000',   // Pure black
    surface: '#0A0A0A',      // Presque noir mais légèrement plus doux
    card: '#121212',         // Dark gray card
    cardHover: '#1A1A1A',    // Pour les états de hover
    
    // Texte
    text: '#FFFFFF',         // White text
    textSecondary: '#A3A3A3', // Gris clair plus doux
    textTertiary: '#6B7280', // Gris plus foncé pour moins d'importance
    textInverted: '#000000', // Texte sur fonds clairs
    
    // Bordures
    border: '#1F1F1F',       // Bordures très subtiles
    borderSecondary: '#404040', // Pour les bordures plus visibles
    
    // États et feedback
    error: '#B91C1C',        // Red 500 - un peu plus vif
    success: '#059669',      // Emerald 600 - plus saturé
    warning: '#F59E0B',      // Amber 500
    info: '#0891B2',         // Cyan 600
    
    // Accents
    accent: '#60A5FA',       // Bleu plus clair pour les accents
    accentHover: '#93C5FD',  // Bleu encore plus clair pour hover
    
    // Palettes de bleu pour versatilité
    blue: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6',
      600: '#2563EB',
      700: '#1D4ED8',
      800: '#1E40AF',
      900: '#1E3A8A',
    },
    
    // Neutrals pour plus de contrôle
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },
  typography: {
    fontFamilies: {
      logo: 'Poppins-Bold',
      heading: 'System',
      body: 'System',
      mono: 'monospace',
    },
    fontSizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
      '5xl': 48,
    },
    fontWeights: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeights: {
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
    letterSpacing: {
      tighter: -0.5,
      tight: -0.25,
      normal: 0,
      wide: 0.25,
      wider: 0.5,
      widest: 1,
    },
  },
  borderRadius: {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 999,
  },
  shadows: {
    xs: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  animations: {
    timing: {
      fast: 200,
      normal: 300,
      slow: 500,
    },
    easing: 'ease-in-out',
  },
} as const;

type Theme = typeof theme;

export const createThemedStyles = <T extends StyleSheet.NamedStyles<T>>(
  stylesFn: (theme: Theme) => T
) => {
  return () => StyleSheet.create(stylesFn(theme));
};

export const useTheme = () => {
  return theme;
};

// Utilitaire pour créer des variantes de styles
export const createVariants = <T extends string>(
  variants: Record<T, any>
) => {
  return (variant: T) => variants[variant] || {};
};