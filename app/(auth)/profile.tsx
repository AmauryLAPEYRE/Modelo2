// app/(auth)/profile.tsx
import React from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { Button } from '../../src/components/ui/Button';
import { createStyles, theme } from '../../src/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const styles = useStyles();

  const handleLogout = async () => {
    await logout();
    router.replace('/(public)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.role}>
            {user?.role === 'model' ? 'Modèle' : 'Professionnel'}
          </Text>
        </View>

        <View style={styles.content}>
          <Button
            title="Paramètres"
            onPress={() => router.push('/(auth)/settings')}
            variant="secondary"
            fullWidth
          />
          
          <Button
            title="Se déconnecter"
            onPress={handleLogout}
            variant="ghost"
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
  header: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  name: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  email: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  role: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.primary,
  },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
}));