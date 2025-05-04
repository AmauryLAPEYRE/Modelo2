// src/components/services/ServiceCard.tsx
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Image, Text, View } from 'react-native';
import { ServiceModel } from '../../domain/models/ServiceModel';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { createThemedStyles, useTheme } from '../../utils/theme';
import { Card } from '../ui';

interface ServiceCardProps {
  service: ServiceModel;
  onPress?: () => void;
  compact?: boolean;
}

export const ServiceCard = ({ service, onPress, compact = false }: ServiceCardProps) => {
  const theme = useTheme();
  const styles = useStyles();
  
  // Récupérer la première image du service ou utiliser une image par défaut
  const imageUrl = service.images && service.images.length > 0
    ? service.images[0]
    : 'https://via.placeholder.com/300x200?text=Modelo';
    
  const { width } = Dimensions.get('window');
  const cardWidth = compact 
    ? width * 0.7 
    : width - (theme.spacing.md * 2);
    
  const compensationType = service.compensation.type === 'free' 
    ? 'Gratuit' 
    : service.compensation.type === 'paid' 
      ? `${formatCurrency(service.compensation.amount || 0)}`
      : 'TFP';
  
  return (
    <Card
      variant="elevated"
      style={[
        styles.card,
        { width: cardWidth },
        compact && styles.compactCard
      ]}
      padding="none"
      onPress={onPress}
    >
      <Image source={{ uri: imageUrl }} style={styles.image} />
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {service.title}
        </Text>
        
        <Text style={styles.description} numberOfLines={compact ? 1 : 2}>
          {service.description}
        </Text>
        
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <FontAwesome name="calendar" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>{formatDate(service.date)}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.detailText} numberOfLines={1}>
              {service.location.address}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <FontAwesome name="money" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>
              {compensationType}
            </Text>
          </View>
        </View>
        
        {!compact && (
          <View style={styles.typeContainer}>
            <Text style={styles.typeText}>
              {getServiceTypeLabel(service.type)}
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
};

// Fonction pour obtenir le libellé du type de service
function getServiceTypeLabel(type: string): string {
  switch (type) {
    case 'haircut':
      return 'Coiffure';
    case 'coloring':
      return 'Coloration';
    case 'makeup':
      return 'Maquillage';
    case 'photoshoot':
      return 'Séance photo';
    case 'other':
    default:
      return 'Autre';
  }
}

const useStyles = createThemedStyles((theme) => ({
  card: {
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  compactCard: {
    marginRight: theme.spacing.md,
  },
  image: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  content: {
    padding: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  description: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  details: {
    gap: theme.spacing.xs,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  detailText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  typeContainer: {
    position: 'absolute',
    top: -theme.spacing.md - 150, // Positionné en haut de l'image
    right: 0,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderTopLeftRadius: theme.borderRadius.md,
    borderBottomLeftRadius: theme.borderRadius.md,
  },
  typeText: {
    color: 'white',
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
  },
}));