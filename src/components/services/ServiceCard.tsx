// src/components/services/ServiceCard.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Service } from '../../types/models';
import { createThemedStyles, useTheme } from '../../theme';
import { formatDate, formatDuration } from '../../utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { formatProfessionalType, getProfessionalTypeIcon } from '../../utils/professionalType';

interface ServiceCardProps {
  service: Service;
  onPress?: () => void;
  showProfessionalInfo?: boolean;
}

export const ServiceCard = ({ service, onPress, showProfessionalInfo = false }: ServiceCardProps) => {
  const theme = useTheme();
  const styles = useStyles();
  const [professionalName, setProfessionalName] = useState<string>('');
  const [professionalType, setProfessionalType] = useState<string | undefined>(undefined);

  // Charger les informations du professionnel
  useEffect(() => {
    const fetchProfessionalInfo = async () => {
      try {
        const professionalDoc = await getDoc(doc(db, 'users', service.professionalId));
        if (professionalDoc.exists()) {
          const data = professionalDoc.data();
          setProfessionalName(data.name || '');
          setProfessionalType(data.professionalType);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des informations du professionnel:", error);
      }
    };
    
    fetchProfessionalInfo();
  }, [service.professionalId]);

  const getCompensationText = () => {
    if (service.compensation.type === 'free') return 'Gratuit';
    if (service.compensation.type === 'paid') return `${service.compensation.amount}€`;
    if (service.compensation.type === 'tfp') return 'TFP';
    return '';
  };

  const getCompensationStyle = () => {
    switch (service.compensation.type) {
      case 'paid':
        return styles.compensationPaid;
      case 'tfp':
        return styles.compensationTfp;
      default:
        return styles.compensationFree;
    }
  };

  // Format de date plus compact pour la carte
  const getCompactDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
    });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.card}>
        {/* En-tête avec titre et statut */}
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{service.title}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Actif</Text>
          </View>
        </View>
        
        {/* Ligne horizontale */}
        <View style={styles.divider} />
        
        {/* Informations principales */}
        <View style={styles.mainInfo}>
          {/* Prix */}
          <Text style={[styles.price, getCompensationStyle()]}>
            {getCompensationText()}
          </Text>
          
          {/* Informations du professionnel */}
          <View style={styles.professionalContainer}>
            <View style={styles.professionalIconContainer}>
              <Ionicons 
                name={getProfessionalTypeIcon(professionalType) as keyof typeof Ionicons.glyphMap} 
                size={16} 
                color={theme.colors.primary} 
              />
            </View>
            <View>
              <Text style={styles.professionalName}>{professionalName}</Text>
              <Text style={styles.professionalType}>
                {professionalType ? formatProfessionalType(professionalType) : 'Professionnel'}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Détails du service */}
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>{getCompactDate(service.date)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="time" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>{formatDuration(service.duration)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="location" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.detailText} numberOfLines={1}>{service.location}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const useStyles = createThemedStyles((theme) => ({
  container: {
    marginBottom: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  statusBadge: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.xs,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.medium,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.xs,
  },
  mainInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  price: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
  },
  compensationPaid: {
    color: theme.colors.success,
  },
  compensationTfp: {
    color: theme.colors.primary,
  },
  compensationFree: {
    color: theme.colors.accent,
  },
  professionalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  professionalIconContainer: {
    width: 28,
    height: 28,
    borderRadius: theme.borderRadius.full,
    backgroundColor: `${theme.colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.xs,
  },
  professionalName: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
  },
  professionalType: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSizes.xs,
  },
  details: {
    gap: theme.spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSizes.sm,
    marginLeft: theme.spacing.xs,
    flex: 1,
  },
}));