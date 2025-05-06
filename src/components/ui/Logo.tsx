// src/components/ui/Logo.tsx
import React from 'react';
import { Image, ImageStyle } from 'react-native';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  style?: ImageStyle;
}

/**
 * Composant Logo utilisable dans toute l'application
 * Affiche le logo Modelo au format image
 */
export const Logo: React.FC<LogoProps> = ({ size = 'medium', style }) => {
  // Définir les dimensions en fonction de la taille
  const getDimensions = () => {
    switch (size) {
      case 'small':
        return { width: 100, height: 40 };
      case 'large':
        return { width: 200, height: 80 };
      case 'medium':
      default:
        return { width: 150, height: 60 };
    }
  };

  const dimensions = getDimensions();

  return (
    <Image
      source={require('../../../assets/images/modelo-logo.png')}
      style={[dimensions, style]}
      resizeMode="contain"
    />
  );
};