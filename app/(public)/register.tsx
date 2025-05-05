// app/(public)/register.tsx
import React, { useState } from 'react';
import { View, Text, SafeAreaView, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { useAuth } from '../../src/hooks/useAuth';
import { createThemedStyles, useTheme } from '../../src/theme';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'model' | 'professional' | ''>('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const theme = useTheme();
  const styles = useStyles();

  const handleRegister = async () => {
    if (!email || !password || !name || !role) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, name, role);
      router.replace('/(auth)/home');
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
              <Text style={styles.logoTitle}>modelo</Text>
              <Text style={styles.subtitle}>Créez votre compte professionnel</Text>
            </View>

            <View style={styles.form}>
              <Input
                label="Nom"
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
                    onPress={() => setRole('model')}
                    variant={role === 'model' ? 'primary' : 'outline'}
                    fullWidth
                    icon="person-outline"
                  />
                  
                  <Button
                    title="Professionnel"
                    onPress={() => setRole('professional')}
                    variant={role === 'professional' ? 'primary' : 'outline'}
                    fullWidth
                    icon="briefcase-outline"
                  />
                </View>
              </View>

              <Button
                title="S'inscrire"
                onPress={handleRegister}
                loading={loading}
                fullWidth
                size="lg"
                disabled={!email || !password || !name || !role}
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
  logoTitle: {
    fontSize: theme.typography.fontSizes['3xl'],
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.typography.fontFamilies?.logo || 'System',
    letterSpacing: theme.typography.letterSpacing?.wide || 0,
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.lg,
    color: theme.colors.textSecondary,
    textAlign: 'center',
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
    gap: theme.spacing.sm,
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