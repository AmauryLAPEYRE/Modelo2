// src/components/ui/Card.tsx
import React from 'react';
import { View, TouchableOpacity, ViewStyle } from 'react-native';
import { createThemedStyles, useTheme } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = ({ 
  children, 
  onPress, 
  style, 
  variant = 'default',
  padding = 'md' 
}: CardProps) => {
  const theme = useTheme();
  const styles = useStyles();
  
  const Container = onPress ? TouchableOpacity : View;
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return styles.elevated;
      case 'outlined':
        return styles.outlined;
      default:
        return styles.default;
    }
  };

  const getPaddingStyles = () => {
    switch (padding) {
      case 'none':
        return {};
      case 'sm':
        return { padding: theme.spacing.sm };
      case 'md':
        return { padding: theme.spacing.md };
      case 'lg':
        return { padding: theme.spacing.lg };
      default:
        return { padding: theme.spacing.md };
    }
  };
  
  return (
    <Container 
      style={[
        styles.card,
        getVariantStyles(),
        getPaddingStyles(),
        style
      ]} 
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      {children}
    </Container>
  );
};

const useStyles = createThemedStyles((theme) => ({
  card: {
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.card,
    marginBottom: theme.spacing.sm,
  },
  default: {
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  outlined: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: 'transparent',
  },
}));