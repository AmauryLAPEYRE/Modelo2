// src/components/ui/Input.tsx
import React, { useState } from 'react';
import { TextInput, View, Text, TouchableOpacity, TextStyle, ViewStyle } from 'react-native';
import { createThemedStyles, useTheme } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  icon?: keyof typeof Ionicons.glyphMap;
  onIcon?: () => void;
  rightElement?: React.ReactNode;
}

export const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  icon,
  onIcon,
  rightElement,
}: InputProps) => {
  const theme = useTheme();
  const styles = useStyles();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!secureTextEntry);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const togglePassword = () => setShowPassword(!showPassword);

  // Combine styles correctly to avoid type errors
  const getInputStyle = (): (TextStyle | undefined)[] => {
    const styleArray: (TextStyle | undefined)[] = [styles.input];
    
    if (multiline) styleArray.push(styles.inputMultiline);
    if (icon) styleArray.push(styles.inputWithIcon);
    if (secureTextEntry || rightElement) styleArray.push(styles.inputWithRight);
    
    return styleArray;
  };

  const getWrapperStyle = (): (ViewStyle | undefined)[] => {
    const styleArray: (ViewStyle | undefined)[] = [styles.inputWrapper];
    
    if (isFocused) styleArray.push(styles.inputWrapperFocused);
    if (error) styleArray.push(styles.inputWrapperError);
    if (disabled) styleArray.push(styles.inputWrapperDisabled);
    
    return styleArray;
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={getWrapperStyle()}>
        {icon && (
          <TouchableOpacity 
            onPress={onIcon} 
            disabled={!onIcon}
            style={styles.iconContainer}
          >
            <Ionicons 
              name={icon} 
              size={20} 
              color={isFocused ? theme.colors.primary : theme.colors.textSecondary} 
            />
          </TouchableOpacity>
        )}
        
        <TextInput
          style={getInputStyle()}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textTertiary}
          secureTextEntry={secureTextEntry && !showPassword}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        
        {secureTextEntry && (
          <TouchableOpacity 
            onPress={togglePassword}
            style={styles.rightElement}
          >
            <Ionicons 
              name={showPassword ? 'eye-off' : 'eye'} 
              size={20} 
              color={theme.colors.textSecondary} 
            />
          </TouchableOpacity>
        )}
        
        {rightElement && !secureTextEntry && (
          <View style={styles.rightElement}>
            {rightElement}
          </View>
        )}
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={14} color={theme.colors.error} />
          <Text style={styles.error}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const useStyles = createThemedStyles((theme) => ({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
    marginBottom: theme.spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    minHeight: 48,
  },
  inputWrapperFocused: {
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  inputWrapperError: {
    borderColor: theme.colors.error,
  },
  inputWrapperDisabled: {
    opacity: 0.6,
    backgroundColor: theme.colors.border,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.typography.fontSizes.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  inputMultiline: {
    paddingTop: theme.spacing.sm,
    textAlignVertical: 'top',
  },
  inputWithIcon: {
    paddingLeft: 0,
  },
  inputWithRight: {
    paddingRight: 0,
  },
  iconContainer: {
    paddingLeft: theme.spacing.md,
  },
  rightElement: {
    paddingRight: theme.spacing.md,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  error: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSizes.xs,
    marginLeft: theme.spacing.xs,
  },
}));