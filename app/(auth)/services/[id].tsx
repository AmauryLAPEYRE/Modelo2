// app/(auth)/services/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Alert, Dimensions, Image } from 'react-native';
import { ApplicationStatus } from '../../../src/domain/models/ApplicationModel';
import { formatCurrency, formatDate } from '../../../src/utils/formatters';
import { useApplicationViewModel } from '../../../src/viewModels/useApplicationViewModel';

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const styles = useStyles();
  const { currentService, fetchServiceById, isLoading } = useServiceViewModel();
  const { createApplication, applications, fetchApplications, isLoading: applicationLoading } = useApplicationViewModel();
  const { currentUser } = useAuthViewModel();
  const [userApplication, setUserApplication] = useState<any>(null);
  const [isApplying, setIsApplying] = useState(false);
  
  useEffect(() => {
    if (!id) return;
    
    const loadData = async () => {
      await fetchServiceById(id);
      
      // Pour les modèles, vérifier s'ils ont déjà postulé
      if (currentUser?.role === 'model') {
        const userApplications = await fetchApplications({
          serviceId: id,
          modelId: currentUser.id,
        });
        
        if (userApplications.length > 0) {
          setUserApplication(userApplications[0]);
        }
      }
    };
    
    loadData();
  }, [id]);
  
  const getServiceTypeLabel = (type: string): string => {
    switch (type) {
      case 'haircut':
        return 'Coiffure';
      case 'coloring':
        return 'Coloration';
      case 'makeup':
        return 'Maquillage';
      case 'photoshoot':
        return 'Séance photo';
      case 'other':
      default:
        return 'Autre';
    }
  };
  
  const getCompensationText = (compensation: any): string => {
    switch (compensation.type) {
      case 'free':
        return 'Gratuit';
      case 'paid':
        return formatCurrency(compensation.amount || 0);
      case 'tfp':
        return 'TFP (Time For Prints)';
      default:
        return 'Non spécifié';
    }
  };
  
  const handleApply = async () => {
    if (!currentUser || !currentService) return;
    
    setIsApplying(true);
    try {
      await createApplication({
        serviceId: currentService.id,
        modelId: currentUser.id,
        status: 'pending',
        message: '', // Vous pouvez ajouter un modal pour permettre à l'utilisateur d'ajouter un message
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      Alert.alert(
        'Candidature envoyée',
        'Votre candidature a été envoyée avec succès. Le professionnel l\'examinera bientôt.',
        [{ text: 'OK' }]
      );
      
      // Recharger les données pour afficher le nouveau statut
      const userApplications = await fetchApplications({
        serviceId: currentService.id,
        modelId: currentUser.id,
      });
      
      if (userApplications.length > 0) {
        setUserApplication(userApplications[0]);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'envoi de votre candidature.');
      console.error('Error applying:', error);
    } finally {
      setIsApplying(false);
    }
  };
  
  const getApplicationStatusColor = (status: ApplicationStatus): string => {
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
  
  const getApplicationStatusText = (status: ApplicationStatus): string => {
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
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  
  if (!currentService) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Prestation non trouvée</Text>
        <Button title="Retour" onPress={() => router.back()} variant="outline" />
      </View>
    );
  }
  
  const canApply = 
    currentUser?.role === 'model' && 
    !userApplication && 
    currentService.professionalId !== currentUser.id &&
    currentService.status === 'published';
  
  const isOwner = currentUser?.id === currentService.professionalId;
  
  return (
    <ScrollView style={styles.container}>
      {/* Carrousel d'images */}
      {currentService.images && currentService.images.length > 0 && (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.imageContainer}
        >
          {currentService.images.map((image, index) => (
            <Image
              key={index}
              source={{ uri: image }}
              style={styles.image}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      )}
      
      {/* Contenu principal */}
      <View style={styles.content}>
        {/* Type de service badge */}
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{getServiceTypeLabel(currentService.type)}</Text>
        </View>
        
        <Text style={styles.title}>{currentService.title}</Text>
        
        {/* Informations principales */}
        <View style={styles.mainInfo}>
          <View style={styles.infoItem}>
            <FontAwesome name="calendar" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>{formatDate(currentService.date)}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>{currentService.duration} minutes</Text>
          </View>
          
          <View style={styles.infoItem}>
            <FontAwesome name="money" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>{getCompensationText(currentService.compensation)}</Text>
          </View>
        </View>
        
        {/* Status de l'application si applicable */}
        {userApplication && (
          <Card
            style={[
              styles.applicationStatus,
              { backgroundColor: getApplicationStatusColor(userApplication.status) + '15' }
            ]}
            padding="sm"
          >
            <Text style={[styles.applicationStatusText, { color: getApplicationStatusColor(userApplication.status) }]}>
              Candidature: {getApplicationStatusText(userApplication.status)}
            </Text>
          </Card>
        )}
        
        {/* Description */}
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{currentService.description}</Text>
        
        {/* Localisation */}
        <Text style={styles.sectionTitle}>Localisation</Text>
        <Card variant="outlined" padding="sm" style={styles.locationCard}>
          <View style={styles.locationContent}>
            <Ionicons name="location-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.locationText}>{currentService.location.address}</Text>
          </View>
        </Card>
        
        {/* Critères recherchés */}
        {currentService.requirements && Object.keys(currentService.requirements).length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Critères recherchés</Text>
            <Card variant="outlined" padding="sm" style={styles.requirementsCard}>
              {currentService.requirements.gender && (
                <Text style={styles.requirementText}>
                  Genre: {currentService.requirements.gender === 'all' ? 'Tous' : 
                        currentService.requirements.gender === 'male' ? 'Homme' : 'Femme'}
                </Text>
              )}
              {currentService.requirements.experience && (
                <Text style={styles.requirementText}>
                  Expérience: {currentService.requirements.experience === 'beginner' ? 'Débutant' :
                               currentService.requirements.experience === 'intermediate' ? 'Intermédiaire' : 'Expérimenté'}
                </Text>
              )}
              {currentService.requirements.hairColor && currentService.requirements.hairColor.length > 0 && (
                <Text style={styles.requirementText}>
                  Couleur de cheveux: {currentService.requirements.hairColor.join(', ')}
                </Text>
              )}
              {currentService.requirements.hairLength && (
                <Text style={styles.requirementText}>
                  Longueur de cheveux: {currentService.requirements.hairLength === 'short' ? 'Court' :
                                       currentService.requirements.hairLength === 'medium' ? 'Moyen' : 'Long'}
                </Text>
              )}
              {(currentService.requirements.minHeight || currentService.requirements.maxHeight) && (
                <Text style={styles.requirementText}>
                  Taille: {currentService.requirements.minHeight || 0} cm - {currentService.requirements.maxHeight || '∞'} cm
                </Text>
              )}
            </Card>
          </>
        )}
        
        {/* Actions */}
        <View style={styles.actions}>
          {canApply && (
            <Button
              title="Postuler"
              onPress={handleApply}
              loading={isApplying}
              fullWidth
              size="lg"
              icon={<FontAwesome name="paper-plane" size={16} color="white" />}
            />
          )}
          
          {isOwner && (
            <View style={styles.ownerActions}>
              <Button
                title="Voir les candidatures"
                onPress={() => router.push(`/(auth)/applications?serviceId=${currentService.id}`)}
                variant="outline"
                fullWidth
                size="lg"
                icon={<FontAwesome name="users" size={16} color={theme.colors.primary} />}
              />
              <Button
                title="Modifier"
                onPress={() => router.push(`/(auth)/services/edit/${currentService.id}`)}
                variant="secondary"
                fullWidth
                size="lg"
                icon={<FontAwesome name="edit" size={16} color="white" />}
                style={{ marginTop: theme.spacing.sm }}
              />
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const useStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  errorText: {
    fontSize: theme.typography.fontSizes.lg,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  imageContainer: {
    height: 250,
  },
  image: {
    width: Dimensions.get('window').width,
    height: 250,
  },
  content: {
    padding: theme.spacing.md,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  typeBadgeText: {
    color: 'white',
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  title: {
    fontSize: theme.typography.fontSizes['2xl'],
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  mainInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  infoText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textSecondary,
  },
  applicationStatus: {
    marginBottom: theme.spacing.md,
  },
  applicationStatusText: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
    lineHeight: 24,
  },
  locationCard: {
    marginBottom: theme.spacing.md,
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  locationText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
    flex: 1,
  },
  requirementsCard: {
    marginBottom: theme.spacing.md,
  },
  requirementText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  actions: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  ownerActions: {
    marginTop: theme.spacing.sm,
  },
}));