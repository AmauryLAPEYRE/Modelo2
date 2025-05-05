// src/components/applications/ApplicationCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Application } from '../../types/models';
import { createThemedStyles, useTheme } from '../../theme';
import { formatDate } from '../../utils/formatters';
import { Ionicons } from '@expo/vector-icons';

interface ApplicationCardProps {
  application: Application;
  onPress?: () => void;
  showServiceInfo?: boolean;
}

export const ApplicationCard = ({ application, onPress, showServiceInfo = false }: ApplicationCardProps) => {
  const theme = useTheme();
  const styles = useStyles();

  const getStatusConfig = () => {
    switch (application.status) {
      case 'pending':
        return {
          color: theme.colors.primary,
          icon: 'time' as keyof typeof Ionicons.glyphMap,
          label: 'En attente',
        };
      case 'accepted':
        return {
          color: theme.colors.success,
          icon: 'checkmark-circle' as keyof typeof Ionicons.glyphMap,
          label: 'Acceptée',
        };
      case 'rejected':
        return {
          color: theme.colors.error,
          icon: 'close-circle' as keyof typeof Ionicons.glyphMap,
          label: 'Refusée',
        };
      default:
        return {
          color: theme.colors.textSecondary,
          icon: 'help-circle' as keyof typeof Ionicons.glyphMap,
          label: application.status,
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={[styles.status, { backgroundColor: `${statusConfig.color}1A` }]}>
            <Ionicons name={statusConfig.icon} size={20} color={statusConfig.color} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
          <Text style={styles.date}>{formatDate(application.createdAt)}</Text>
        </View>
        
        {application.message && (
          <View style={styles.messageContainer}>
            <Text style={styles.messageLabel}>Votre message :</Text>
            <Text style={styles.message} numberOfLines={2}>
              {application.message}
            </Text>
          </View>
        )}
        
        {showServiceInfo && (
          <View style={styles.serviceInfo}>
            <Ionicons name="briefcase-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.serviceText}>Service #{application.serviceId.slice(-6)}</Text>
          </View>
        )}
        
        <View style={styles.footer}>
          <View style={styles.footerItem}>
            <Ionicons name="document-text" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.footerText}>ID: {application.id.slice(-6)}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
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
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  statusText: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  date: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSizes.sm,
  },
  messageContainer: {
    marginBottom: theme.spacing.sm,
  },
  messageLabel: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
    marginBottom: theme.spacing.xs,
  },
  message: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSizes.md,
    lineHeight: theme.typography.lineHeights.normal,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  serviceText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  footerText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSizes.sm,
  },
}));