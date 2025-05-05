// app/(auth)/applications/[id].tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useApplications } from '../../../src/hooks/useApplications';
import { useServices } from '../../../src/hooks/useServices';
import { useAuth } from '../../../src/hooks/useAuth';
import { Button } from '../../../src/components/ui/Button';
import { Application, Service } from '../../../src/types/models';
import { createThemedStyles, useTheme } from '../../../src/theme';
import { formatDate } from '../../../src/utils/formatters';
import { Ionicons } from '@expo/vector-icons';

export default function ApplicationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getApplication, updateApplicationStatus } = useApplications();
  const { getService } = useServices();
  const { user } = useAuth();
  const theme = useTheme();
  const [application, setApplication] = useState<Application | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const styles = useStyles();

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const appData = await getApplication(id);
        setApplication(appData);
        
        if (appData?.serviceId) {
          const serviceData = await getService(appData.serviceId);
          setService(serviceData);
        }
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAccept = async () => {
    if (!application) return;
    
    setActionLoading(true);
    try {
      await updateApplicationStatus(application.id, 'accepted');
      setApplication({ ...application, status: 'accepted' });
      Alert.alert('Succès', 'Candidature acceptée');
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!application) return;
    
    setActionLoading(true);
    try {
      await updateApplicationStatus(application.id, 'rejected');
      setApplication({ ...application, status: 'rejected' });
      Alert.alert('Succès', 'Candidature refusée');
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setActionLoading(false);
    }
  };

  const canManage = user?.role === 'professional' && service?.professionalId === user.id;

  const getStatusConfig = () => {
    if (!application) return null;
    
    switch (application.status) {
      case 'pending':
        return {
          label: 'En attente',
          color: theme.colors.primary,
          icon: 'time' as keyof typeof Ionicons.glyphMap,
          backgroundColor: `${theme.colors.primary}1A`,
        };
      case 'accepted':
        return {
          label: 'Acceptée',
          color: theme.colors.success,
          icon: 'checkmark-circle' as keyof typeof Ionicons.glyphMap,
          backgroundColor: `${theme.colors.success}1A`,
        };
      case 'rejected':
        return {
          label: 'Refusée',
          color: theme.colors.error,
          icon: 'close-circle' as keyof typeof Ionicons.glyphMap,
          backgroundColor: `${theme.colors.error}1A`,
        };
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!application) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.error}>
          <Ionicons name="alert-circle" size={48} color={theme.colors.error} />
          <Text style={styles.errorText}>Candidature non trouvée</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusConfig = getStatusConfig();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Candidature #{application.id.slice(-6)}</Text>
            {statusConfig && (
              <View style={[styles.statusBadge, { backgroundColor: statusConfig.backgroundColor }]}>
                <Ionicons name={statusConfig.icon} size={24} color={statusConfig.color} />
                <Text style={[styles.statusText, { color: statusConfig.color }]}>
                  {statusConfig.label}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.card}>
            <Text style={styles.infoLabel}>Date de candidature</Text>
            <Text style={styles.infoValue}>{formatDate(application.createdAt)}</Text>
          </View>

          {service && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Prestation concernée</Text>
              <Text style={styles.serviceTitle}>{service.title}</Text>
              <Text style={styles.serviceDate}>Date: {formatDate(service.date)}</Text>
            </View>
          )}

          {application.message && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Message du candidat</Text>
              <Text style={styles.messageText}>{application.message}</Text>
            </View>
          )}

          {canManage && application.status === 'pending' && (
            <View style={styles.actions}>
              <Button
                title="Accepter la candidature"
                onPress={handleAccept}
                loading={actionLoading}
                fullWidth
                size="lg"
                icon="checkmark-circle"
              />
              <Button
                title="Refuser la candidature"
                onPress={handleReject}
                loading={actionLoading}
                variant="outline"
                fullWidth
                size="lg"
                icon="close-circle"
              />
            </View>
          )}

          {!canManage && (
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
              <Text style={styles.infoBoxText}>
                {user?.role === 'model' 
                  ? 'Vous recevrez une notification si votre candidature est acceptée.'
                  : 'Cette candidature n\'est pas associée à votre compte.'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const useStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.fontSizes['2xl'],
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  statusText: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoLabel: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  infoValue: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeights.medium,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  serviceTitle: {
    fontSize: theme.typography.fontSizes.lg,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  serviceDate: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textSecondary,
  },
  messageText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeights.relaxed,
  },
  actions: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  infoBoxText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSizes.md,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.textSecondary,
  },
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: theme.colors.error,
    marginTop: theme.spacing.md,
  },
}));