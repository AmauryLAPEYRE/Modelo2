// app/(public)/login.tsx
import React, { useState } from 'react';
import { View, Text, SafeAreaView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { useAuth } from '../../src/hooks/useAuth';
import { createStyles, theme } from '../../src/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
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
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logoTitle}>modelo</Text>
        <Text style={styles.subtitle}>Connectez-vous</Text>

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="email@example.com"
        />

        <Input
          label="Mot de passe"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
        />

        <Button
          title="Se connecter"
          onPress={handleLogin}
          loading={loading}
          fullWidth
        />

        <Text style={styles.link} onPress={() => router.push('/(public)/register')}>
          Créer un compte
        </Text>
      </View>
    </SafeAreaView>
  );
}

const useStyles = createStyles(() => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  logoTitle: {
    fontSize: theme.typography.fontSizes['3xl'],
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.typography.fontFamilies?.logo || 'System',
    letterSpacing: theme.typography.letterSpacing?.logo || 0,
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.lg,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
  },
  link: {
    color: theme.colors.primary, // Orange
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
}));