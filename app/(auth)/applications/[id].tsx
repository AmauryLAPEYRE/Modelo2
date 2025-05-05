// app/(auth)/applications/[id].tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useApplications } from '../../../src/hooks/useApplications';
import { useServices } from '../../../src/hooks/useServices';
import { useAuth } from '../../../src/hooks/useAuth';
import { Button } from '../../../src/components/ui/Button';
import { Application, Service } from '../../../src/types/models';
import { createStyles, theme } from '../../../src/theme';
import { formatDate } from '../../../src/utils/formatters';

export default function ApplicationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getApplication, updateApplicationStatus } = useApplications();
  const { getService } = useServices();
  const { user } = useAuth();
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </SafeAreaView>
    );
  }

  if (!application) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Candidature non trouvée</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <Text style={styles.title}>Candidature</Text>
          
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              Statut: {application.status === 'pending' ? 'En attente' : 
                      application.status === 'accepted' ? 'Acceptée' : 'Refusée'}
            </Text>
            <Text style={styles.dateText}>
              Déposée le {formatDate(application.createdAt)}
            </Text>
          </View>

          {service && (
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceTitle}>Service: {service.title}</Text>
              <Text style={styles.serviceDate}>Date: {formatDate(service.date)}</Text>
            </View>
          )}

          {application.message && (
            <View style={styles.messageContainer}>
              <Text style={styles.messageLabel}>Message:</Text>
              <Text style={styles.messageText}>{application.message}</Text>
            </View>
          )}

          {canManage && application.status === 'pending' && (
            <View style={styles.actions}>
              <Button
                title="Accepter"
                onPress={handleAccept}
                loading={actionLoading}
                fullWidth
              />
              <Button
                title="Refuser"
                onPress={handleReject}
                loading={actionLoading}
                variant="ghost"
                fullWidth
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const useStyles = createStyles(() => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  statusContainer: {
    marginBottom: theme.spacing.lg,
  },
  statusText: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  dateText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
  },
  serviceInfo: {
    marginBottom: theme.spacing.lg,
  },
  serviceTitle: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  serviceDate: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
  },
  messageContainer: {
    marginBottom: theme.spacing.xl,
  },
  messageLabel: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  messageText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
  },
  actions: {
    gap: theme.spacing.sm,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
}));