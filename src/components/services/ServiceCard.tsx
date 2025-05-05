// src/components/services/ServiceCard.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Service } from '../../types/models';
import { createThemedStyles, useTheme } from '../../theme';
import { formatDate, formatDuration } from '../../utils/formatters';
import { Ionicons } from '@expo/vector-icons';

interface ServiceCardProps {
  service: Service;
  onPress?: () => void;
  showProfessionalInfo?: boolean;
}

export const ServiceCard = ({ service, onPress, showProfessionalInfo = false }: ServiceCardProps) => {
  const theme = useTheme();
  const styles = useStyles();

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

  const getStatusColor = () => {
    switch (service.status) {
      case 'published':
        return theme.colors.success;
      case 'completed':
        return theme.colors.gray[500];
      case 'cancelled':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>{service.title}</Text>
            <View style={[styles.status, { backgroundColor: getStatusColor() }]}>
              <Text style={styles.statusText}>
                {service.status === 'published' ? 'Actif' : 
                 service.status === 'completed' ? 'Terminé' : 'Annulé'}
              </Text>
            </View>
          </View>
          <Text style={[styles.compensation, getCompensationStyle()]}>
            {getCompensationText()}
          </Text>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {service.description}
        </Text>
        
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>{formatDate(service.date)}</Text>
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

        {showProfessionalInfo && (
          <View style={styles.professionalInfo}>
            <View style={styles.professionalAvatar}>
              <Ionicons name="briefcase" size={20} color={theme.colors.primary} />
            </View>
            <Text style={styles.professionalText}>
              Organisation professionnelle
            </Text>
          </View>
        )}
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    marginBottom: theme.spacing.sm,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.semibold,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  status: {
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.xs,
  },
  statusText: {
    color: 'white',
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.medium,
  },
  compensation: {
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
  description: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSizes.md,
    marginBottom: theme.spacing.sm,
    lineHeight: theme.typography.lineHeights.normal,
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSecondary,
    paddingTop: theme.spacing.sm,
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
  professionalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSecondary,
  },
  professionalAvatar: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  professionalText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
  },
}));