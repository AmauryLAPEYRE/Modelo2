// app/(auth)/services/create.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useServices } from '../../../src/hooks/useServices';
import { useAuth } from '../../../src/hooks/useAuth';
import { Button } from '../../../src/components/ui/Button';
import { Input } from '../../../src/components/ui/Input';
import { createStyles, theme } from '../../../src/theme';

export default function CreateServiceScreen() {
  const { createService } = useServices();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState('60');
  const [compensationType, setCompensationType] = useState<'free' | 'paid' | 'tfp'>('free');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const styles = useStyles();

  const handleSubmit = async () => {
    if (!title || !description || !location || !duration) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!user || user.role !== 'professional') {
      Alert.alert('Erreur', 'Seuls les professionnels peuvent créer des prestations');
      return;
    }

    setLoading(true);
    try {
      await createService({
        title,
        description,
        professionalId: user.id,
        date: new Date(), // Pour simplifier, on met la date d'aujourd'hui
        duration: parseInt(duration),
        compensation: {
          type: compensationType,
          amount: compensationType === 'paid' ? parseInt(amount) : undefined,
        },
        location,
        status: 'published',
      });

      Alert.alert('Succès', 'Prestation créée avec succès', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <Text style={styles.title}>Créer une prestation</Text>

          <Input
            label="Titre"
            value={title}
            onChangeText={setTitle}
            placeholder="Ex: Coupe et coiffage"
          />

          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Décrivez votre prestation..."
          />

          <Input
            label="Lieu"
            value={location}
            onChangeText={setLocation}
            placeholder="Ex: Paris 10ème arrondissement"
          />

          <Input
            label="Durée (minutes)"
            value={duration}
            onChangeText={setDuration}
            placeholder="Ex: 60"
          />

          <Text style={styles.label}>Type de compensation</Text>
          <View style={styles.compensationContainer}>
            {(['free', 'paid', 'tfp'] as const).map((type) => (
              <Button
                key={type}
                title={type === 'free' ? 'Gratuit' : type === 'paid' ? 'Payant' : 'TFP'}
                onPress={() => setCompensationType(type)}
                variant={compensationType === type ? 'primary' : 'ghost'}
                fullWidth
              />
            ))}
          </View>

          {compensationType === 'paid' && (
            <Input
              label="Montant (€)"
              value={amount}
              onChangeText={setAmount}
              placeholder="Ex: 50"
            />
          )}

          <Button
            title="Créer la prestation"
            onPress={handleSubmit}
            loading={loading}
            fullWidth
          />
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
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  label: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSizes.sm,
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  compensationContainer: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
}));