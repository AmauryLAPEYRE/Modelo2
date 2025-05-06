// app/(auth)/profile/complete.tsx
import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { Button } from '../../../src/components/ui/Button';
import { Input } from '../../../src/components/ui/Input';
import { createThemedStyles, useTheme } from '../../../src/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../src/hooks/useAuth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../src/lib/firebase';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Gestionnaire d'étapes pour la complétion du profil modèle
enum ProfileStep {
  BasicInfo = 0,
  PhysicalTraits = 1,
  Photos = 2,
  Experience = 3,
  Location = 4,
  Availability = 5,
  SocialMedia = 6,
}

export default function CompleteProfileScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const styles = useStyles();
  const [currentStep, setCurrentStep] = useState<ProfileStep>(ProfileStep.BasicInfo);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Données du formulaire
  const [formData, setFormData] = useState({
    // Infos de base
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    
    // Caractéristiques physiques
    height: '',
    eyeColor: '',
    hairColor: '',
    
    // Photos
    photos: {
      face: '',
      profile: '',
      fullBody: '',
    },
    
    // Expérience
    experience: '',
    bio: '',
    
    // Localisation
    location: {
      city: '',
      radius: '10', // km par défaut
    },
    
    // Disponibilités
    availability: {
      weekdays: Array(7).fill(false),
      timeSlots: [] as string[],
      notes: '',
    },
    
    // Réseaux sociaux
    socialMedia: {
      instagram: '',
      facebook: '',
      tiktok: '',
      portfolio: '',
    },
    
    // Centres d'intérêt
    interests: [] as string[],
  });

  // Fonction pour télécharger une image
  const uploadImage = async (uri: string, path: string): Promise<string> => {
    if (!user) throw new Error('Utilisateur non connecté');
    
    const response = await fetch(uri);
    const blob = await response.blob();
    
    const storage = getStorage();
    const storageRef = ref(storage, `${path}_${Date.now()}`);
    
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  // Gestionnaire pour la sélection d'image
  const handleImagePick = async (type: 'face' | 'profile' | 'fullBody') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets[0]) {
        setLoading(true);
        
        try {
          const uploadPath = `models/${user?.id}/photos/${type}`;
          const downloadUrl = await uploadImage(result.assets[0].uri, uploadPath);
          
          setFormData(prev => ({
            ...prev,
            photos: {
              ...prev.photos,
              [type]: downloadUrl,
            }
          }));
        } catch (error) {
          Alert.alert('Erreur', 'Impossible de télécharger l\'image');
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'accéder à la bibliothèque de photos');
    }
  };

  // Sauvegarde des données du profil avec redirection améliorée
  const saveProfile = async () => {
    if (!user) {
      Alert.alert('Erreur', 'Vous devez être connecté pour compléter votre profil');
      return;
    }
    
    setLoading(true);
    
    try {
      // Construction sécurisée du profil
      const modelProfile = {
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        age: parseInt(formData.age) || 0,
        gender: formData.gender || 'homme',
        height: parseInt(formData.height) || 0,
        eyeColor: formData.eyeColor || '',
        hairColor: formData.hairColor || '',
        experience: formData.experience || '',
        photos: formData.photos || {},
        socialMedia: formData.socialMedia || {},
        availability: {
          weekdays: formData.availability?.weekdays || Array(7).fill(false),
          timeSlots: formData.availability?.timeSlots || [],
          notes: formData.availability?.notes || ''
        },
        location: {
          city: formData.location?.city || '',
          radius: parseInt(formData.location?.radius) || 10
        },
        interests: Array.isArray(formData.interests) ? formData.interests : []
      };
      
      // Mise à jour du profil dans Firestore
      await updateDoc(doc(db, 'users', user.id), {
        modelProfile,
        hasCompletedProfile: true
      });
      
      // Marquer que la sauvegarde a réussi
      setSaveSuccess(true);
      
      // Tentative de redirection avec setTimeout pour attendre que la mise à jour soit terminée
      setTimeout(() => {
        try {
          router.replace('/(auth)/home');
        } catch (e) {
          // En cas d'échec, utiliser une méthode alternative
          try {
            router.navigate('/(auth)/home');
          } catch {
            // Dernière solution: rediriger avec window.location
            window.location.href = '/';
          }
        }
      }, 500);
      
      // Afficher l'alerte de succès
      Alert.alert(
        'Profil complété',
        'Votre profil a été enregistré avec succès'
      );
    } catch (error) {
      let errorMessage = 'Une erreur est survenue lors de la sauvegarde de votre profil';
      
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }
      
      Alert.alert('Erreur', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Navigation entre les étapes
  const nextStep = () => {
    // Validation basique par étape
    if (currentStep === ProfileStep.BasicInfo) {
      if (!formData.firstName || !formData.lastName || !formData.age || !formData.gender) {
        Alert.alert('Champs manquants', 'Veuillez remplir tous les champs obligatoires');
        return;
      }
    } else if (currentStep === ProfileStep.PhysicalTraits) {
      if (!formData.height || !formData.eyeColor || !formData.hairColor) {
        Alert.alert('Champs manquants', 'Veuillez remplir tous les champs obligatoires');
        return;
      }
    } else if (currentStep === ProfileStep.Location) {
      if (!formData.location.city) {
        Alert.alert('Champs manquants', 'Veuillez indiquer votre ville');
        return;
      }
    }
    
    // Passer à l'étape suivante ou terminer
    if (currentStep < ProfileStep.SocialMedia) {
      setCurrentStep(prev => prev + 1);
    } else {
      saveProfile();
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Fonction de rendu de l'étape actuelle
  const renderStep = () => {
    switch (currentStep) {
      case ProfileStep.BasicInfo:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Informations de base</Text>
            
            <Input
              label="Prénom"
              value={formData.firstName}
              onChangeText={(text) => setFormData({...formData, firstName: text})}
              placeholder="Votre prénom"
              icon="person"
            />
            
            <Input
              label="Nom"
              value={formData.lastName}
              onChangeText={(text) => setFormData({...formData, lastName: text})}
              placeholder="Votre nom"
              icon="person"
            />
            
            <Input
              label="Âge"
              value={formData.age}
              onChangeText={(text) => setFormData({...formData, age: text})}
              placeholder="Votre âge"
              keyboardType="numeric"
              icon="calendar"
            />
            
            <View style={styles.genderContainer}>
              <Text style={styles.label}>Genre</Text>
              <View style={styles.genderOptions}>
                {[
                  { value: 'homme', label: 'Homme' },
                  { value: 'femme', label: 'Femme' },
                  { value: 'non-binaire', label: 'Non-binaire' }
                ].map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.genderOption,
                      formData.gender === option.value && styles.genderOptionSelected
                    ]}
                    onPress={() => setFormData({...formData, gender: option.value})}
                  >
                    <Text style={[
                      styles.genderOptionText,
                      formData.gender === option.value && styles.genderOptionTextSelected
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );
        
      case ProfileStep.PhysicalTraits:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Caractéristiques physiques</Text>
            
            <Input
              label="Taille (cm)"
              value={formData.height}
              onChangeText={(text) => setFormData({...formData, height: text})}
              placeholder="Votre taille en cm"
              keyboardType="numeric"
              icon="resize"
            />
            
            <Input
              label="Couleur des yeux"
              value={formData.eyeColor}
              onChangeText={(text) => setFormData({...formData, eyeColor: text})}
              placeholder="Ex: Bleus, Verts, Marrons..."
              icon="eye"
            />
            
            <Input
              label="Couleur des cheveux"
              value={formData.hairColor}
              onChangeText={(text) => setFormData({...formData, hairColor: text})}
              placeholder="Ex: Bruns, Blonds, Noirs..."
              icon="brush"
            />
          </View>
        );
        
      case ProfileStep.Photos:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Photos</Text>
            <Text style={styles.stepDescription}>
              Ajoutez des photos pour compléter votre profil. Ces photos seront utilisées par les professionnels 
              pour évaluer votre candidature.
            </Text>
            
            <View style={styles.photoSection}>
              <Text style={styles.photoTitle}>Photo de visage</Text>
              <TouchableOpacity 
                style={styles.photoUploadButton}
                onPress={() => handleImagePick('face')}
              >
                {formData.photos.face ? (
                  <View style={styles.photoPreviewContainer}>
                    <Image source={{ uri: formData.photos.face }} style={styles.photoPreview} />
                    <View style={styles.photoPreviewOverlay}>
                      <Text style={styles.photoPreviewText}>Changer</Text>
                    </View>
                  </View>
                ) : (
                  <>
                    <Ionicons name="camera" size={36} color={theme.colors.primary} />
                    <Text style={styles.photoUploadText}>Ajouter une photo</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            
            <View style={styles.photoSection}>
              <Text style={styles.photoTitle}>Photo de profil</Text>
              <TouchableOpacity 
                style={styles.photoUploadButton}
                onPress={() => handleImagePick('profile')}
              >
                {formData.photos.profile ? (
                  <View style={styles.photoPreviewContainer}>
                    <Image source={{ uri: formData.photos.profile }} style={styles.photoPreview} />
                    <View style={styles.photoPreviewOverlay}>
                      <Text style={styles.photoPreviewText}>Changer</Text>
                    </View>
                  </View>
                ) : (
                  <>
                    <Ionicons name="camera" size={36} color={theme.colors.primary} />
                    <Text style={styles.photoUploadText}>Ajouter une photo</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            
            <View style={styles.photoSection}>
              <Text style={styles.photoTitle}>Photo en pied</Text>
              <TouchableOpacity 
                style={styles.photoUploadButton}
                onPress={() => handleImagePick('fullBody')}
              >
                {formData.photos.fullBody ? (
                  <View style={styles.photoPreviewContainer}>
                    <Image source={{ uri: formData.photos.fullBody }} style={styles.photoPreview} />
                    <View style={styles.photoPreviewOverlay}>
                      <Text style={styles.photoPreviewText}>Changer</Text>
                    </View>
                  </View>
                ) : (
                  <>
                    <Ionicons name="camera" size={36} color={theme.colors.primary} />
                    <Text style={styles.photoUploadText}>Ajouter une photo</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        );
        
      case ProfileStep.Experience:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Expérience et présentation</Text>
            
            <Input
              label="Expérience"
              value={formData.experience}
              onChangeText={(text) => setFormData({...formData, experience: text})}
              placeholder="Décrivez votre expérience en tant que modèle"
              multiline
              numberOfLines={3}
              icon="document-text"
            />
            
            <Input
              label="Présentation personnelle"
              value={formData.bio}
              onChangeText={(text) => setFormData({...formData, bio: text})}
              placeholder="Parlez un peu de vous, vos motivations..."
              multiline
              numberOfLines={5}
              icon="person-circle"
            />
          </View>
        );
        
      case ProfileStep.Location:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Localisation</Text>
            
            <Input
              label="Ville"
              value={formData.location.city}
              onChangeText={(text) => setFormData({
                ...formData, 
                location: {...formData.location, city: text}
              })}
              placeholder="Votre ville"
              icon="location"
            />
            
            <Input
              label="Rayon de déplacement (km)"
              value={formData.location.radius}
              onChangeText={(text) => {
                // Vérifier que la valeur est un nombre
                const numValue = parseInt(text);
                if (!isNaN(numValue) || text === '') {
                  setFormData({
                    ...formData,
                    location: {...formData.location, radius: text}
                  });
                }
              }}
              placeholder="Ex: 10, 20, 50..."
              keyboardType="numeric"
              icon="compass"
            />
            
            <Text style={styles.infoText}>
              Ce rayon détermine la distance maximale dans laquelle vous êtes prêt(e) à vous déplacer pour des prestations.
            </Text>
          </View>
        );
        
      case ProfileStep.Availability:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Disponibilités</Text>
            
            <View style={styles.weekdaysContainer}>
              <Text style={styles.label}>Jours disponibles</Text>
              <View style={styles.weekdaysList}>
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.weekdayItem,
                      formData.availability.weekdays[index] && styles.weekdayItemSelected
                    ]}
                    onPress={() => {
                      const newWeekdays = [...formData.availability.weekdays];
                      newWeekdays[index] = !newWeekdays[index];
                      setFormData({
                        ...formData,
                        availability: {
                          ...formData.availability,
                          weekdays: newWeekdays
                        }
                      });
                    }}
                  >
                    <Text style={[
                      styles.weekdayText,
                      formData.availability.weekdays[index] && styles.weekdayTextSelected
                    ]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.timeSlotsContainer}>
              <Text style={styles.label}>Moments de la journée</Text>
              <View style={styles.timeSlotsList}>
                {[
                  { id: 'matin', label: 'Matin' },
                  { id: 'apres-midi', label: 'Après-midi' },
                  { id: 'soir', label: 'Soir' }
                ].map((slot) => (
                  <TouchableOpacity
                    key={slot.id}
                    style={[
                      styles.timeSlotItem,
                      formData.availability.timeSlots.includes(slot.id) && styles.timeSlotItemSelected
                    ]}
                    onPress={() => {
                      let newTimeSlots = [...formData.availability.timeSlots];
                      if (newTimeSlots.includes(slot.id)) {
                        newTimeSlots = newTimeSlots.filter(id => id !== slot.id);
                      } else {
                        newTimeSlots.push(slot.id);
                      }
                      setFormData({
                        ...formData,
                        availability: {
                          ...formData.availability,
                          timeSlots: newTimeSlots
                        }
                      });
                    }}
                  >
                    <Text style={[
                      styles.timeSlotText,
                      formData.availability.timeSlots.includes(slot.id) && styles.timeSlotTextSelected
                    ]}>
                      {slot.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <Input
              label="Notes sur vos disponibilités (optionnel)"
              value={formData.availability.notes}
              onChangeText={(text) => setFormData({
                ...formData,
                availability: {
                  ...formData.availability,
                  notes: text
                }
              })}
              placeholder="Ex: Je suis plus disponible en semaine..."
              multiline
              numberOfLines={3}
              icon="calendar"
            />
          </View>
        );
        
      case ProfileStep.SocialMedia:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Réseaux sociaux</Text>
            <Text style={styles.stepDescription}>
              Ces informations sont facultatives mais peuvent augmenter vos chances d'être sélectionné.
            </Text>
            
            <Input
              label="Instagram"
              value={formData.socialMedia.instagram}
              onChangeText={(text) => setFormData({
                ...formData,
                socialMedia: {
                  ...formData.socialMedia,
                  instagram: text
                }
              })}
              placeholder="@votrecompte"
              icon="logo-instagram"
            />
            
            <Input
              label="Facebook"
              value={formData.socialMedia.facebook}
              onChangeText={(text) => setFormData({
                ...formData,
                socialMedia: {
                  ...formData.socialMedia,
                  facebook: text
                }
              })}
              placeholder="URL ou nom d'utilisateur"
              icon="logo-facebook"
            />
            
            <Input
              label="TikTok"
              value={formData.socialMedia.tiktok}
              onChangeText={(text) => setFormData({
                ...formData,
                socialMedia: {
                  ...formData.socialMedia,
                  tiktok: text
                }
              })}
              placeholder="@votrecompte"
              icon="logo-tiktok"
            />
            
            <Input
              label="Portfolio en ligne (optionnel)"
              value={formData.socialMedia.portfolio}
              onChangeText={(text) => setFormData({
                ...formData,
                socialMedia: {
                  ...formData.socialMedia,
                  portfolio: text
                }
              })}
              placeholder="URL de votre portfolio"
              icon="globe"
            />
            
            <View style={styles.interestsContainer}>
              <Text style={styles.label}>Centres d'intérêt</Text>
              <Text style={styles.interestsDescription}>
                Sélectionnez les types de prestations qui vous intéressent
              </Text>
              <View style={styles.interestsList}>
                {[
                  { id: 'coiffure', label: 'Coiffure' },
                  { id: 'maquillage', label: 'Maquillage' },
                  { id: 'photo', label: 'Photographie' },
                  { id: 'esthetique', label: 'Soins esthétiques' },
                  { id: 'evenementiel', label: 'Événementiel' },
                  { id: 'mode', label: 'Mode' }
                ].map((interest) => (
                  <TouchableOpacity
                    key={interest.id}
                    style={[
                      styles.interestItem,
                      formData.interests.includes(interest.id) && styles.interestItemSelected
                    ]}
                    onPress={() => {
                      // Assurer que interests est initialisé comme un tableau
                      const currentInterests = Array.isArray(formData.interests) ? [...formData.interests] : [];
                      
                      let newInterests;
                      if (currentInterests.includes(interest.id)) {
                        newInterests = currentInterests.filter(id => id !== interest.id);
                      } else {
                        newInterests = [...currentInterests, interest.id];
                      }
                      
                      setFormData({
                        ...formData,
                        interests: newInterests
                      });
                    }}
                  >
                    <Text style={[
                      styles.interestText,
                      formData.interests.includes(interest.id) && styles.interestTextSelected
                    ]}>
                      {interest.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );
        
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Complétez votre profil</Text>
          <Text style={styles.headerSubtitle}>
            Étape {currentStep + 1} sur {Object.keys(ProfileStep).length / 2}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentStep + 1) / (Object.keys(ProfileStep).length / 2)) * 100}%` }
              ]} 
            />
          </View>
        </View>
        
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {renderStep()}
          
          <View style={styles.navigationButtons}>
            {currentStep > 0 && (
              <Button
                title="Précédent"
                onPress={prevStep}
                variant="outline"
                style={styles.navigationButton}
              />
            )}
            
            <Button
              title={currentStep === ProfileStep.SocialMedia ? "Terminer" : "Suivant"}
              onPress={nextStep}
              loading={loading}
              style={[styles.navigationButton, currentStep === 0 && styles.fullWidthButton]}
            />
          </View>
          
          {saveSuccess && (
            <View style={styles.successContainer}>
              <Text style={styles.successTitle}>Profil enregistré avec succès!</Text>
              <Button
                title="Aller à l'accueil manuellement"
                onPress={() => window.location.href = '/'}
                variant="primary"
                style={styles.successButton}
              />
            </View>
          )}
          
          <View style={styles.skipContainer}>
            <TouchableOpacity onPress={() => router.push('/(auth)/home')}>
              <Text style={styles.skipText}>
                Compléter plus tard
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const useStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  stepContainer: {
    gap: theme.spacing.lg,
  },
  stepTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  stepDescription: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  navigationButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  fullWidthButton: {
    flex: 1,
  },
  skipContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  skipText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSizes.sm,
  },
  label: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
    marginBottom: theme.spacing.sm,
  },
  genderContainer: {
    marginBottom: theme.spacing.md,
  },
  genderOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderOption: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginHorizontal: theme.spacing.xs,
  },
  genderOptionSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  genderOptionText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSizes.sm,
  },
  genderOptionTextSelected: {
    color: 'white',
    fontWeight: theme.typography.fontWeights.medium,
  },
  photoSection: {
    marginBottom: theme.spacing.md,
  },
  photoTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  photoUploadButton: {
    height: 200,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoUploadText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSizes.sm,
  },
  photoPreviewContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.lg,
  },
  photoPreviewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: theme.spacing.sm,
    borderBottomLeftRadius: theme.borderRadius.lg,
    borderBottomRightRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  photoPreviewText: {
    color: 'white',
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
  },
  infoText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  weekdaysContainer: {
    marginBottom: theme.spacing.md,
  },
  weekdaysList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekdayItem: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekdayItemSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  weekdayText: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.text,
  },
  weekdayTextSelected: {
    color: 'white',
    fontWeight: theme.typography.fontWeights.medium,
  },
  timeSlotsContainer: {
    marginBottom: theme.spacing.md,
  },
  timeSlotsList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeSlotItem: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginHorizontal: theme.spacing.xs,
  },
  timeSlotItemSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  timeSlotText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text,
  },
  timeSlotTextSelected: {
    color: 'white',
    fontWeight: theme.typography.fontWeights.medium,
  },
  interestsContainer: {
    marginTop: theme.spacing.md,
  },
  interestsDescription: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  interestsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.xs,
  },
  interestItem: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.full,
    margin: theme.spacing.xs,
  },
  interestItemSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  interestText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text,
  },
  interestTextSelected: {
    color: 'white',
    fontWeight: theme.typography.fontWeights.medium,
  },
  successContainer: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: '#E8F5E9',
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  successTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: '#2E7D32',
    marginBottom: theme.spacing.md,
  },
  successButton: {
    marginTop: theme.spacing.sm,
    backgroundColor: '#43A047',
  },
}));