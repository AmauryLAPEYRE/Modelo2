// src/components/ui/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View, ViewStyle } from 'react-native';
import { createThemedStyles, useTheme, createVariants } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
}

export const Button = ({ 
  onPress, 
  title, 
  variant = 'primary', 
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style
}: ButtonProps) => {
  const theme = useTheme();
  const styles = useStyles();

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return styles.sizeSmall;
      case 'lg':
        return styles.sizeLarge;
      default:
        return styles.sizeMedium;
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return styles.primary;
      case 'secondary':
        return styles.secondary;
      case 'ghost':
        return styles.ghost;
      case 'outline':
        return styles.outline;
      case 'danger':
        return styles.danger;
      default:
        return styles.primary;
    }
  };

  const getTextStyles = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'ghost':
        return styles.ghostText;
      case 'outline':
        return styles.outlineText;
      case 'danger':
        return styles.dangerText;
      default:
        return styles.primaryText;
    }
  };

  const getIsDisabled = () => loading || disabled;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getVariantStyles(),
        getSizeStyles(),
        fullWidth && styles.fullWidth,
        getIsDisabled() && styles.disabled,
        style
      ]}
      onPress={onPress}
      disabled={getIsDisabled()}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator 
            color={variant === 'primary' || variant === 'secondary' ? '#fff' : theme.colors.primary} 
            size={size === 'sm' ? 'small' : undefined}
          />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <Ionicons 
                name={icon} 
                size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} 
                color={variant === 'primary' || variant === 'secondary' ? '#fff' : theme.colors.primary}
                style={styles.iconLeft}
              />
            )}
            <Text style={[getTextStyles(), getSizeStyles().text]}>
              {title}
            </Text>
            {icon && iconPosition === 'right' && (
              <Ionicons 
                name={icon} 
                size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} 
                color={variant === 'primary' || variant === 'secondary' ? '#fff' : theme.colors.primary}
                style={styles.iconRight}
              />
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const useStyles = createThemedStyles((theme) => ({
  button: {
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  danger: {
    backgroundColor: theme.colors.error,
  },
  primaryText: {
    color: 'white',
    fontWeight: theme.typography.fontWeights.semibold,
  },
  secondaryText: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  ghostText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  outlineText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  dangerText: {
    color: 'white',
    fontWeight: theme.typography.fontWeights.semibold,
  },
  sizeSmall: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    text: {
      fontSize: theme.typography.fontSizes.sm,
    },
  },
  sizeMedium: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    text: {
      fontSize: theme.typography.fontSizes.md,
    },
  },
  sizeLarge: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    text: {
      fontSize: theme.typography.fontSizes.lg,
    },
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  iconLeft: {
    marginRight: theme.spacing.xs,
  },
  iconRight: {
    marginLeft: theme.spacing.xs,
  },
}));