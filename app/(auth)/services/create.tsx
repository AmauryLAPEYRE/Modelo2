// app/(auth)/services/create.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, Alert, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { useServices } from '../../../src/hooks/useServices';
import { useAuth } from '../../../src/hooks/useAuth';
import { Button } from '../../../src/components/ui/Button';
import { Input } from '../../../src/components/ui/Input';
import { createThemedStyles, useTheme } from '../../../src/theme';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function CreateServiceScreen() {
  const { createService } = useServices();
  const { user } = useAuth();
  const theme = useTheme();
  
  // États pour les champs du formulaire
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState('60');
  const [compensationType, setCompensationType] = useState<'free' | 'paid' | 'tfp'>('free');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // États pour le sélecteur de date
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const styles = useStyles();

  // Fonction pour formater la date
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Gestion du changement de date
  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

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
        date: date, // Utilisation de la date sélectionnée
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
      {/* Header personnalisé avec bouton retour */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouvelle prestation</Text>
        <View style={{ width: 30 }} />
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.headerSection}>
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

            {/* Sélecteur de date */}
            <View style={styles.dateSection}>
              <Text style={styles.label}>Date de la prestation</Text>
              <TouchableOpacity 
                style={styles.dateSelector}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar" size={20} color={theme.colors.primary} />
                <Text style={styles.dateText}>{formatDate(date)}</Text>
                <Ionicons name="chevron-down" size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                minimumDate={new Date()}
                style={styles.datePicker}
              />
            )}

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  backButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
  },
  content: {
    padding: theme.spacing.lg,
  },
  headerSection: {
    marginBottom: theme.spacing.xl,
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    gap: theme.spacing.lg,
  },
  compensationSection: {
    gap: theme.spacing.sm,
  },
  dateSection: {
    gap: theme.spacing.sm,
  },
  label: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    minHeight: 48,
    gap: theme.spacing.sm,
  },
  dateText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSizes.md,
    flex: 1,
  },
  datePicker: {
    marginTop: -10,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
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
}));