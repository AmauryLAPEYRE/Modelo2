// app/(auth)/services/[id].tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useServices } from '../../../src/hooks/useServices';
import { useApplications, checkIfAlreadyApplied, getExistingApplication } from '../../../src/hooks/useApplications';
import { useAuth } from '../../../src/hooks/useAuth';
import { Button } from '../../../src/components/ui/Button';
import { Service } from '../../../src/types/models';
import { createThemedStyles, useTheme } from '../../../src/theme';
import { formatDate, formatDuration, formatCurrency } from '../../../src/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import { Application } from '../../../src/types/models';

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getService, deleteService } = useServices();
  const { applyToService, applications } = useApplications();
  const { user } = useAuth();
  const theme = useTheme();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [existingApplication, setExistingApplication] = useState<Application | null>(null);
  const [checkingApplication, setCheckingApplication] = useState(true);
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

  // Vérifiez si l'utilisateur a déjà postulé au chargement et à chaque changement des applications
  useEffect(() => {
    const checkApplication = async () => {
      if (id && user?.id) {
        setCheckingApplication(true);
        const existing = await getExistingApplication(id, user.id);
        setExistingApplication(existing);
        setCheckingApplication(false);
      }
    };
    checkApplication();
  }, [id, user?.id, applications]);

  const hasApplied = !!existingApplication;
  const isOwner = service?.professionalId === user?.id;

  const handleApply = async () => {
    if (!service || !user) return;

    // Vérification supplémentaire avant l'envoi
    if (hasApplied) {
      Alert.alert('Information', 'Vous avez déjà postulé à cette prestation');
      return;
    }

    setApplying(true);
    try {
      await applyToService(service.id, user.id);
      Alert.alert('Succès', 'Votre candidature a été envoyée');
      
      // Rechargez la candidature existante
      const newApplication = await getExistingApplication(service.id, user.id);
      setExistingApplication(newApplication);
    } catch (error: any) {
      const errorMessage = error.message || 'Une erreur est survenue';
      Alert.alert('Erreur', errorMessage);
    } finally {
      setApplying(false);
    }
  };

  const handleEdit = () => {
    router.push(`/(auth)/services/edit/${id}`);
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer la prestation',
      'Êtes-vous sûr de vouloir supprimer cette prestation ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: confirmDelete },
      ]
    );
  };

  const confirmDelete = async () => {
    if (!id) return;
    
    setDeleting(true);
    try {
      await deleteService(id);
      Alert.alert('Succès', 'Prestation supprimée', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setDeleting(false);
    }
  };

  const getCompensationInfo = () => {
    if (!service) return null;
    
    const { type, amount } = service.compensation;
    
    switch (type) {
      case 'free':
        return { text: 'Gratuit', style: styles.compensationFree };
      case 'paid':
        return { text: formatCurrency(amount!), style: styles.compensationPaid };
      case 'tfp':
        return { text: 'TFP', style: styles.compensationTfp };
      default:
        return null;
    }
  };

  if (loading || checkingApplication) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!service) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.error}>
          <Ionicons name="alert-circle" size={48} color={theme.colors.error} />
          <Text style={styles.errorText}>Service non trouvé</Text>
        </View>
      </SafeAreaView>
    );
  }

  const compensation = getCompensationInfo();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{service.title}</Text>
            {compensation && (
              <Text style={[styles.compensation, compensation.style]}>
                {compensation.text}
              </Text>
            )}
          </View>
          
          <View style={styles.card}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.description}>{service.description}</Text>
          </View>
          
          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>Détails de la prestation</Text>
            
            <View style={styles.detailRow}>
              <Ionicons name="calendar" size={20} color={theme.colors.primary} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>{formatDate(service.date)}</Text>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="time" size={20} color={theme.colors.primary} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Durée</Text>
                <Text style={styles.detailValue}>{formatDuration(service.duration)}</Text>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="location" size={20} color={theme.colors.primary} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Lieu</Text>
                <Text style={styles.detailValue}>{service.location}</Text>
              </View>
            </View>
          </View>

          {user?.role === 'model' && !isOwner && !hasApplied && (
            <Button
              title="Postuler à cette prestation"
              onPress={handleApply}
              loading={applying}
              fullWidth
              size="lg"
              icon="checkmark-circle"
            />
          )}

          {hasApplied && existingApplication && (
            <View style={styles.appliedBanner}>
              <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
              <Text style={styles.appliedText}>
                Candidature envoyée le {formatDate(existingApplication.createdAt)}
              </Text>
            </View>
          )}

          {hasApplied && existingApplication && existingApplication.status !== 'pending' && (
            <View style={[
              styles.statusBanner,
              { borderColor: existingApplication.status === 'accepted' ? theme.colors.success : theme.colors.error }
            ]}>
              <Ionicons 
                name={existingApplication.status === 'accepted' ? 'thumbs-up' : 'thumbs-down'} 
                size={24} 
                color={existingApplication.status === 'accepted' ? theme.colors.success : theme.colors.error} 
              />
              <Text style={[
                styles.statusText,
                { color: existingApplication.status === 'accepted' ? theme.colors.success : theme.colors.error }
              ]}>
                Candidature {existingApplication.status === 'accepted' ? 'acceptée' : 'refusée'}
              </Text>
            </View>
          )}

          {isOwner && (
            <View style={styles.ownerActions}>
              <View style={styles.actionButtons}>
                <Button
                  title="Modifier"
                  onPress={handleEdit}
                  variant="secondary"
                  style={styles.halfWidthButton}
                  icon="create"
                />
                <Button
                  title="Supprimer"
                  onPress={handleDelete}
                  variant="danger"
                  style={styles.halfWidthButton}
                  loading={deleting}
                  icon="trash"
                />
              </View>
              <Button
                title="Gérer les candidatures"
                onPress={() => router.push(`/(auth)/applications?serviceId=${id}`)}
                variant="outline"
                fullWidth
                size="lg"
                icon="people"
              />
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
    fontSize: theme.typography.fontSizes['3xl'],
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  compensation: {
    fontSize: theme.typography.fontSizes['2xl'],
    fontWeight: theme.typography.fontWeights.semibold,
  },
  compensationFree: {
    color: theme.colors.accent,
  },
  compensationPaid: {
    color: theme.colors.success,
  },
  compensationTfp: {
    color: theme.colors.primary,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  descriptionTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeights.relaxed,
  },
  detailsCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  detailContent: {
    marginLeft: theme.spacing.md,
  },
  detailLabel: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  detailValue: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeights.medium,
  },
  appliedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  appliedText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.semibold,
    marginLeft: theme.spacing.sm,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  statusText: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.semibold,
    marginLeft: theme.spacing.sm,
  },
  ownerActions: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  halfWidthButton: {
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