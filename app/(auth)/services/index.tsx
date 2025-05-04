// app/(auth)/services/index.tsx
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { ServiceCard } from '../../../src/components/services/ServiceCard';
import { Button, Card } from '../../../src/components/ui';
import { ServiceStatus, ServiceType } from '../../../src/domain/models/ServiceModel';
import { createThemedStyles, useTheme } from '../../../src/utils/theme';
import { useAuthViewModel } from '../../../src/viewModels/useAuthViewModel';
import { useServiceViewModel } from '../../../src/viewModels/useServiceViewModel';

export default function ServicesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useStyles();
  const { services, fetchServices, isLoading } = useServiceViewModel();
  const { currentUser } = useAuthViewModel();
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<ServiceType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ServiceStatus | 'all'>('all');
  
  // Récupérer les services au chargement
  useEffect(() => {
    fetchServices();
  }, []);
  
  // Filtrer les services selon les critères
  const filteredServices = services.filter(service => {
    const matchesSearch = searchText
      ? service.title.toLowerCase().includes(searchText.toLowerCase()) ||
        service.description.toLowerCase().includes(searchText.toLowerCase())
      : true;
      
    const matchesType = typeFilter === 'all' || service.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });
  
  // Rafraîchir les services
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchServices();
    } finally {
      setRefreshing(false);
    }
  };
  
  return (
    <View style={styles.container}>
      {/* En-tête avec barre de recherche */}
      <View style={styles.header}>
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Rechercher une prestation..."
              style={styles.searchInput}
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
          
          {currentUser?.role === 'professional' && (
            <Button
              title="Créer"
              onPress={() => router.push('/(auth)/services/create')}
              size="sm"
              icon={<FontAwesome name="plus" size={14} color="white" />}
              style={styles.createButton}
            />
          )}
        </View>
        
        {/* Filtres */}
        <View style={styles.filtersSection}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Type</Text>
            <Card variant="outlined" padding="none" style={styles.filterCard}>
              <Picker
                selectedValue={typeFilter}
                onValueChange={(itemValue) => setTypeFilter(itemValue)}
                style={styles.filterPicker}
              >
                <Picker.Item label="Tous" value="all" />
                <Picker.Item label="Coiffure" value="haircut" />
                <Picker.Item label="Coloration" value="coloring" />
                <Picker.Item label="Maquillage" value="makeup" />
                <Picker.Item label="Séance photo" value="photoshoot" />
                <Picker.Item label="Autre" value="other" />
              </Picker>
            </Card>
          </View>
          
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Statut</Text>
            <Card variant="outlined" padding="none" style={styles.filterCard}>
              <Picker
                selectedValue={statusFilter}
                onValueChange={(itemValue) => setStatusFilter(itemValue)}
                style={styles.filterPicker}
              >
                <Picker.Item label="Tous" value="all" />
                <Picker.Item label="Publiées" value="published" />
                <Picker.Item label="Brouillon" value="draft" />
                <Picker.Item label="Terminées" value="completed" />
                <Picker.Item label="Annulées" value="cancelled" />
              </Picker>
            </Card>
          </View>
        </View>
      </View>
      
      {/* Liste des services */}
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {isLoading && !refreshing ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
        ) : filteredServices.length > 0 ? (
          filteredServices.map(service => (
            <ServiceCard
              key={service.id}
              service={service}
              onPress={() => router.push(`/(auth)/services/${service.id}`)}
            />
          ))
        ) : (
          <Card padding="md" style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {searchText || typeFilter !== 'all' || statusFilter !== 'all'
                ? 'Aucune prestation ne correspond à vos critères.'
                : 'Aucune prestation disponible pour le moment.'}
            </Text>
            {currentUser?.role === 'professional' && (
              <Button
                title="Créer une prestation"
                onPress={() => router.push('/(auth)/services/create')}
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
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchIcon: {
    marginRight: theme.spacing.xs,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
  },
  createButton: {
    paddingHorizontal: theme.spacing.md,
  },
  filtersSection: {
    flexDirection: 'row',
    padding: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  filterGroup: {
    flex: 1,
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
  emptyStateText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  emptyStateButton: {
    marginTop: theme.spacing.sm,
  },
}));