// src/components/ui/Button.tsx
import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet, 
  StyleProp, 
  ViewStyle, 
  TextStyle
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof Ionicons.glyphMap;
  iconRight?: boolean;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight = false,
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const theme = useTheme();
  
  // Obtenir les styles basés sur la variante
  const getVariantStyles = (): { container: ViewStyle, text: TextStyle } => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
          },
          text: {
            color: '#FFFFFF',
          },
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: theme.colors.secondary,
            borderColor: theme.colors.secondary,
          },
          text: {
            color: '#FFFFFF',
          },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderColor: theme.colors.primary,
          },
          text: {
            color: theme.colors.primary,
          },
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
            borderColor: 'transparent',
          },
          text: {
            color: theme.colors.primary,
          },
        };
      case 'danger':
        return {
          container: {
            backgroundColor: theme.colors.error,
            borderColor: theme.colors.error,
          },
          text: {
            color: '#FFFFFF',
          },
        };
      default:
        return {
          container: {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
          },
          text: {
            color: '#FFFFFF',
          },
        };
    }
  };

  // Obtenir les styles basés sur la taille
  const getSizeStyles = (): { container: ViewStyle, text: TextStyle, icon: number } => {
    switch (size) {
      case 'sm':
        return {
          container: {
            paddingVertical: theme.spacing.xs,
            paddingHorizontal: theme.spacing.sm,
            minHeight: 32,
          },
          text: {
            fontSize: theme.typography.fontSizes.sm,
          },
          icon: 16,
        };
      case 'lg':
        return {
          container: {
            paddingVertical: theme.spacing.md,
            paddingHorizontal: theme.spacing.lg,
            minHeight: 48,
          },
          text: {
            fontSize: theme.typography.fontSizes.md,
          },
          icon: 20,
        };
      default: // 'md'
        return {
          container: {
            paddingVertical: theme.spacing.sm,
            paddingHorizontal: theme.spacing.md,
            minHeight: 40,
          },
          text: {
            fontSize: theme.typography.fontSizes.sm,
          },
          icon: 18,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const containerStyle = [
    styles.container,
    {
      borderWidth: 1,
      borderRadius: theme.borderRadius.lg,
    },
    variantStyles.container,
    sizeStyles.container,
    fullWidth && styles.fullWidth,
    (disabled || loading) && {
      opacity: 0.6,
    },
    style,
  ];

  const textStyleCombined = [
    styles.text,
    {
      fontWeight: theme.typography.fontWeights.medium,
    },
    variantStyles.text,
    sizeStyles.text,
    textStyle,
  ];

  const iconColor = variantStyles.text.color;

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={iconColor as string} size="small" />
        ) : (
          <>
            {icon && !iconRight && (
              <Ionicons
                name={icon}
                size={sizeStyles.icon}
                color={iconColor as string}
                style={styles.iconLeft}
              />
            )}
            <Text style={textStyleCombined}>{title}</Text>
            {icon && iconRight && (
              <Ionicons
                name={icon}
                size={sizeStyles.icon}
                color={iconColor as string}
                style={styles.iconRight}
              />
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});