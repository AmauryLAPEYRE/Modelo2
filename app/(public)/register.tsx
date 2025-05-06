// app/(public)/register.tsx
import React, { useState } from 'react';
import { View, Text, SafeAreaView, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Logo } from '../../src/components/ui/Logo';
import { useAuth } from '../../src/hooks/useAuth';
import { createThemedStyles, useTheme } from '../../src/theme';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'model' | 'professional' | ''>('');
  const [professionalType, setProfessionalType] = useState<'coiffeur' | 'maquilleur' | 'photographe' | 'estheticienne' | ''>('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const theme = useTheme();
  const styles = useStyles();

  const handleRegister = async () => {
    if (!email || !password || !name || !role) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    // Vérifier si le type professionnel est sélectionné si l'utilisateur est un professionnel
    if (role === 'professional' && !professionalType) {
      Alert.alert('Erreur', 'Veuillez sélectionner votre type de profession');
      return;
    }

    setLoading(true);
    try {
      await register(
        email, 
        password, 
        name, 
        role, 
        role === 'professional' ? professionalType : undefined
      );
      
      // Si c'est un modèle, rediriger vers le formulaire de profil complet
      if (role === 'model') {
        router.replace('/(auth)/profile/complete');
      } else {
        router.replace('/(auth)/home');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Logo size="medium" />
              <Text style={styles.subtitle}>Créez votre compte professionnel</Text>
            </View>

            <View style={styles.form}>
              <Input
                label="Nom complet"
                value={name}
                onChangeText={setName}
                placeholder="Votre nom"
                icon="person"
              />

              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="email@exemple.com"
                keyboardType="email-address"
                autoCapitalize="none"
                icon="mail"
              />

              <Input
                label="Mot de passe"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
                icon="lock-closed"
              />

              <View style={styles.roleSection}>
                <Text style={styles.roleLabel}>
                  Êtes-vous un modèle ou un professionnel ?
                </Text>
                <View style={styles.roleContainer}>
                  <Button
                    title="Modèle"
                    onPress={() => {
                      setRole('model');
                      setProfessionalType(''); // Réinitialiser le type professionnel
                    }}
                    variant={role === 'model' ? 'primary' : 'outline'}
                    style={styles.roleButton}
                    icon="person-outline"
                  />
                  
                  <Button
                    title="Professionnel"
                    onPress={() => setRole('professional')}
                    variant={role === 'professional' ? 'primary' : 'outline'}
                    style={styles.roleButton}
                    icon="briefcase-outline"
                  />
                </View>
              </View>

              {/* Afficher les options de type professionnel si le rôle est professionnel */}
              {role === 'professional' && (
                <View style={styles.professionalTypeSection}>
                  <Text style={styles.roleLabel}>Quelle est votre spécialité ?</Text>
                  <View style={styles.professionalTypeContainer}>
                    {[
                      { value: 'coiffeur', label: 'Coiffeur', icon: 'cut' },
                      { value: 'maquilleur', label: 'Maquilleur', icon: 'color-palette' },
                      { value: 'photographe', label: 'Photographe', icon: 'camera' },
                      { value: 'estheticienne', label: 'Esthéticienne', icon: 'flower' }
                    ].map(type => (
                      <TouchableOpacity
                        key={type.value}
                        style={[
                          styles.professionalTypeItem,
                          professionalType === type.value && styles.professionalTypeItemActive
                        ]}
                        onPress={() => setProfessionalType(type.value as any)}
                      >
                        <Ionicons 
                          name={type.icon as keyof typeof Ionicons.glyphMap} 
                          size={24} 
                          color={professionalType === type.value ? 'white' : theme.colors.primary} 
                        />
                        <Text 
                          style={[
                            styles.professionalTypeText,
                            professionalType === type.value && styles.professionalTypeTextActive
                          ]}
                        >
                          {type.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Note informative pour les modèles */}
              {role === 'model' && (
                <View style={styles.infoBox}>
                  <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
                  <Text style={styles.infoText}>
                    Après votre inscription, vous serez invité à compléter votre profil avec des informations 
                    supplémentaires pour augmenter vos chances d'être sélectionné(e).
                  </Text>
                </View>
              )}

              <Button
                title="S'inscrire"
                onPress={handleRegister}
                loading={loading}
                fullWidth
                size="lg"
                disabled={!email || !password || !name || !role || (role === 'professional' && !professionalType)}
              />

              <Text style={styles.loginLink}>
                Déjà membre ?{' '}
                <Text style={styles.link} onPress={() => router.push('/(public)/login')}>
                  Se connecter
                </Text>
              </Text>

              <Text style={styles.termsText}>
                En créant un compte, vous acceptez nos{' '}
                <Text style={styles.link}>conditions d'utilisation</Text>
                {' '}et notre{' '}
                <Text style={styles.link}>politique de confidentialité</Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const useStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.xl,
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.lg,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  form: {
    gap: theme.spacing.lg,
  },
  roleSection: {
    marginBottom: theme.spacing.sm,
  },
  roleLabel: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.medium,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    gap: theme.spacing.sm,
  },
  roleButton: {
    flex: 1,
    minWidth: '48%',
    maxWidth: '48%',
  },
  professionalTypeSection: {
    marginBottom: theme.spacing.md,
  },
  professionalTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  professionalTypeItem: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  professionalTypeItemActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  professionalTypeText: {
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
    textAlign: 'center',
  },
  professionalTypeTextActive: {
    color: 'white',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${theme.colors.primary}10`,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  infoText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.typography.fontSizes.sm,
  },
  loginLink: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontSize: theme.typography.fontSizes.md,
  },
  link: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.medium,
  },
  termsText: {
    color: theme.colors.textTertiary,
    textAlign: 'center',
    fontSize: theme.typography.fontSizes.sm,
    lineHeight: theme.typography.lineHeights.relaxed,
  },
}));