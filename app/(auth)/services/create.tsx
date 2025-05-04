// app/(auth)/services/create.tsx
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { ServiceForm } from '../../../src/components/services/ServiceForm';
import { ServiceModel } from '../../../src/domain/models/ServiceModel';
import { useAuthViewModel } from '../../../src/viewModels/useAuthViewModel';
import { useServiceViewModel } from '../../../src/viewModels/useServiceViewModel';

export default function CreateServiceScreen() {
  const router = useRouter();
  const { createService, isLoading } = useServiceViewModel();
  const { currentUser } = useAuthViewModel();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (values: Partial<ServiceModel>, images: any[]) => {
    if (!currentUser || currentUser.role !== 'professional') {
      Alert.alert('Erreur', 'Seuls les professionnels peuvent créer des prestations.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createService({
        ...values,
        professionalId: currentUser.id,
        status: 'published', // Publier directement
      } as ServiceModel, images);
      
      Alert.alert(
        'Succès',
        'Votre prestation a été créée avec succès.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la création de la prestation.');
      console.error('Error creating service:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <ServiceForm
      onSubmit={handleSubmit}
      buttonText="Créer la prestation"
      isSubmitting={isSubmitting}
    />
  );
}
