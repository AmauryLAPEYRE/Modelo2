// src/components/ui/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { createStyles, theme } from '../../theme';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = ({ 
  onPress, 
  title, 
  variant = 'primary', 
  loading = false,
  fullWidth = false 
}: ButtonProps) => {
  const styles = useStyles();

  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primary;
      case 'secondary':
        return styles.secondary;
      case 'ghost':
        return styles.ghost;
      default:
        return styles.primary;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'ghost':
        return styles.ghostText;
      default:
        return styles.primaryText;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getVariantStyle(),
        fullWidth && styles.fullWidth,
        loading && styles.loading
      ]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#000' : '#FFF'} />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const useStyles = createStyles(() => ({
  button: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: theme.colors.primary, // Orange
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary, // Orange border pour ghost
  },
  primaryText: {
    color: '#000',
    fontWeight: theme.typography.fontWeights.semibold,
    fontFamily: theme.typography.fontFamilies?.body || 'System',
  },
  secondaryText: {
    color: '#FFF',
    fontWeight: theme.typography.fontWeights.semibold,
    fontFamily: theme.typography.fontFamilies?.body || 'System',
  },
  ghostText: {
    color: theme.colors.primary, // Orange text pour ghost
    fontWeight: theme.typography.fontWeights.semibold,
    fontFamily: theme.typography.fontFamilies?.body || 'System',
  },
  fullWidth: {
    width: '100%',
  },
  loading: {
    opacity: 0.7,
  },
}));