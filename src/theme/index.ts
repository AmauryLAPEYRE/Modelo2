// src/theme/index.ts
import { StyleSheet } from 'react-native';

export const theme = {
  colors: {
    primary: '#FF6B6B',      // Orange coral - Couleur principale
    secondary: '#71717A',    // Zinc 500
    background: '#000000',   // Pure black
    surface: '#121212',      // Almost black surface
    card: '#1A1A1A',        // Dark gray card
    text: '#FFFFFF',        // White text
    textSecondary: '#A1A1AA', // Zinc 400
    border: '#27272A',      // Zinc 800
    error: '#DC2626',       // Red 600
    success: '#16A34A',     // Green 600
    warning: '#D97706',     // Amber 600
    accent: '#FF8C42',      // Orange accent pour les éléments interactifs
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    fontFamilies: {
      logo: 'Poppins-Bold',
      body: 'System',
    },
    fontSizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 24,
      '2xl': 32,
      '3xl': 48,
    },
    fontWeights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    letterSpacing: {
      logo: 0,
      normal: 0.4,
      wide: 0.8,
    },
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    full: 999,
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
  },
} as const;

type Theme = typeof theme;

export const createStyles = <T extends StyleSheet.NamedStyles<T>>(
  stylesFn: (theme: Theme) => T
) => {
  return () => StyleSheet.create(stylesFn(theme));
};