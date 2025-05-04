// src/components/ui/Button.tsx
import React from 'react';
import {
    ActivityIndicator,
    StyleProp,
    Text,
    TextStyle,
    TouchableOpacity,
    TouchableOpacityProps,
    ViewStyle
} from 'react-native';
import { createThemedStyles, useTheme } from '../../utils/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  title: string;
  buttonStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  title,
  buttonStyle,
  textStyle,
  ...props
}: ButtonProps) => {
  const theme = useTheme();
  const styles = useStyles();

  // Styles basés sur la variante
  const variantStyles = {
    primary: styles.primary,
    secondary: styles.secondary,
    outline: styles.outline,
    ghost: styles.ghost,
    danger: styles.danger,
  };

  // Styles de texte basés sur la variante
  const textVariantStyles = {
    primary: styles.primaryText,
    secondary: styles.secondaryText,
    outline: styles.outlineText,
    ghost: styles.ghostText,
    danger: styles.dangerText,
  };

  // Styles basés sur la taille
  const sizeStyles = {
    sm: styles.sizeSmall,
    md: styles.sizeMedium,
    lg: styles.sizeLarge,
  };

  // Styles de texte basés sur la taille
  const textSizeStyles = {
    sm: styles.textSmall,
    md: styles.textMedium,
    lg: styles.textLarge,
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        buttonStyle,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? theme.colors.primary : theme.colors.background}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          <Text
            style={[
              styles.text,
              textVariantStyles[variant],
              textSizeStyles[size],
              (disabled || loading) && styles.disabledText,
              textStyle,
              icon && (iconPosition === 'left' ? styles.textWithIconLeft : styles.textWithIconRight),
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </TouchableOpacity>
  );
};

const useStyles = createThemedStyles((theme) => ({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.md,
  },
  // Variantes
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: theme.colors.error,
  },
  // Tailles
  sizeSmall: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  sizeMedium: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  sizeLarge: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  // Texte
  text: {
    fontWeight: theme.typography.fontWeights.medium,
    textAlign: 'center',
  },
  // Texte par variante
  primaryText: {
    color: 'white',
  },
  secondaryText: {
    color: 'white',
  },
  outlineText: {
    color: theme.colors.primary,
  },
  ghostText: {
    color: theme.colors.primary,
  },
  dangerText: {
    color: 'white',
  },
  // Texte par taille
  textSmall: {
    fontSize: theme.typography.fontSizes.sm,
  },
  textMedium: {
    fontSize: theme.typography.fontSizes.md,
  },
  textLarge: {
    fontSize: theme.typography.fontSizes.lg,
  },
  // États
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.8,
  },
  // Mise en page
  fullWidth: {
    width: '100%',
  },
  textWithIconLeft: {
    marginLeft: theme.spacing.xs,
  },
  textWithIconRight: {
    marginRight: theme.spacing.xs,
  },
}));
