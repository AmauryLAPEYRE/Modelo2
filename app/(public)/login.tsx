// app/(public)/login.tsx
import React, { useState } from 'react';
import { View, Text, SafeAreaView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Logo } from '../../src/components/ui/Logo';
import { useAuth } from '../../src/hooks/useAuth';
import { createThemedStyles, useTheme } from '../../src/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const theme = useTheme();
  const styles = useStyles();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(auth)/home');
    } catch (error) {
      Alert.alert('Erreur', 'Email ou mot de passe incorrect');
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
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            {/* Remplacer l'ancien logo par le nouveau */}
            <Logo size="large" />
            <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>
          </View>

          <View style={styles.form}>
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

            <View style={styles.actions}>
              <Button
                title="Se connecter"
                onPress={handleLogin}
                loading={loading}
                fullWidth
                size="lg"
              />

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OU</Text>
                <View style={styles.dividerLine} />
              </View>

              <Button
                title="Créer un compte"
                onPress={() => router.push('/(public)/register')}
                variant="outline"
                fullWidth
                size="lg"
              />
            </View>

            <Text style={styles.footerText}>
              Besoin d'aide ?{' '}
              <Text style={styles.link} onPress={() => {}}>
                Contactez le support
              </Text>
            </Text>
          </View>
        </View>
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
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing['3xl'],
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.lg,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.lg,
  },
  form: {
    gap: theme.spacing.lg,
  },
  actions: {
    gap: theme.spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    color: theme.colors.textSecondary,
    paddingHorizontal: theme.spacing.sm,
    fontSize: theme.typography.fontSizes.sm,
  },
  footerText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
    fontSize: theme.typography.fontSizes.sm,
  },
  link: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.medium,
  },
}));