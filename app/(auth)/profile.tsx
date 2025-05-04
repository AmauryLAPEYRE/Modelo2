// app/(auth)/profile.tsx
import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { getAuth, updateProfile } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Button, Card } from '../../src/components/ui';
import { User } from '../../src/domain/models/UserModel';
import { getDocument, updateDocument } from '../../src/services/firebase/firestore';
import { uploadFile } from '../../src/services/firebase/storage';
import { createThemedStyles, useTheme } from '../../src/utils/theme';
import { useAuthViewModel } from '../../src/viewModels/useAuthViewModel';

export default function ProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useStyles();
  const { currentUser, logout, setCurrentUser } = useAuthViewModel();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);
  
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.replace('/(public)/login');
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la déconnexion.');
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  const handleChangePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission refusée',
        'Nous avons besoin des permissions pour accéder à votre galerie.'
      );
      return;
    }
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets[0]) {
        setIsUpdatingPhoto(true);
        
        // Convertir l'URI en blob
        const response = await fetch(result.assets[0].uri);
        const blob = await response.blob();
        
        // Uploader l'image
        const photoPath = `avatars/${currentUser?.id}_${Date.now()}.jpg`;
        const photoURL = await uploadFile(photoPath, blob);
        
        // Mettre à jour le profil Firebase Auth
        const auth = getAuth();
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, { photoURL });
        }
        
        // Mettre à jour le document utilisateur
        if (currentUser?.id) {
          await updateDocument<User>('users', currentUser.id, { photoURL });
          
          // Récupérer les données mises à jour
          const updatedUser = await getDocument<User>('users', currentUser.id);
          if (updatedUser) {
            setCurrentUser(auth.currentUser);
          }
        }
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la mise à jour de la photo.');
      console.error('Error updating photo:', error);
    } finally {
      setIsUpdatingPhoto(false);
    }
  };
  
  if (!currentUser) {
    return null;
  }
  
  const getRoleLabel = (role: string): string => {
    switch (role) {
      case 'model':
        return 'Modèle';
      case 'professional':
        return 'Professionnel';
      default:
        return role;
    }
  };
  
  const getSpecialtyLabel = (specialty: string): string => {
    switch (specialty) {
      case 'hairdresser':
        return 'Coiffeur';
      case 'makeup_artist':
        return 'Maquilleur';
      case 'photographer':
        return 'Photographe';
      default:
        return specialty;
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      {/* Photo de profil et informations principales */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleChangePhoto} style={styles.avatarContainer}>
          {currentUser.photoURL ? (
            <Image source={{ uri: currentUser.photoURL }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <FontAwesome name="user" size={48} color={theme.colors.primary} />
            </View>
          )}
          {isUpdatingPhoto && (
            <View style={styles.avatarOverlay}>
              <ActivityIndicator size="small" color="white" />
            </View>
          )}
          <View style={styles.editIcon}>
            <FontAwesome name="pencil" size={14} color="white" />
          </View>
        </TouchableOpacity>
        
        <Text style={styles.name}>{currentUser.displayName}</Text>
        <Text style={styles.role}>{getRoleLabel(currentUser.role)}</Text>
        {currentUser.email && <Text style={styles.email}>{currentUser.email}</Text>}
      </View>
      
      {/* Statistiques rapides pour les professionnels */}
      {currentUser.role === 'professional' && (
        <View style={styles.quickStats}>
          <TouchableOpacity 
            style={styles.statButton}
            onPress={() => router.push('/(auth)/services')}
          >
            <FontAwesome name="briefcase" size={24} color={theme.colors.primary} />
            <Text style={styles.statTitle}>Prestations</Text>
            <Text style={styles.statValue}>0</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.statButton}
            onPress={() => router.push('/(auth)/applications')}
          >
            <FontAwesome name="users" size={24} color={theme.colors.primary} />
            <Text style={styles.statTitle}>Candidatures</Text>
            <Text style={styles.statValue}>0</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Informations détaillées */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations</Text>
        
        <Card padding="md" style={styles.infoCard}>
          {currentUser.phone && (
            <View style={styles.infoItem}>
              <FontAwesome name="phone" size={18} color={theme.colors.textSecondary} />
              <Text style={styles.infoText}>{currentUser.phone}</Text>
            </View>
          )}
          
          {currentUser.role === 'professional' && currentUser.website && (
            <View style={styles.infoItem}>
              <FontAwesome name="globe" size={18} color={theme.colors.textSecondary} />
              <Text style={styles.infoText}>{currentUser.website}</Text>
            </View>
          )}
          
          {currentUser.role === 'professional' && currentUser.instagram && (
            <View style={styles.infoItem}>
              <FontAwesome name="instagram" size={18} color={theme.colors.textSecondary} />
              <Text style={styles.infoText}>@{currentUser.instagram}</Text>
            </View>
          )}
          
          {currentUser.location?.address && (
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={18} color={theme.colors.textSecondary} />
              <Text style={styles.infoText}>{currentUser.location.address}</Text>
            </View>
          )}
        </Card>
      </View>
      
      {/* Bio */}
      {currentUser.bio && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>
          <Card padding="md" style={styles.bioCard}>
            <Text style={styles.bioText}>{currentUser.bio}</Text>
          </Card>
        </View>
      )}
      
      {/* Détails spécifiques au rôle */}
      {currentUser.role === 'model' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails modèle</Text>
          <Card padding="md" style={styles.detailsCard}>
            {currentUser.height && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Taille</Text>
                <Text style={styles.detailValue}>{currentUser.height} cm</Text>
              </View>
            )}
            
            {currentUser.hairColor && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Couleur de cheveux</Text>
                <Text style={styles.detailValue}>{currentUser.hairColor}</Text>
              </View>
            )}
            
            {currentUser.eyeColor && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Couleur des yeux</Text>
                <Text style={styles.detailValue}>{currentUser.eyeColor}</Text>
              </View>
            )}
            
            {currentUser.experience && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Expérience</Text>
                <Text style={styles.detailValue}>{currentUser.experience}</Text>
              </View>
            )}
          </Card>
        </View>
      )}
      
      {currentUser.role === 'professional' && currentUser.profession && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails professionnel</Text>
          <Card padding="md" style={styles.detailsCard}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Profession</Text>
              <Text style={styles.detailValue}>
                {getSpecialtyLabel(currentUser.profession)}
              </Text>
            </View>
            
            {currentUser.specialties && currentUser.specialties.length > 0 && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Spécialités</Text>
                <Text style={styles.detailValue}>
                  {currentUser.specialties.map(s => getSpecialtyLabel(s)).join(', ')}
                </Text>
              </View>
            )}
            
            {currentUser.studio && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Studio</Text>
                <Text style={styles.detailValue}>
                  {currentUser.studioAddress || 'Oui'}
                </Text>
              </View>
            )}
          </Card>
        </View>
      )}
      
      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Modifier le profil"
          onPress={() => router.push('/(auth)/edit-profile')}
          variant="outline"
          fullWidth
          size="lg"
          icon={<FontAwesome name="edit" size={16} color={theme.colors.primary} />}
        />
        
        <Button
          title="Paramètres"
          onPress={() => router.push('/(auth)/settings')}
          variant="outline"
          fullWidth
          size="lg"
          style={styles.settingsButton}
          icon={<Ionicons name="settings-outline" size={16} color={theme.colors.primary} />}
        />
        
        <Button
          title="Se déconnecter"
          onPress={handleLogout}
          loading={isLoggingOut}
          variant="ghost"
          fullWidth
          size="lg"
          style={styles.logoutButton}
          icon={<MaterialIcons name="logout" size={16} color={theme.colors.error} />}
          buttonStyle={{ backgroundColor: theme.colors.error + '15' }}
          textStyle={{ color: theme.colors.error }}
        />
      </View>
    </ScrollView>
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
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarOverlay: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  name: {
    fontSize: theme.typography.fontSizes['2xl'],
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  role: {
    fontSize: theme.typography.fontSizes.lg,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  email: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  quickStats: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  statButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  statTitle: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  statValue: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  section: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  infoCard: {
    marginBottom: theme.spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  infoText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
  },
  bioCard: {
    marginBottom: theme.spacing.md,
  },
  bioText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
    lineHeight: 22,
  },
  detailsCard: {
    marginBottom: theme.spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  detailLabel: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textSecondary,
  },
  detailValue: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeights.medium,
  },
  actions: {
    padding: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  settingsButton: {
    marginTop: theme.spacing.sm,
  },
  logoutButton: {
    marginTop: theme.spacing.xl,
  },
}));