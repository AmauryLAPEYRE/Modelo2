// app/(auth)/services/index.tsx
import React, { useState } from 'react';
import { View, ScrollView, SafeAreaView, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useServices } from '../../../src/hooks/useServices';
import { ServiceCard } from '../../../src/components/services/ServiceCard';
import { createThemedStyles, useTheme } from '../../../src/theme';
import { Button } from '../../../src/components/ui/Button';
import { useAuth } from '../../../src/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';

export default function ServicesListScreen() {
  const { services, loading } = useServices();
  const { user } = useAuth();
  const theme = useTheme();
  const styles = useStyles();
  const [filter, setFilter] = useState<'all' | 'free' | 'tfp' | 'paid'>('all');

  // Filtrer d'abord les services de l'utilisateur connecté
  const userServices = services.filter(service => {
    if (user?.role === 'professional') {
      return service.professionalId === user.id;
    }
    return true; // Pour les modèles, afficher tous les services publiés
  });

  // Appliquer ensuite le filtre par type de compensation
  const filteredServices = userServices.filter(service => {
    if (filter === 'all') return true;
    return service.compensation.type === filter;
  });

  const getFilterTabs = () => {
    const tabs = [
      { id: 'all', label: 'Tous', count: userServices.length },
      { id: 'free', label: 'Gratuit', count: userServices.filter(s => s.compensation.type === 'free').length },
      { id: 'tfp', label: 'TFP', count: userServices.filter(s => s.compensation.type === 'tfp').length },
      { id: 'paid', label: 'Payant', count: userServices.filter(s => s.compensation.type === 'paid').length },
    ];
    return tabs;
  };

  const getTitleAndSubtitle = () => {
    if (user?.role === 'professional') {
      return {
        title: 'Mes services',
        subtitle: `${filteredServices.length} service${filteredServices.length !== 1 ? 's' : ''} créé${filteredServices.length !== 1 ? 's' : ''}`
      };
    } else {
      return {
        title: 'Services disponibles', 
        subtitle: `${filteredServices.length} service${filteredServices.length !== 1 ? 's' : ''}`
      };
    }
  };

  const { title, subtitle } = getTitleAndSubtitle();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header personnalisé avec bouton retour */}
      <View style={styles.customHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        {user?.role === 'professional' && (
          <Button
            title=""
            onPress={() => router.push('/(auth)/services/create')}
            variant="primary"
            icon="add"
          />
        )}
      </View>

      <View style={styles.filterSection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.filterScroll}
        >
          {getFilterTabs().map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.filterTab,
                filter === tab.id && styles.filterTabActive
              ]}
              onPress={() => setFilter(tab.id as typeof filter)}
            >
              <Text style={[
                styles.filterLabel,
                filter === tab.id && styles.filterLabelActive
              ]}>
                {tab.label}
              </Text>
              {tab.count > 0 && (
                <View style={[
                  styles.filterBadge,
                  filter === tab.id && styles.filterBadgeActive
                ]}>
                  <Text style={[
                    styles.filterBadgeText,
                    filter === tab.id && styles.filterBadgeTextActive
                  ]}>
                    {tab.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loading}>
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        ) : filteredServices.length > 0 ? (
          filteredServices.map(service => (
            <ServiceCard
              key={service.id}
              service={service}
              onPress={() => router.push(`/(auth)/services/${service.id}`)}
              showProfessionalInfo={user?.role === 'model'}
            />
          ))
        ) : (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="calendar" size={64} color={theme.colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>
              {user?.role === 'professional' 
                ? 'Aucun service créé' 
                : 'Aucun service disponible'}
            </Text>
            <Text style={styles.emptyText}>
              {user?.role === 'professional' 
                ? 'Créez votre premier service pour commencer.'
                : 'Revenez plus tard pour voir les nouveaux services.'}
            </Text>
            {user?.role === 'professional' && (
              <Button
                title="Créer un service"
                onPress={() => router.push('/(auth)/services/create')}
                variant="primary"
                icon="add"
                style={styles.emptyButton}
              />
            )}
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
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xs,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  titleContainer: {
    flex: 1,
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
  filterSection: {
    paddingVertical: theme.spacing.sm,
  },
  filterScroll: {
    paddingHorizontal: theme.spacing.lg,
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
    backgroundColor: theme.colors.border,
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
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
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
    marginBottom: theme.spacing.lg,
  },
  emptyButton: {
    marginTop: theme.spacing.md,
  },
}));