// src/components/ui/Card.tsx
import React from 'react';
import { View, TouchableOpacity, ViewStyle } from 'react-native';
import { createStyles, theme } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export const Card = ({ children, onPress, style }: CardProps) => {
  const styles = useStyles();
  
  const Container = onPress ? TouchableOpacity : View;
  
  return (
    <Container 
      style={[styles.card, style]} 
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </Container>
  );
};

const useStyles = createStyles(() => ({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
}));