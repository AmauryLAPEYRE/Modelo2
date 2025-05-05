// src/components/services/ServiceCard.tsx
import React from 'react';
import { View, Text, Image } from 'react-native';
import { Service } from '../../types/models';
import { Card } from '../ui/Card';
import { createStyles, theme } from '../../theme';
import { formatDate, formatDuration } from '../../utils/formatters';

interface ServiceCardProps {
  service: Service;
  onPress?: () => void;
}

export const ServiceCard = ({ service, onPress }: ServiceCardProps) => {
  const styles = useStyles();

  const getCompensationText = () => {
    if (service.compensation.type === 'free') return 'Gratuit';
    if (service.compensation.type === 'paid') return `${service.compensation.amount}€`;
    if (service.compensation.type === 'tfp') return 'TFP';
    return '';
  };

  return (
    <Card onPress={onPress}>
      <View style={styles.row}>
        <Text style={styles.title} numberOfLines={1}>{service.title}</Text>
        <Text style={styles.compensation}>{getCompensationText()}</Text>
      </View>
      
      <Text style={styles.description} numberOfLines={2}>
        {service.description}
      </Text>
      
      <View style={styles.details}>
        <Text style={styles.detailText}>
          {formatDate(service.date)} • {formatDuration(service.duration)}
        </Text>
        <Text style={styles.detailText}>{service.location}</Text>
      </View>
    </Card>
  );
};

const useStyles = createStyles(() => ({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    flex: 1,
  },
  compensation: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
  description: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.md,
    marginBottom: theme.spacing.sm,
  },
  details: {
    gap: theme.spacing.xs,
  },
  detailText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm,
  },
}));