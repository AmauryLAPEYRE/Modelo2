// src/components/applications/ApplicationCard.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Application } from '../../types/models';
import { Card } from '../ui/Card';
import { createStyles, theme } from '../../theme';
import { formatDate } from '../../utils/formatters';

interface ApplicationCardProps {
  application: Application;
  onPress?: () => void;
}

export const ApplicationCard = ({ application, onPress }: ApplicationCardProps) => {
  const styles = useStyles();

  const getStatusColor = () => {
    switch (application.status) {
      case 'pending':
        return theme.colors.primary; // Orange pour pending
      case 'accepted':
        return theme.colors.success;
      case 'rejected':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusText = () => {
    switch (application.status) {
      case 'pending':
        return 'En attente';
      case 'accepted':
        return 'Acceptée';
      case 'rejected':
        return 'Refusée';
      default:
        return application.status;
    }
  };

  return (
    <Card onPress={onPress}>
      <View style={styles.row}>
        <Text style={styles.status} style={{ color: getStatusColor() }}>
          {getStatusText()}
        </Text>
        <Text style={styles.date}>{formatDate(application.createdAt)}</Text>
      </View>
      
      {application.message && (
        <Text style={styles.message} numberOfLines={2}>
          {application.message}
        </Text>
      )}
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
  status: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  date: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSizes.sm,
  },
  message: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSizes.md,
  },
}));