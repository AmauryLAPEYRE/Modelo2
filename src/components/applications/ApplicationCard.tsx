// src/components/applications/ApplicationCard.tsx
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ApplicationModel, ApplicationStatus } from '../../domain/models/ApplicationModel';
import { formatDate } from '../../utils/formatters';
import { createThemedStyles, useTheme } from '../../utils/theme';
import { Card } from '../ui';

interface ApplicationCardProps {
  application: ApplicationModel;
  onPress?: () => void;
  showService?: boolean;
}

export const ApplicationCard = ({ application, onPress, showService = false }: ApplicationCardProps) => {
  const theme = useTheme();
  const styles = useStyles();
  
  const getStatusColor = (status: ApplicationStatus): string => {
    switch (status) {
      case 'accepted':
        return theme.colors.success;
      case 'rejected':
        return theme.colors.error;
      case 'pending':
        return theme.colors.warning;
      case 'cancelled':
        return theme.colors.textSecondary;
      case 'completed':
        return theme.colors.primary;
      default:
        return theme.colors.textSecondary;
    }
  };
  
  const getStatusText = (status: ApplicationStatus): string => {
    switch (status) {
      case 'accepted':
        return 'Acceptée';
      case 'rejected':
        return 'Refusée';
      case 'pending':
        return 'En attente';
      case 'cancelled':
        return 'Annulée';
      case 'completed':
        return 'Terminée';
      default:
        return status;
    }
  };
  
  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case 'accepted':
        return <FontAwesome name="check-circle" size={20} color={getStatusColor(status)} />;
      case 'rejected':
        return <FontAwesome name="times-circle" size={20} color={getStatusColor(status)} />;
      case 'pending':
        return <FontAwesome name="clock-o" size={20} color={getStatusColor(status)} />;
      case 'cancelled':
        return <FontAwesome name="ban" size={20} color={getStatusColor(status)} />;
      case 'completed':
        return <FontAwesome name="check-circle-o" size={20} color={getStatusColor(status)} />;
      default:
        return <FontAwesome name="circle-o" size={20} color={getStatusColor(status)} />;
    }
  };
  
  return (
    <Card
      variant="elevated"
      style={styles.card}
      padding="md"
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.statusContainer}>
            {getStatusIcon(application.status)}
            <Text style={[styles.statusText, { color: getStatusColor(application.status) }]}>
              {getStatusText(application.status)}
            </Text>
          </View>
          {showService && (
            <Text style={styles.serviceId} numberOfLines={1}>
              #{application.serviceId.slice(-6)}
            </Text>
          )}
        </View>
      </View>
      
      <View style={styles.dateContainer}>
        <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
        <Text style={styles.dateText}>
          Postulé le {formatDate(application.createdAt, false)}
        </Text>
      </View>
      
      {application.message && (
        <Text style={styles.messagePreview} numberOfLines={2}>
          {application.message}
        </Text>
      )}
      
      {application.responseMessage && (
        <View style={styles.responseContainer}>
          <Text style={styles.responseLabel}>Réponse:</Text>
          <Text style={styles.responseText} numberOfLines={2}>
            {application.responseMessage}
          </Text>
        </View>
      )}
      
      <View style={styles.footer}>
        <TouchableOpacity style={styles.detailsButton}>
          <Text style={styles.detailsText}>Voir les détails</Text>
          <FontAwesome name="chevron-right" size={12} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
    </Card>
  );
};

const useStyles = createThemedStyles((theme) => ({
  card: {
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statusText: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  serviceId: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  dateText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  messagePreview: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  responseContainer: {
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  responseLabel: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  responseText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text,
  },
  footer: {
    alignItems: 'flex-end',
    marginTop: theme.spacing.sm,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  detailsText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.medium,
  },
}));