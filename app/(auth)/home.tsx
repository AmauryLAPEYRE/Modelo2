// app/(auth)/home.tsx
import React from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { useServices } from '../../src/hooks/useServices';
import { useApplications } from '../../src/hooks/useApplications';
import { ServiceCard } from '../../src/components/services/ServiceCard';
import { ApplicationCard } from '../../src/components/applications/ApplicationCard';
import { createStyles, theme } from '../../src/theme';

export default function HomeScreen() {
  const { user } = useAuth();
  const { services } = useServices();
  const { applications } = useApplications(user?.id, user?.role);
  const styles = useStyles();

  // Afficher les 5 derniers services
  const recentServices = services.slice(0, 5);
  // Afficher les 5 dernières candidatures
  const recentApplications = applications.slice(0, 5);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.welcome}>Bonjour, {user?.name}</Text>
          <Text style={styles.role}>
            {user?.role === 'model' ? 'Modèle' : 'Professionnel'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services récents</Text>
          {recentServices.map(service => (
            <ServiceCard
              key={service.id}
              service={service}
              onPress={() => router.push(`/(auth)/services/${service.id}`)}
            />
          ))}
          {recentServices.length === 0 && (
            <Text style={styles.emptyText}>Aucun service disponible</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {user?.role === 'model' ? 'Mes candidatures' : 'Candidatures reçues'}
          </Text>
          {recentApplications.map(application => (
            <ApplicationCard
              key={application.id}
              application={application}
              onPress={() => router.push(`/(auth)/applications/${application.id}`)}
            />
          ))}
          {recentApplications.length === 0 && (
            <Text style={styles.emptyText}>Aucune candidature</Text>
          )}
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
  },
  welcome: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  role: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
}));