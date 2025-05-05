// app/(auth)/services/create.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useServices } from '../../../src/hooks/useServices';
import { useAuth } from '../../../src/hooks/useAuth';
import { Button } from '../../../src/components/ui/Button';
import { Input } from '../../../src/components/ui/Input';
import { createThemedStyles, useTheme } from '../../../src/theme';

export default function CreateServiceScreen() {
  const { createService } = useServices();
  const { user } = useAuth();
  const theme = useTheme();
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
        date: new Date(),
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
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Nouvelle prestation</Text>
            <Text style={styles.subtitle}>Définissez les détails de votre service</Text>
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
                    fullWidth
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
                title="Créer la prestation"
                onPress={handleSubmit}
                loading={loading}
                fullWidth
                size="lg"
                icon="add-circle"
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
  },
  footer: {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
}));