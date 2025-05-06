// app/(auth)/profile.tsx
// Mise à jour pour afficher le type de professionnel
import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { useServices } from '../../src/hooks/useServices';
import { useApplications } from '../../src/hooks/useApplications';
import { Button } from '../../src/components/ui/Button';
import { createThemedStyles, useTheme } from '../../src/theme';
import { Ionicons } from '@expo/vector-icons';

// Fonction pour formater le type de professionnel
const formatProfessionalType = (type?: string): string => {
  if (!type) return '';
  
  // Première lettre en majuscule
  return type.charAt(0).toUpperCase() + type.slice(1);
};

// Fonction pour obtenir l'icône correspondant au type de professionnel
const getProfessionalTypeIcon = (type?: string): keyof typeof Ionicons.glyphMap => {
  if (!type) return 'briefcase';
  
  switch (type) {
    case 'coiffeur':
      return 'cut';
    case 'maquilleur':
      return 'color-palette';
    case 'photographe':
      return 'camera';
    case 'estheticienne':
      return 'flower';
    default:
      return 'briefcase';
  }
};

// Le reste du code reste le même, mais nous ajoutons l'affichage du type de professionnel

interface ProfileStats {
  userServices: number;
  userRating: number | null;
  userRatingCount: number;
  userApplications: number;
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { services, loading: servicesLoading } = useServices();
  const { applications, loading: applicationsLoading } = useApplications(user?.id, user?.role);
  const theme = useTheme();
  const styles = useStyles();
  const [profileStats, setProfileStats] = useState<ProfileStats>({
    userServices: 0,
    userRating: null,
    userRatingCount: 0,
    userApplications: 0,
  });

  useEffect(() => {
    if (!servicesLoading && !applicationsLoading && user) {
      // Filtrer les services de l'utilisateur
      const userServices = services.filter(service => 
        (user.role === 'professional' && service.professionalId === user.id)
      ).length;

      // Compter les candidatures
      let userApplications = 0;
      if (user.role === 'model') {
        userApplications = applications.length;
      } else if (user.role === 'professional') {
        // Pour les pros, on compte uniquement les candidatures en attente
        userApplications = applications.filter(app => app.status === 'pending').length;
      }

      // TODO: Récupérer les vraies notes depuis Firebase
      // Pour l'instant, pas de note car le système n'est pas implémenté
      setProfileStats({
        userServices,
        userRating: null,
        userRatingCount: 0,
        userApplications,
      });
    }
  }, [services, applications, user, servicesLoading, applicationsLoading]);

  const handleLogout = async () => {
    await logout();
    router.replace('/(public)/login');
  };

  const profileOptions = [
    {
      id: 'settings',
      icon: 'settings',
      label: 'Paramètres du compte',
      onPress: () => router.push('/(auth)/settings'),
    },
    {
      id: 'notifications',
      icon: 'notifications',
      label: 'Notifications',
      onPress: () => {}, // À implémenter
    },
    {
      id: 'help',
      icon: 'help-circle',
      label: 'Aide & Support',
      onPress: () => {}, // À implémenter
    },
    {
      id: 'about',
      icon: 'information-circle',
      label: 'À propos',
      onPress: () => {}, // À implémenter
    },
  ];

  // Dynamiser l'affichage des statistiques selon le rôle
  const getStatsConfig = () => {
    const baseStats = user?.role === 'model' ? [
      {
        label: 'Services effectués',
        value: profileStats.userServices.toString(),
      },
      {
        label: 'Note',
        value: profileStats.userRating !== null 
          ? profileStats.userRating.toFixed(1)
          : '—',
        subtitle: profileStats.userRating !== null 
          ? `${profileStats.userRatingCount} avis`
          : 'Aucune évaluation'
      },
      {
        label: 'Candidatures',
        value: profileStats.userApplications.toString(),
      },
    ] : [
      {
        label: 'Services créés',
        value: profileStats.userServices.toString(),
      },
      {
        label: 'Note',
        value: profileStats.userRating !== null 
          ? profileStats.userRating.toFixed(1)
          : '—',
        subtitle: profileStats.userRating !== null 
          ? `${profileStats.userRatingCount} avis`
          : 'Aucune évaluation'
      },
      {
        label: 'En attente',
        value: profileStats.userApplications.toString(),
      },
    ];

    return baseStats;
  };

  const statsConfig = getStatsConfig();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={48} color={theme.colors.primary} />
            </View>
            <View style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </View>
          
          <Text style={styles.name}>{user?.name || 'Utilisateur'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
          
          <View style={styles.roleContainer}>
            <View style={styles.roleBadge}>
              <Ionicons 
                name={user?.role === 'model' ? 'person' : 'briefcase'} 
                size={16} 
                color={theme.colors.primary} 
              />
              <Text style={styles.roleText}>
                {user?.role === 'model' ? 'Modèle' : 'Professionnel'}
              </Text>
            </View>
            
            {/* Afficher le type de professionnel si l'utilisateur est un professionnel */}
            {user?.role === 'professional' && user?.professionalType && (
              <View style={styles.professionalTypeBadge}>
                <Ionicons 
                  name={getProfessionalTypeIcon(user.professionalType)} 
                  size={16} 
                  color="#fff" 
                />
                <Text style={styles.professionalTypeText}>
                  {formatProfessionalType(user.professionalType)}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.stats}>
          {statsConfig.map((stat, index) => (
            <React.Fragment key={stat.label}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
                {stat.subtitle && (
                  <Text style={styles.statSubtitle}>{stat.subtitle}</Text>
                )}
              </View>
              {index < statsConfig.length - 1 && <View style={styles.statDivider} />}
            </React.Fragment>
          ))}
        </View>

        <View style={styles.options}>
          {profileOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionItem}
              onPress={option.onPress}
            >
              <View style={styles.optionLeft}>
                <Ionicons 
                  name={option.icon as keyof typeof Ionicons.glyphMap} 
                  size={24} 
                  color={theme.colors.primary} 
                />
                <Text style={styles.optionLabel}>{option.label}</Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={theme.colors.textSecondary} 
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Button
            title="Se déconnecter"
            onPress={handleLogout}
            variant="danger"
            fullWidth
          />
          
          <Text style={styles.version}>
            Version 1.0.0
          </Text>
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
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  name: {
    fontSize: theme.typography.fontSizes['2xl'],
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  email: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  roleText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
  },
  professionalTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  professionalTypeText: {
    color: '#fff',
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.typography.fontSizes['2xl'],
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  statSubtitle: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.border,
  },
  options: {
    padding: theme.spacing.lg,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  optionLabel: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeights.medium,
  },
  footer: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  version: {
    textAlign: 'center',
    color: theme.colors.textTertiary,
    fontSize: theme.typography.fontSizes.sm,
  },
}));