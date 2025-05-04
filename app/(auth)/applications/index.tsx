// app/(auth)/applications/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';
import { ApplicationCard } from '../../../src/components/applications/ApplicationCard';
import { Button, Card } from '../../../src/components/ui';
import { ApplicationStatus } from '../../../src/domain/models/ApplicationModel';
import { createThemedStyles, useTheme } from '../../../src/utils/theme';
import { useApplicationViewModel } from '../../../src/viewModels/useApplicationViewModel';
import { useAuthViewModel } from '../../../src/viewModels/useAuthViewModel';

export default function ApplicationsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useStyles();
  const { applications, fetchApplications, isLoading } = useApplicationViewModel();
  const { currentUser } = useAuthViewModel();
  
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  
  useEffect(() => {
    loadApplications();
  }, [currentUser]);
  
  const loadApplications = async () => {
    if (!currentUser) return;
    
    try {
      if (currentUser.role === 'model') {
        await fetchApplications({ modelId: currentUser.id });
      } else if (currentUser.role === 'professional') {
        // Pour les professionnels, récupérer les candidatures pour leurs services
        await fetchApplications(); // On devrait filtrer par professionalId dans la vue modèle
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadApplications();
    } finally {
      setRefreshing(false);
    }
  };
  
  const filteredApplications = applications.filter(application => {
    const matchesStatus = statusFilter === 'all' || application.status === statusFilter;
    return matchesStatus;
  });
  
  const getHeaderTitle = (): string => {
    if (!currentUser) return 'Candidatures';
    
    return currentUser.role === 'model' 
      ? 'Mes candidatures' 
      : 'Candidatures reçues';
  };
  
  const getEmptyStateText = (): string => {
    if (!currentUser) return 'Aucune candidature.';
    
    return currentUser.role === 'model'
      ? 'Vous n\'avez encore postulé à aucune prestation.'
      : 'Vous n\'avez encore reçu aucune candidature.';
  };
  
  if (!currentUser) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      {/* En-tête avec titre et filtre */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
        
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Statut</Text>
          <Card variant="outlined" padding="none" style={styles.filterCard}>
            <Picker
              selectedValue={statusFilter}
              onValueChange={(itemValue) => setStatusFilter(itemValue)}
              style={styles.filterPicker}
            >
              <Picker.Item label="Tous" value="all" />
              <Picker.Item label="En attente" value="pending" />
              <Picker.Item label="Acceptées" value="accepted" />
              <Picker.Item label="Refusées" value="rejected" />
              <Picker.Item label="Annulées" value="cancelled" />
              <Picker.Item label="Terminées" value="completed" />
            </Picker>
          </Card>
        </View>
      </View>
      
      {/* Liste des candidatures */}
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {isLoading && !refreshing ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
        ) : filteredApplications.length > 0 ? (
          filteredApplications.map(application => (
            <ApplicationCard
              key={application.id}
              application={application}
              onPress={() => router.push(`/(auth)/applications/${application.id}`)}
              showService={true}
            />
          ))
        ) : (
          <Card padding="md" style={styles.emptyState}>
            <Ionicons
              name={currentUser.role === 'model' ? "search-outline" : "mail-outline"}
              size={48}
              color={theme.colors.textSecondary}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyStateText}>
              {getEmptyStateText()}
            </Text>
            {currentUser.role === 'model' && (
              <Button
                title="Explorer les prestations"
                onPress={() => router.push('/(auth)/services')}
                variant="outline"
                size="sm"
                style={styles.emptyStateButton}
              />
            )}
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const useStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  filterSection: {
    marginTop: theme.spacing.sm,
  },
  filterLabel: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  filterCard: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  filterPicker: {
    height: 40,
    width: '100%',
  },
  contentContainer: {
    padding: theme.spacing.md,
  },
  loader: {
    marginTop: theme.spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    marginTop: theme.spacing.lg,
  },
  emptyIcon: {
    marginBottom: theme.spacing.sm,
  },
  emptyStateText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  emptyStateButton: {
    marginTop: theme.spacing.sm,
  },
}));