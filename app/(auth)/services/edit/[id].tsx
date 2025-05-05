// app/(auth)/services/edit/[id].tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useServices } from '../../../../src/hooks/useServices';
import { useAuth } from '../../../../src/hooks/useAuth';
import { Button } from '../../../../src/components/ui/Button';
import { Input } from '../../../../src/components/ui/Input';
import { createThemedStyles, useTheme } from '../../../../src/theme';
import { Service } from '../../../../src/types/models';

export default function EditServiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getService, updateService } = useServices();
  const { user } = useAuth();
  const theme = useTheme();
  const styles = useStyles();
  
  const [service, setService] = useState<Service | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState('60');
  const [compensationType, setCompensationType] = useState<'free' | 'paid' | 'tfp'>('free');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      if (id) {
        const serviceData = await getService(id);
        if (serviceData) {
          setService(serviceData);
          setTitle(serviceData.title);
          setDescription(serviceData.description);
          setLocation(serviceData.location);
          setDuration(serviceData.duration.toString());
          setCompensationType(serviceData.compensation.type);
          setAmount(serviceData.compensation.amount?.toString() || '');
        }
        setFetchLoading(false);
      }
    };
    fetchService();
  }, [id]);

  const handleSubmit = async () => {
    if (!title || !description || !location || !duration) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!service || !user || user.role !== 'professional' || service.professionalId !== user.id) {
      Alert.alert('Erreur', 'Vous n\'avez pas les droits pour modifier cette prestation');
      return;
    }

    setLoading(true);
    try {
      await updateService(service.id, {
        title,
        description,
        location,
        duration: parseInt(duration),
        compensation: {
          type: compensationType,
          amount: compensationType === 'paid' ? parseInt(amount) : undefined,
        },
      });

      Alert.alert('Succès', 'Prestation modifiée avec succès', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
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
          <Text style={styles.errorText}>Service non trouvé</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Modifier la prestation</Text>
            <Text style={styles.subtitle}>Modifiez les détails de votre service</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Titre"
              value={title}
              onChangeText={setTitle}
              placeholder="Ex: Séance photo portrait"
              icon="camera"
            />

            <Input
              label="Description"
              value={description}
              onChangeText={setDescription}
              placeholder="Décrivez votre prestation..."
              multiline
              numberOfLines={4}
              icon="document-text"
            />

            <Input
              label="Lieu"
              value={location}
              onChangeText={setLocation}
              placeholder="Ex: Studio Paris 10ème"
              icon="location"
            />

            <Input
              label="Durée (minutes)"
              value={duration}
              onChangeText={setDuration}
              placeholder="Ex: 60"
              keyboardType="numeric"
              icon="time"
            />

            <View style={styles.compensationSection}>
              <Text style={styles.label}>Type de compensation</Text>
              <View style={styles.compensationContainer}>
                {(['free', 'paid', 'tfp'] as const).map((type) => (
                  <Button
                    key={type}
                    title={type === 'free' ? 'Gratuit' : type === 'paid' ? 'Payant' : 'TFP'}
                    onPress={() => setCompensationType(type)}
                    variant={compensationType === type ? 'primary' : 'outline'}
                    style={styles.compensationButton}
                  />
                ))}
              </View>
            </View>

            {compensationType === 'paid' && (
              <Input
                label="Montant (€)"
                value={amount}
                onChangeText={setAmount}
                placeholder="Ex: 50"
                keyboardType="numeric"
                icon="cash"
              />
            )}

            <View style={styles.footer}>
              <Button
                title="Enregistrer les modifications"
                onPress={handleSubmit}
                loading={loading}
                fullWidth
                size="lg"
                icon="checkmark"
              />
              
              <Button
                title="Annuler"
                onPress={() => router.back()}
                variant="ghost"
                fullWidth
              />
            </View>
          </View>
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
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textSecondary,
  },
  form: {
    gap: theme.spacing.lg,
  },
  compensationSection: {
    gap: theme.spacing.sm,
  },
  label: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
  },
  compensationContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'space-between',
  },
  compensationButton: {
    flex: 1,
  },
  footer: {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.sm,
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
  },
}));