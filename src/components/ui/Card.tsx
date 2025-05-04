// src/components/ui/Card.tsx
import React, { ReactNode } from 'react';
import { TouchableOpacity, View, StyleProp, ViewStyle } from 'react-native';
import { createThemedStyles, useTheme } from '../../utils/theme';

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = ({
  children,
  style,
  onPress,
  variant = 'default',
  padding = 'md',
}: CardProps) => {
  const styles = useStyles();

  // Styles basés sur la variante
  const variantStyles = {
    default: styles.defaultCard,
    outlined: styles.outlinedCard,
    elevated: styles.elevatedCard,
  };

  // Styles basés sur le padding
  const paddingStyles = {
    none: {},
    sm: styles.paddingSm,
    md: styles.paddingMd,
    lg: styles.paddingLg,
  };

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={[
        styles.card,
        variantStyles[variant],
        paddingStyles[padding],
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      {children}
    </CardComponent>
  );
};

const useStyles = createThemedStyles((theme) => ({
  card: {
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
  },
  defaultCard: {
    backgroundColor: theme.colors.surface,
  },
  outlinedCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  elevatedCard: {
    backgroundColor: theme.colors.surface,
    ...theme.shadows.md,
  },
  paddingSm: {
    padding: theme.spacing.sm,
  },
  paddingMd: {
    padding: theme.spacing.md,
  },
  paddingLg: {
    padding: theme.spacing.lg,
  },
}));

