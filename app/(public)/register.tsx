// app/(public)/register.tsx
import React, { useState } from 'react';
import { View, Text, SafeAreaView, Alert, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { useAuth } from '../../src/hooks/useAuth';
import { createStyles, theme } from '../../src/theme';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'model' | 'professional' | ''>('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
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
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logoTitle}>modelo</Text>
        <Text style={styles.subtitle}>Créez votre compte</Text>

        <Input
          label="Nom"
          value={name}
          onChangeText={setName}
          placeholder="Votre nom"
        />

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

        <Text style={styles.label}>Je suis un :</Text>
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[styles.roleButton, role === 'model' && styles.roleButtonActive]}
            onPress={() => setRole('model')}
          >
            <Text style={[styles.roleText, role === 'model' && styles.roleTextActive]}>
              Modèle
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.roleButton, role === 'professional' && styles.roleButtonActive]}
            onPress={() => setRole('professional')}
          >
            <Text style={[styles.roleText, role === 'professional' && styles.roleTextActive]}>
              Professionnel
            </Text>
          </TouchableOpacity>
        </View>

        <Button
          title="S'inscrire"
          onPress={handleRegister}
          loading={loading}
          fullWidth
        />

        <Text style={styles.link} onPress={() => router.push('/(public)/login')}>
          J'ai déjà un compte
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
  label: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSizes.sm,
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  roleButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  roleButtonActive: {
    borderColor: theme.colors.primary, // Orange
    backgroundColor: theme.colors.surface,
  },
  roleText: {
    color: theme.colors.textSecondary,
  },
  roleTextActive: {
    color: theme.colors.primary, // Orange
    fontWeight: theme.typography.fontWeights.semibold,
  },
  link: {
    color: theme.colors.primary, // Orange
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
}));