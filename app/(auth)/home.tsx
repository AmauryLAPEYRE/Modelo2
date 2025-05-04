// app/(auth)/home.tsx
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ApplicationCard } from '../../src/components/applications/ApplicationCard';
import { ServiceCard } from '../../src/components/services/ServiceCard';
import { Button, Card } from '../../src/components/ui';
import { ApplicationModel } from '../../src/domain/models/ApplicationModel';
import { ServiceModel } from '../../src/domain/models/ServiceModel';
import { createThemedStyles } from '../../src/utils/theme';
import { useApplicationViewModel } from '../../src/viewModels/useApplicationViewModel';
import { useServiceViewModel } from '../../src/viewModels/useServiceViewModel';

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useStyles();
  const { currentUser } = useAuthViewModel();
  const { fetchServices, services, isLoading: servicesLoading } = useServiceViewModel();
  const { fetchApplications, applications, isLoading: applicationsLoading } = useApplicationViewModel();
  
  const [recentServices, setRecentServices] = useState<ServiceModel[]>([]);
  const [userApplications, setUserApplications] = useState<ApplicationModel[]>([]);
  
  // Récupérer les données selon le rôle de l'utilisateur
  useEffect(() => {
    if (!currentUser) return;
    
    const loadData = async () => {
      try {
        // Récupérer les prestations récentes
        const latestServices = await fetchServices({
          status: 'published',
          // Limiter à 5 services les plus récents
        });
        setRecentServices(latestServices.slice(0, 5));
        
        // Récupérer les candidatures de l'utilisateur selon son rôle
        if (currentUser.role === 'model') {
          const modelApplications = await fetchApplications({
            modelId: currentUser.id,
          });
          setUserApplications(modelApplications.slice(0, 5));
        } else if (currentUser.role === 'professional') {
          const servicesIds = latestServices
            .filter(s => s.professionalId === currentUser.id)
            .map(s => s.id);
            
          if (servicesIds.length > 0) {
            const receivedApplications = await Promise.all(
              servicesIds.map(serviceId => 
                fetchApplications({ serviceId })
              )
            );
            
            // Aplatir et limiter le tableau
            const flatApplications = receivedApplications
              .flat()
              .sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              )
              .slice(0, 5);
              
            setUserApplications(flatApplications);
          }
        }
      } catch (error) {
        console.error('Error loading home data:', error);
      }
    };
    
    loadData();
  }, [currentUser]);
  
  if (!currentUser) {
    return null;
  }
  
  const isLoading = servicesLoading || applicationsLoading;
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* En-tête de bienvenue */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Bonjour, <Text style={styles.userName}>{currentUser.displayName}</Text>
        </Text>
        <Text style={styles.roleText}>
          {currentUser.role === 'model' ? 'Modèle' : 'Professionnel'}
        </Text>
      </View>
      
      {/* Principales actions en fonction du rôle */}
      <View style={styles.actionsContainer}>
        {currentUser.role === 'professional' ? (
          <Button
            title="Créer une nouvelle prestation"
            icon={<FontAwesome5 name="plus-circle" size={16} color="white" style={{ marginRight: 8 }} />}
            onPress={() => router.push('/(auth)/services/create')}
            size="lg"
            fullWidth
          />
        ) : (
          <Button
            title="Explorer les prestations"
            icon={<FontAwesome5 name="search" size={16} color="white" style={{ marginRight: 8 }} />}
            onPress={() => router.push('/(auth)/services')}
            size="lg"
            fullWidth
          />
        )}
      </View>
      
      {/* Prestations récentes */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Prestations récentes</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/services')}>
            <Text style={styles.seeAllText}>Voir tout</Text>
          </TouchableOpacity>
        </View>
        
        {isLoading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : recentServices.length > 0 ? (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.servicesContainer}
          >
            {recentServices.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                onPress={() => router.push(`/(auth)/services/${service.id}`)}
                compact
              />
            ))}
          </ScrollView>
        ) : (
          <Card padding="md" style={styles.emptyStateCard}>
            <Text style={styles.emptyStateText}>
              Aucune prestation disponible pour le moment.
            </Text>
          </Card>
        )}
      </View>
      
      {/* Candidatures récentes */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {currentUser.role === 'model' ? 'Vos candidatures récentes' : 'Candidatures reçues récentes'}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/applications')}>
            <Text style={styles.seeAllText}>Voir tout</Text>
          </TouchableOpacity>
        </View>
        
        {isLoading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : userApplications.length > 0 ? (
          <View style={styles.applicationsContainer}>
            {userApplications.map(application => (
              <ApplicationCard
                key={application.id}
                application={application}
                onPress={() => router.push(`/(auth)/applications/${application.id}`)}
              />
            ))}
          </View>
        ) : (
          <Card padding="md" style={styles.emptyStateCard}>
            <Text style={styles.emptyStateText}>
              {currentUser.role === 'model' 
                ? 'Vous n\'avez encore postulé à aucune prestation.' 
                : 'Vous n\'avez encore reçu aucune candidature.'}
            </Text>
            {currentUser.role === 'model' && (
              <Button
                title="Explorer les prestations"
                onPress={() => router.push('/(auth)/services')}
                variant="outline"
                size="sm"
                style={{ marginTop: 12 }}
              />
            )}
          </Card>
        )}
      </View>
    </ScrollView>
  );
}

const useStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: theme.spacing.md,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  welcomeText: {
    fontSize: theme.typography.fontSizes.xl,
    color: theme.colors.text,
  },
  userName: {
    fontWeight: theme.typography.fontWeights.bold,
  },
  roleText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  actionsContainer: {
    marginBottom: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
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
  seeAllText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.medium,
  },
  servicesContainer: {
    paddingBottom: theme.spacing.sm,
  },
  applicationsContainer: {
    gap: theme.spacing.md,
  },
  emptyStateCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyStateText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontSize: theme.typography.fontSizes.md,
  },
}));