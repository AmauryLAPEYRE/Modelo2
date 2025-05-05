// app/(auth)/services/[id].tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useServices } from '../../../src/hooks/useServices';
import { useApplications } from '../../../src/hooks/useApplications';
import { useAuth } from '../../../src/hooks/useAuth';
import { Button } from '../../../src/components/ui/Button';
import { Service } from '../../../src/types/models';
import { createStyles, theme } from '../../../src/theme';
import { formatDate, formatDuration } from '../../../src/utils/formatters';

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getService } = useServices();
  const { applyToService, applications } = useApplications();
  const { user } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const styles = useStyles();

  useEffect(() => {
    const fetchService = async () => {
      if (id) {
        const serviceData = await getService(id);
        setService(serviceData);
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  const hasApplied = applications.some(app => app.serviceId === id);
  const isOwner = service?.professionalId === user?.id;

  const handleApply = async () => {
    if (!service || !user) return;

    setApplying(true);
    try {
      await applyToService(service.id, user.id);
      Alert.alert('Succès', 'Votre candidature a été envoyée');
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setApplying(false);
    }
  };

  const getCompensationText = () => {
    if (!service) return '';
    if (service.compensation.type === 'free') return 'Gratuit';
    if (service.compensation.type === 'paid') return `${service.compensation.amount}€`;
    if (service.compensation.type === 'tfp') return 'TFP';
    return '';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </SafeAreaView>
    );
  }

  if (!service) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Service non trouvé</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <Text style={styles.title}>{service.title}</Text>
          <Text style={styles.compensation}>{getCompensationText()}</Text>
          
          <Text style={styles.description}>{service.description}</Text>
          
          <View style={styles.details}>
            <Text style={styles.detailItem}>Date: {formatDate(service.date)}</Text>
            <Text style={styles.detailItem}>Durée: {formatDuration(service.duration)}</Text>
            <Text style={styles.detailItem}>Lieu: {service.location}</Text>
          </View>

          {user?.role === 'model' && !isOwner && !hasApplied && (
            <Button
              title="Candidater"
              onPress={handleApply}
              loading={applying}
              fullWidth
            />
          )}

          {hasApplied && (
            <Text style={styles.appliedText}>Candidature envoyée</Text>
          )}

          {isOwner && (
            <Button
              title="Gérer les candidatures"
              onPress={() => router.push(`/(auth)/applications?serviceId=${id}`)}
              variant="secondary"
              fullWidth
            />
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
    marginBottom: theme.spacing.sm,
  },
  compensation: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.primary,
    marginBottom: theme.spacing.lg,
  },
  description: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  details: {
    marginBottom: theme.spacing.xl,
  },
  detailItem: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  appliedText: {
    color: theme.colors.success,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
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