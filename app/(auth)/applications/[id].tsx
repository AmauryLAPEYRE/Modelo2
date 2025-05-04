// app/(auth)/applications/[id].tsx
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TextInput, View } from 'react-native';
import { Button, Card } from '../../../src/components/ui';
import { ApplicationStatus } from '../../../src/domain/models/ApplicationModel';
import { formatDate } from '../../../src/utils/formatters';
import { createThemedStyles, useTheme } from '../../../src/utils/theme';
import { useApplicationViewModel } from '../../../src/viewModels/useApplicationViewModel';
import { useAuthViewModel } from '../../../src/viewModels/useAuthViewModel';
import { useServiceViewModel } from '../../../src/viewModels/useServiceViewModel';
import { useUserViewModel } from '../../../src/viewModels/useUserViewModel';

export default function ApplicationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const styles = useStyles();
  const { currentApplication, fetchApplicationById, updateApplicationStatus, isLoading: appLoading } = useApplicationViewModel();
  const { fetchServiceById, currentService } = useServiceViewModel();
  const { fetchUserById } = useUserViewModel();
  const { currentUser } = useAuthViewModel();
  
  const [modelUser, setModelUser] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [showResponseInput, setShowResponseInput] = useState(false);
  
  useEffect(() => {
    if (!id) return;
    
    const loadData = async () => {
      try {
        const application = await fetchApplicationById(id);
        if (!application) return;
        
        // Récupérer les détails du service
        await fetchServiceById(application.serviceId);
        
        // Récupérer les informations du modèle
        const model = await fetchUserById(application.modelId);
        setModelUser(model);
      } catch (error) {
        console.error('Error loading application details:', error);
      }
    };
    
    loadData();
  }, [id]);
  
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
  
  const handleUpdateStatus = async (status: ApplicationStatus) => {
    if (!currentApplication) return;
    
    setIsUpdating(true);
    try {
      await updateApplicationStatus(currentApplication.id, status, responseMessage);
      
      if (status === 'accepted') {
        Alert.alert(
          'Candidature acceptée',
          'La candidature a été acceptée. Vous pouvez maintenant communiquer avec le modèle.',
          [
            { text: 'OK' },
            { 
              text: 'Envoyer un message', 
              onPress: () => router.push(`/(auth)/messages/${currentApplication.modelId}`) 
            }
          ]
        );
      } else if (status === 'rejected') {
        Alert.alert('Candidature refusée', 'La candidature a été refusée.');
      }
      
      // Masquer l'input de réponse
      setShowResponseInput(false);
      setResponseMessage('');
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la mise à jour de la candidature.');
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const canAcceptOrReject = 
    currentUser?.role === 'professional' &&
    currentApplication?.status === 'pending' &&
    currentService?.professionalId === currentUser.id;
  
  const canCancel = 
    currentUser?.role === 'model' &&
    currentUser?.id === currentApplication?.modelId &&
    currentApplication?.status === 'pending';
  
  const canChat = 
    currentApplication?.status === 'accepted' &&
    ((currentUser?.role === 'model' && currentUser?.id === currentApplication?.modelId) ||
     (currentUser?.role === 'professional' && currentService?.professionalId === currentUser.id));
  
  if (appLoading || !currentApplication) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      {/* En-tête avec statut */}
      <View style={[styles.statusHeader, { backgroundColor: getStatusColor(currentApplication.status) + '15' }]}>
        <Text style={[styles.statusText, { color: getStatusColor(currentApplication.status) }]}>
          Statut: {getStatusText(currentApplication.status)}
        </Text>
        <Text style={styles.dateText}>
          Candidature du {formatDate(currentApplication.createdAt)}
        </Text>
      </View>
      
      {/* Informations du modèle */}
      {modelUser && (
        <Card style={styles.modelCard} padding="md">
          <Text style={styles.sectionTitle}>Modèle</Text>
          <View style={styles.modelInfo}>
            {modelUser.photoURL ? (
              <Image source={{ uri: modelUser.photoURL }} style={styles.modelPhoto} />
            ) : (
              <View style={styles.modelPhotoPlaceholder}>
                <FontAwesome name="user" size={40} color={theme.colors.primary} />
              </View>
            )}
            <View style={styles.modelDetails}>
              <Text style={styles.modelName}>{modelUser.displayName}</Text>
              <Text style={styles.modelRole}>Modèle</Text>
              {modelUser.bio && (
                <Text style={styles.modelBio} numberOfLines={2}>{modelUser.bio}</Text>
              )}
            </View>
          </View>
          
          {modelUser.role === 'model' && (
            <View style={styles.modelStats}>
              {modelUser.height && (
                <View style={styles.statItem}>
                  <FontAwesome name="user" size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.statText}>{modelUser.height} cm</Text>
                </View>
              )}
              {modelUser.hairColor && (
                <View style={styles.statItem}>
                  <Ionicons name="color-palette-outline" size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.statText}>{modelUser.hairColor}</Text>
                </View>
              )}
            </View>
          )}
        </Card>
      )}
      
      {/* Information de la prestation */}
      {currentService && (
        <Card style={styles.serviceCard} padding="md">
          <Text style={styles.sectionTitle}>Prestation</Text>
          <Text style={styles.serviceTitle}>{currentService.title}</Text>
          <Text style={styles.serviceDescription} numberOfLines={3}>
            {currentService.description}
          </Text>
          <View style={styles.serviceInfo}>
            <View style={styles.serviceDetail}>
              <FontAwesome name="calendar" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.serviceDetailText}>{formatDate(currentService.date)}</Text>
            </View>
            <View style={styles.serviceDetail}>
              <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.serviceDetailText} numberOfLines={1}>
                {currentService.location.address}
              </Text>
            </View>
          </View>
          <Button
            title="Voir la prestation"
            onPress={() => router.push(`/(auth)/services/${currentService.id}`)}
            variant="outline"
            size="sm"
            style={styles.viewServiceButton}
          />
        </Card>
      )}
      
      {/* Message de candidature */}
      {currentApplication.message && (
        <Card style={styles.messageCard} padding="md">
          <Text style={styles.sectionTitle}>Message de candidature</Text>
          <Text style={styles.messageText}>{currentApplication.message}</Text>
        </Card>
      )}
      
      {/* Réponse du professionnel */}
      {currentApplication.responseMessage && (
        <Card style={styles.responseCard} padding="md">
          <Text style={styles.sectionTitle}>Réponse du professionnel</Text>
          <Text style={styles.responseText}>{currentApplication.responseMessage}</Text>
        </Card>
      )}
      
      {/* Actions */}
      <View style={styles.actions}>
        {canAcceptOrReject && (
          <>
            {showResponseInput && (
              <Card padding="sm" style={styles.responseInputCard}>
                <Text style={styles.responseInputLabel}>
                  Message de réponse (optionnel)
                </Text>
                <TextInput
                  value={responseMessage}
                  onChangeText={setResponseMessage}
                  placeholder="Écrivez votre réponse..."
                  multiline
                  numberOfLines={3}
                  style={styles.responseInput}
                  textAlignVertical="top"
                />
              </Card>
            )}
            
            <View style={styles.buttonContainer}>
              <Button
                title="Accepter"
                onPress={() => {
                  if (showResponseInput) {
                    handleUpdateStatus('accepted');
                  } else {
                    setShowResponseInput(true);
                  }
                }}
                loading={isUpdating}
                style={styles.acceptButton}
                icon={<FontAwesome name="check" size={16} color="white" />}
              />
              <Button
                title="Refuser"
                onPress={() => {
                  if (showResponseInput) {
                    handleUpdateStatus('rejected');
                  } else {
                    setShowResponseInput(true);
                  }
                }}
                loading={isUpdating}
                variant="danger"
                style={styles.rejectButton}
                icon={<FontAwesome name="times" size={16} color="white" />}
              />
            </View>
            
            {showResponseInput && (
              <Button
                title="Annuler"
                onPress={() => {
                  setShowResponseInput(false);
                  setResponseMessage('');
                }}
                variant="ghost"
                size="sm"
                style={styles.cancelButton}
              />
            )}
          </>
        )}
        
        {canCancel && (
          <Button
            title="Annuler ma candidature"
            onPress={() => handleUpdateStatus('cancelled')}
            loading={isUpdating}
            variant="outline"
            fullWidth
            icon={<FontAwesome name="ban" size={16} color={theme.colors.primary} />}
          />
        )}
        
        {canChat && (
          <Button
            title="Envoyer un message"
            onPress={() => {
              if (currentUser?.role === 'model' && currentService) {
                router.push(`/(auth)/messages/${currentService.professionalId}`);
              } else if (currentUser?.role === 'professional' && currentApplication) {
                router.push(`/(auth)/messages/${currentApplication.modelId}`);
              }
            }}
            fullWidth
            icon={<Ionicons name="chatbubble-outline" size={16} color="white" />}
          />
        )}
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
  statusHeader: {
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  statusText: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  dateText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  modelCard: {
    margin: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  modelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  modelPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: theme.spacing.md,
  },
  modelPhotoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  modelDetails: {
    flex: 1,
  },
  modelName: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.text,
  },
  modelRole: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  modelBio: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  modelStats: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text,
  },
  serviceCard: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  serviceTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  serviceDescription: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  serviceInfo: {
    marginBottom: theme.spacing.sm,
  },
  serviceDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  serviceDetailText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text,
  },
  viewServiceButton: {
    alignSelf: 'flex-start',
  },
  messageCard: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  messageText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
    lineHeight: 22,
  },
  responseCard: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.primary + '10',
  },
  responseText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
    lineHeight: 22,
  },
  actions: {
    padding: theme.spacing.md,
  },
  responseInputCard: {
    marginBottom: theme.spacing.md,
  },
  responseInputLabel: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  responseInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    minHeight: 80,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  acceptButton: {
    flex: 1,
  },
  rejectButton: {
    flex: 1,
  },
  cancelButton: {
    marginTop: theme.spacing.sm,
  },
}));