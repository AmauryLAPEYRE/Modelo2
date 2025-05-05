// app/(auth)/applications/index.tsx
import React, { useState } from 'react';
import { View, ScrollView, SafeAreaView, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useApplications } from '../../../src/hooks/useApplications';
import { useAuth } from '../../../src/hooks/useAuth';
import { ApplicationCard } from '../../../src/components/applications/ApplicationCard';
import { createThemedStyles, useTheme } from '../../../src/theme';
import { Ionicons } from '@expo/vector-icons';

type FilterType = 'all' | 'pending' | 'accepted' | 'rejected';

export default function ApplicationsListScreen() {
  const { user } = useAuth();
  const { applications, loading } = useApplications(user?.id, user?.role);
  const theme = useTheme();
  const styles = useStyles();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const getFilterTabs = () => {
    const tabs = [
      { id: 'all', label: 'Toutes', count: applications.length },
      { id: 'pending', label: 'En attente', count: applications.filter(a => a.status === 'pending').length },
      { id: 'accepted', label: 'Acceptées', count: applications.filter(a => a.status === 'accepted').length },
      { id: 'rejected', label: 'Refusées', count: applications.filter(a => a.status === 'rejected').length },
    ] as { id: FilterType; label: string; count: number }[];
    return tabs;
  };

  const filteredApplications = applications.filter(app => {
    if (activeFilter === 'all') return true;
    return app.status === activeFilter;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {user?.role === 'model' ? 'Mes candidatures' : 'Candidatures reçues'}
        </Text>
        <Text style={styles.subtitle}>
          {filteredApplications.length} candidature{filteredApplications.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {getFilterTabs().map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.filterTab,
              activeFilter === tab.id && styles.filterTabActive
            ]}
            onPress={() => setActiveFilter(tab.id)}
          >
            <Text style={[
              styles.filterLabel,
              activeFilter === tab.id && styles.filterLabelActive
            ]}>
              {tab.label}
            </Text>
            {tab.count > 0 && (
              <View style={[
                styles.filterBadge,
                activeFilter === tab.id && styles.filterBadgeActive
              ]}>
                <Text style={[
                  styles.filterBadgeText,
                  activeFilter === tab.id && styles.filterBadgeTextActive
                ]}>
                  {tab.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView 
        style={styles.listContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {loading ? (
          <View style={styles.loading}>
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        ) : filteredApplications.length > 0 ? (
          filteredApplications.map(application => (
            <ApplicationCard
              key={application.id}
              application={application}
              onPress={() => router.push(`/(auth)/applications/${application.id}`)}
              showServiceInfo={true}
            />
          ))
        ) : (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="document-text" size={64} color={theme.colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Aucune candidature</Text>
            <Text style={styles.emptyText}>
              {user?.role === 'model' 
                ? 'Vous n\'avez pas encore postulé à des services.'
                : 'Aucune candidature reçue pour vos services.'}
            </Text>
          </View>
        )}
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
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.fontSizes['2xl'],
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  filterContainer: {
    paddingVertical: theme.spacing.sm,
    maxHeight: 50,
  },
  filterContent: {
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    marginRight: theme.spacing.sm,
    minHeight: 36,
  },
  filterTabActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterLabel: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
  },
  filterLabelActive: {
    color: 'white',
  },
  filterBadge: {
    marginLeft: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.full,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: 'white',
  },
  filterBadgeText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  filterBadgeTextActive: {
    color: theme.colors.primary,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  loading: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.textSecondary,
  },
  empty: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    paddingTop: theme.spacing['3xl'],
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: theme.borderRadius.full,
    backgroundColor: `${theme.colors.primary}1A`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  emptyText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeights.relaxed,
  },
}));