// app/(auth)/home.tsx
import React from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { useServices } from '../../src/hooks/useServices';
import { useApplications } from '../../src/hooks/useApplications';
import { ServiceCard } from '../../src/components/services/ServiceCard';
import { ApplicationCard } from '../../src/components/applications/ApplicationCard';
import { createThemedStyles, useTheme } from '../../src/theme';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const { user } = useAuth();
  const { services, loading: servicesLoading } = useServices();
  const { applications, loading: applicationsLoading } = useApplications(user?.id, user?.role);
  const theme = useTheme();
  const styles = useStyles();

  const recentServices = services.slice(0, 5);
  const recentApplications = applications.slice(0, 5);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.welcome}>
            <Text style={styles.greeting}>Bonjour</Text>
            <Text style={styles.userName}>{user?.name}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>
                {user?.role === 'model' ? 'Modèle' : 'Professionnel'}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle-outline" size={32} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.stats}>
          <TouchableOpacity style={styles.statCard}>
            <Ionicons name="briefcase-outline" size={24} color={theme.colors.primary} />
            <Text style={styles.statNumber}>{services.length}</Text>
            <Text style={styles.statLabel}>Services actifs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCard}>
            <Ionicons name="person-outline" size={24} color={theme.colors.primary} />
            <Text style={styles.statNumber}>{applications.length}</Text>
            <Text style={styles.statLabel}>Candidatures</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Services populaires</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/services')}>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          
          {servicesLoading ? (
            <View style={styles.loading}>
              <Text style={styles.loadingText}>Chargement...</Text>
            </View>
          ) : recentServices.length > 0 ? (
            recentServices.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                onPress={() => router.push(`/(auth)/services/${service.id}`)}
              />
            ))
          ) : (
            <View style={styles.empty}>
              <Ionicons name="briefcase-outline" size={48} color={theme.colors.textSecondary} />
              <Text style={styles.emptyText}>Aucun service disponible</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {user?.role === 'model' ? 'Mes candidatures' : 'Candidatures reçues'}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/applications')}>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          
          {applicationsLoading ? (
            <View style={styles.loading}>
              <Text style={styles.loadingText}>Chargement...</Text>
            </View>
          ) : recentApplications.length > 0 ? (
            recentApplications.map(application => (
              <ApplicationCard
                key={application.id}
                application={application}
                onPress={() => router.push(`/(auth)/applications/${application.id}`)}
              />
            ))
          ) : (
            <View style={styles.empty}>
              <Ionicons name="document-text-outline" size={48} color={theme.colors.textSecondary} />
              <Text style={styles.emptyText}>Aucune candidature</Text>
            </View>
          )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    paddingBottom: 0,
  },
  welcome: {
    flex: 1,
  },
  greeting: {
    fontSize: theme.typography.fontSizes.lg,
    color: theme.colors.textSecondary,
  },
  userName: {
    fontSize: theme.typography.fontSizes['2xl'],
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  roleBadge: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    alignSelf: 'flex-start',
    marginTop: theme.spacing.sm,
  },
  roleText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
  },
  profileButton: {
    padding: theme.spacing.sm,
  },
  stats: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statNumber: {
    fontSize: theme.typography.fontSizes['2xl'],
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.text,
  },
  seeAll: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
  },
  loading: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  loadingText: {
    color: theme.colors.textSecondary,
  },
  empty: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
}));