// app/(auth)/services/index.tsx
import React from 'react';
import { View, ScrollView, SafeAreaView, Text } from 'react-native';
import { router } from 'expo-router';
import { useServices } from '../../../src/hooks/useServices';
import { ServiceCard } from '../../../src/components/services/ServiceCard';
import { createStyles, theme } from '../../../src/theme';
import { Button } from '../../../src/components/ui/Button';
import { useAuth } from '../../../src/hooks/useAuth';

export default function ServicesListScreen() {
  const { services, loading } = useServices();
  const { user } = useAuth();
  const styles = useStyles();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Prestations</Text>
          {user?.role === 'professional' && (
            <Button
              title="Créer une prestation"
              onPress={() => router.push('/(auth)/services/create')}
              variant="primary"
            />
          )}
        </View>

        {loading ? (
          <Text style={styles.loadingText}>Chargement...</Text>
        ) : services.length > 0 ? (
          services.map(service => (
            <ServiceCard
              key={service.id}
              service={service}
              onPress={() => router.push(`/(auth)/services/${service.id}`)}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>Aucune prestation disponible</Text>
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
}));