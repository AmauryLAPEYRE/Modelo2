// src/utils/theme.ts
import React, { createContext, ReactNode, useContext } from 'react';
import { StyleSheet } from 'react-native';

// Définir les couleurs du thème
export const colors = {
  light: {
    primary: '#6366F1', // Indigo
    secondary: '#EC4899', // Rose
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  dark: {
    primary: '#818CF8', // Indigo plus clair pour le mode sombre
    secondary: '#F472B6', // Rose plus clair pour le mode sombre
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#374151',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
  }
};

// Définir les tailles de texte
export const typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
  },
  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// Définir les espaces
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

// Définir les rayons de bordure
export const borderRadius = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// Définir les ombres
export const shadows = {
  light: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
  },
  dark: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,
    },
  },
};

// Définir le type pour le thème
type Theme = {
  colors: typeof colors.light;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows.light;
  isDark: boolean;
};

// Créer le contexte du thème
const ThemeContext = createContext<Theme>({
  colors: colors.light,
  typography,
  spacing,
  borderRadius,
  shadows: shadows.light,
  isDark: false,
});

// Hook pour utiliser le thème
export const useTheme = () => useContext(ThemeContext);

// Provider du thème
type ThemeProviderProps = {
  children: ReactNode;
  colorScheme?: string | null;
};

export const ThemeProvider = ({ children, colorScheme = 'light' }: ThemeProviderProps) => {
  const isDark = colorScheme === 'dark';
  
  const theme: Theme = {
    colors: isDark ? colors.dark : colors.light,
    typography,
    spacing,
    borderRadius,
    shadows: isDark ? shadows.dark : shadows.light,
    isDark,
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

// Utilitaire pour créer des styles basés sur le thème
export const createThemedStyles = <T extends StyleSheet.NamedStyles<T>>(
  stylesFactory: (theme: Theme) => T
) => {
  return () => {
    const theme = useTheme();
    return StyleSheet.create(stylesFactory(theme));
  };
};