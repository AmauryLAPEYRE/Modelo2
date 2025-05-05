// app/(auth)/applications/index.tsx
import React from 'react';
import { View, ScrollView, SafeAreaView, Text } from 'react-native';
import { router } from 'expo-router';
import { useApplications } from '../../../src/hooks/useApplications';
import { useAuth } from '../../../src/hooks/useAuth';
import { ApplicationCard } from '../../../src/components/applications/ApplicationCard';
import { createStyles, theme } from '../../../src/theme';

export default function ApplicationsListScreen() {
  const { user } = useAuth();
  const { applications, loading } = useApplications(user?.id, user?.role);
  const styles = useStyles();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>
            {user?.role === 'model' ? 'Mes candidatures' : 'Candidatures reçues'}
          </Text>
        </View>

        {loading ? (
          <Text style={styles.loadingText}>Chargement...</Text>
        ) : applications.length > 0 ? (
          applications.map(application => (
            <ApplicationCard
              key={application.id}
              application={application}
              onPress={() => router.push(`/(auth)/applications/${application.id}`)}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>Aucune candidature</Text>
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