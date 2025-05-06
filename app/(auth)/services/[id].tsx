// app/(auth)/services/[id].tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, Alert, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useServices } from '../../../src/hooks/useServices';
import { useApplications } from '../../../src/hooks/useApplications';
import { useAuth } from '../../../src/hooks/useAuth';
import { Button } from '../../../src/components/ui/Button';
import { Service } from '../../../src/types/models';
import { createThemedStyles, useTheme } from '../../../src/theme';
import { formatDate, formatDuration, formatCurrency } from '../../../src/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../src/lib/firebase';
import { formatProfessionalType, getProfessionalTypeIcon } from '../../../src/utils/professionalType';

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getService, deleteService } = useServices();
  const { applyToService } = useApplications();
  const { user } = useAuth();
  const theme = useTheme();
  const [service, setService] = useState<Service | null>(null);
  const [professionalName, setProfessionalName] = useState('');
  const [professionalEmail, setProfessionalEmail] = useState('');
  const [professionalType, setProfessionalType] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const styles = useStyles();

  // Charger les détails du service et du professionnel
  useEffect(() => {
    const fetchService = async () => {
      if (id) {
        try {
          const serviceData = await getService(id);
          setService(serviceData);
          
          // Fetch professional info
          if (serviceData) {
            try {
              const professionalDoc = await getDoc(doc(db, 'users', serviceData.professionalId));
              if (professionalDoc.exists()) {
                const data = professionalDoc.data();
                setProfessionalName(data.name || '');
                setProfessionalEmail(data.email || '');
                setProfessionalType(data.professionalType);
              }
            } catch (error) {
              console.error("Erreur lors de la récupération des informations du professionnel:", error);
            }
          }
        } catch (error) {
          console.error("Erreur lors de la récupération du service:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchService();
  }, [id]);

  // Vérifier spécifiquement si l'utilisateur a déjà postulé à ce service
  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (user?.role === 'model' && service && user) {
        try {
          // Vérifier spécifiquement les candidatures de ce modèle pour ce service
          const applicationsRef = collection(db, 'applications');
          const q = query(
            applicationsRef, 
            where('serviceId', '==', service.id),
            where('modelId', '==', user.id)
          );
          const querySnapshot = await getDocs(q);
          
          // Si on trouve une candidature, l'utilisateur a déjà postulé
          setHasApplied(!querySnapshot.empty);
        } catch (error) {
          console.error("Erreur lors de la vérification du statut de candidature:", error);
        }
      }
    };
    
    checkApplicationStatus();
  }, [user, service]);

  const isOwner = service?.professionalId === user?.id;

  const handleApply = async () => {
    if (!service || !user) return;

    setApplying(true);
    try {
      await applyToService(service.id, user.id);
      setHasApplied(true); // Mettre à jour l'état local immédiatement
      Alert.alert('Succès', 'Votre candidature a été envoyée');
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
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

  if (loading) {
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
      {/* Header avec bouton retour */}
      <View style={styles.navigationHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* En-tête avec titre et prix */}
          <View style={styles.header}>
            <Text style={styles.title}>{service.title}</Text>
            {compensation && (
              <Text style={[styles.compensation, compensation.style]}>
                {compensation.text}
              </Text>
            )}
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {service.status === 'published' ? 'Actif' : 
                 service.status === 'completed' ? 'Terminé' : 'Annulé'}
              </Text>
            </View>
          </View>
          
          {/* Information du professionnel */}
          <View style={styles.professionalCard}>
            <View style={styles.professionalHeader}>
              <Text style={styles.sectionTitle}>Professionnel</Text>
            </View>
            
            <View style={styles.professionalInfo}>
              <View style={styles.professionalIconContainer}>
                <Ionicons 
                  name={getProfessionalTypeIcon(professionalType) as keyof typeof Ionicons.glyphMap} 
                  size={36} 
                  color={theme.colors.primary} 
                />
              </View>
              <View style={styles.professionalDetails}>
                <Text style={styles.professionalName}>{professionalName}</Text>
                <Text style={styles.professionalType}>
                  {professionalType ? formatProfessionalType(professionalType) : 'Professionnel'}
                </Text>
                <Text style={styles.professionalEmail}>{professionalEmail}</Text>
              </View>
            </View>
          </View>
          
          {/* Description */}
          <View style={styles.card}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.description}>{service.description}</Text>
          </View>
          
          {/* Détails de la prestation */}
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
            
            <View style={styles.detailRow}>
              <Ionicons name="cash" size={20} color={theme.colors.primary} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Compensation</Text>
                <Text style={[styles.detailValue, { color: compensation?.style.color }]}>
                  {compensation?.text} 
                  {service.compensation.type === 'tfp' && (
                    <Text style={styles.tfpExplanation}> (Time for Print: échange de services)</Text>
                  )}
                </Text>
              </View>
            </View>
          </View>
          
          {/* Informations pour les modèles */}
          {user?.role === 'model' && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Informations pour les modèles</Text>
              <View style={styles.infoRow}>
                <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
                <Text style={styles.infoText}>
                  La prestation est organisée par un {formatProfessionalType(professionalType || '')}.
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                <Text style={styles.infoText}>
                  Durée de la prestation : {formatDuration(service.duration)}.
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="alert-circle" size={20} color={theme.colors.primary} />
                <Text style={styles.infoText}>
                  Soyez ponctuel(le) à l'adresse indiquée.
                </Text>
              </View>
              {service.compensation.type === 'tfp' && (
                <View style={styles.infoRow}>
                  <Ionicons name="images" size={20} color={theme.colors.primary} />
                  <Text style={styles.infoText}>
                    TFP : Vous recevrez des photos en échange de votre prestation.
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Actions pour les modèles */}
          {user?.role === 'model' && !isOwner && (
            <>
              {!hasApplied ? (
                <Button
                  title="Postuler à cette prestation"
                  onPress={handleApply}
                  loading={applying}
                  fullWidth
                  size="lg"
                  icon="checkmark-circle"
                />
              ) : (
                <View style={styles.appliedBanner}>
                  <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                  <Text style={styles.appliedText}>Vous avez déjà postulé à cette prestation</Text>
                </View>
              )}
            </>
          )}

          {/* Actions pour les propriétaires */}
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
  navigationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  content: {
    padding: theme.spacing.lg,
    paddingTop: 0,
  },
  header: {
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSizes['3xl'],
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    marginTop: theme.spacing.xs,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
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
  professionalCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  professionalHeader: {
    marginBottom: theme.spacing.sm,
  },
  professionalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  professionalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.full,
    backgroundColor: `${theme.colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  professionalDetails: {
    flex: 1,
  },
  professionalName: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  professionalType: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.medium,
    marginBottom: theme.spacing.xs,
  },
  professionalEmail: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
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
  tfpExplanation: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeights.normal,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  infoText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  appliedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  appliedText: {
    color: theme.colors.primary,
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