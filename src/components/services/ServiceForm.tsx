// src/components/services/ServiceForm.tsx
import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Formik } from 'formik';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import * as Yup from 'yup';
import { ServiceModel } from '../../domain/models/ServiceModel';
import { createThemedStyles, useTheme } from '../../utils/theme';
import { Button, Card, Input } from '../ui';

// Schéma de validation du formulaire
const ServiceSchema = Yup.object().shape({
  title: Yup.string()
    .min(5, 'Le titre doit contenir au moins 5 caractères')
    .max(100, 'Le titre ne doit pas dépasser 100 caractères')
    .required('Le titre est requis'),
  description: Yup.string()
    .min(20, 'La description doit contenir au moins 20 caractères')
    .max(500, 'La description ne doit pas dépasser 500 caractères')
    .required('La description est requise'),
  type: Yup.string()
    .oneOf(['haircut', 'coloring', 'makeup', 'photoshoot', 'other'], 'Type de service invalide')
    .required('Le type est requis'),
  date: Yup.date()
    .min(new Date(), 'La date doit être dans le futur')
    .required('La date est requise'),
  duration: Yup.number()
    .min(15, 'La durée minimum est de 15 minutes')
    .max(480, 'La durée maximum est de 8 heures')
    .required('La durée est requise'),
  location: Yup.object().shape({
    latitude: Yup.number().required('La latitude est requise'),
    longitude: Yup.number().required('La longitude est requise'),
    address: Yup.string().required('L\'adresse est requise'),
  }).required('La localisation est requise'),
  compensation: Yup.object().shape({
    type: Yup.string()
      .oneOf(['free', 'paid', 'tfp'], 'Type de compensation invalide')
      .required('Le type de compensation est requis'),
    amount: Yup.number()
      .when('type', {
        is: 'paid',
        then: Yup.number().min(1, 'Le montant doit être positif').required('Le montant est requis'),
        otherwise: Yup.number().nullable(),
      }),
  }).required('La compensation est requise'),
  requirements: Yup.object().shape({
    gender: Yup.string().oneOf(['male', 'female', 'all'], 'Genre invalide'),
    minHeight: Yup.number().min(140, 'Taille minimum invalide'),
    maxHeight: Yup.number().max(220, 'Taille maximum invalide'),
    hairColor: Yup.array().of(Yup.string()),
    hairLength: Yup.string().oneOf(['short', 'medium', 'long']),
    experience: Yup.string().oneOf(['beginner', 'intermediate', 'experienced']),
  }),
});

interface ServiceFormProps {
  initialValues?: Partial<ServiceModel>;
  onSubmit: (values: Partial<ServiceModel>, images: ImagePickerAsset[]) => Promise<void>;
  buttonText: string;
  isSubmitting: boolean;
}

interface ImagePickerAsset {
  uri: string;
  name: string;
  type: string;
}

export const ServiceForm = ({
  initialValues,
  onSubmit,
  buttonText,
  isSubmitting,
}: ServiceFormProps) => {
  const theme = useTheme();
  const styles = useStyles();
  const [images, setImages] = useState<ImagePickerAsset[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Valeurs par défaut
  const defaultValues: Partial<ServiceModel> = {
    title: '',
    description: '',
    type: 'other',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Demain
    duration: 60, // 1 heure par défaut
    location: {
      latitude: 0,
      longitude: 0,
      address: '',
    },
    compensation: {
      type: 'free',
      amount: undefined,
    },
    requirements: {
      gender: 'all',
      experience: 'beginner',
    },
    images: [],
    ...initialValues,
  };
  
  // Sélectionner des images depuis la galerie
  const pickImages = async () => {
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
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 5,
      });
      
      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => ({
          uri: asset.uri,
          name: asset.fileName || `image-${Date.now()}.jpg`,
          type: asset.mimeType || 'image/jpeg',
        }));
        
        setImages(prev => [...prev, ...newImages].slice(0, 5)); // Limiter à 5 images
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la sélection des images.');
    }
  };
  
  // Obtenir la localisation actuelle
  const getCurrentLocation = async (setFieldValue: (field: string, value: any) => void) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission refusée',
          'Nous avons besoin des permissions pour accéder à votre localisation.'
        );
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      // Convertir en adresse lisible
      const [address] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      
      const formattedAddress = address
        ? `${address.street || ''}, ${address.postalCode || ''} ${address.city || ''}`
        : `Latitude: ${latitude}, Longitude: ${longitude}`;
      
      setFieldValue('location', {
        latitude,
        longitude,
        address: formattedAddress,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la récupération de votre localisation.');
    }
  };
  
  // Supprimer une image
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };
  
  // Format de durée pour l'affichage
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours}h` : ''}${mins > 0 ? ` ${mins}min` : ''}`;
  };
  
  return (
    <Formik
      initialValues={defaultValues}
      validationSchema={ServiceSchema}
      onSubmit={async (values) => {
        await onSubmit(values, images);
        // Réinitialiser les images après la soumission
        setImages([]);
      }}
    >
      {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          {/* Informations de base */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations de base</Text>
            
            <Input
              label="Titre de la prestation"
              placeholder="ex: Coupe et coiffage pour shooting"
              value={values.title}
              onChangeText={handleChange('title')}
              onBlur={handleBlur('title')}
              error={touched.title && errors.title ? errors.title : undefined}
            />
            
            <Input
              label="Description"
              placeholder="Décrivez votre prestation en détail..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={values.description}
              onChangeText={handleChange('description')}
              onBlur={handleBlur('description')}
              error={touched.description && errors.description ? errors.description : undefined}
            />
            
            <Text style={styles.label}>Type de prestation</Text>
            <Card variant="outlined" padding="none" style={styles.pickerContainer}>
              <Picker
                selectedValue={values.type}
                onValueChange={(itemValue) => setFieldValue('type', itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Coiffure" value="haircut" />
                <Picker.Item label="Coloration" value="coloring" />
                <Picker.Item label="Maquillage" value="makeup" />
                <Picker.Item label="Séance photo" value="photoshoot" />
                <Picker.Item label="Autre" value="other" />
              </Picker>
            </Card>
            {touched.type && errors.type && (
              <Text style={styles.errorText}>{errors.type}</Text>
            )}
          </View>
          
          {/* Date et durée */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date et durée</Text>
            
            <Text style={styles.label}>Date de la prestation</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.datePickerButton}
            >
              <Text style={styles.dateText}>
                {values.date.toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
              <FontAwesome name="calendar" size={18} color={theme.colors.primary} />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={values.date}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setFieldValue('date', selectedDate);
                  }
                }}
                minimumDate={new Date()}
              />
            )}
            {touched.date && errors.date && (
              <Text style={styles.errorText}>{errors.date}</Text>
            )}
            
            <Text style={styles.label}>Durée (minutes)</Text>
            <Card variant="outlined" padding="none" style={styles.pickerContainer}>
              <Picker
                selectedValue={values.duration}
                onValueChange={(itemValue) => setFieldValue('duration', itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="15 minutes" value={15} />
                <Picker.Item label="30 minutes" value={30} />
                <Picker.Item label="45 minutes" value={45} />
                <Picker.Item label="1 heure" value={60} />
                <Picker.Item label="1 heure 30" value={90} />
                <Picker.Item label="2 heures" value={120} />
                <Picker.Item label="3 heures" value={180} />
                <Picker.Item label="4 heures" value={240} />
                <Picker.Item label="Journée entière (8h)" value={480} />
              </Picker>
            </Card>
            {touched.duration && errors.duration && (
              <Text style={styles.errorText}>{errors.duration}</Text>
            )}
          </View>
          
          {/* Localisation */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Localisation</Text>
            
            <Input
              label="Adresse"
              placeholder="Adresse complète"
              value={values.location?.address}
              onChangeText={(text) => setFieldValue('location.address', text)}
              onBlur={handleBlur('location.address')}
              error={
                touched.location?.address && errors.location?.address 
                  ? errors.location.address 
                  : undefined
              }
              rightIcon={
                <Ionicons name="location-outline" size={24} color={theme.colors.primary} />
              }
              onRightIconPress={() => getCurrentLocation(setFieldValue)}
            />
          </View>
          
          {/* Compensation */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Compensation</Text>
            
            <Text style={styles.label}>Type de compensation</Text>
            <Card variant="outlined" padding="none" style={styles.pickerContainer}>
              <Picker
                selectedValue={values.compensation?.type}
                onValueChange={(itemValue) => {
                  setFieldValue('compensation.type', itemValue);
                  if (itemValue !== 'paid') {
                    setFieldValue('compensation.amount', undefined);
                  }
                }}
                style={styles.picker}
              >
                <Picker.Item label="Gratuit" value="free" />
                <Picker.Item label="Rémunéré" value="paid" />
                <Picker.Item label="TFP (Time For Prints)" value="tfp" />
              </Picker>
            </Card>
            {touched.compensation?.type && errors.compensation?.type && (
              <Text style={styles.errorText}>{errors.compensation.type}</Text>
            )}
            
            {values.compensation?.type === 'paid' && (
              <Input
                label="Montant (€)"
                placeholder="ex: 50"
                keyboardType="numeric"
                value={values.compensation?.amount?.toString() || ''}
                onChangeText={(text) => setFieldValue('compensation.amount', Number(text))}
                onBlur={handleBlur('compensation.amount')}
                error={
                  touched.compensation?.amount && errors.compensation?.amount 
                    ? errors.compensation.amount 
                    : undefined
                }
              />
            )}
          </View>
          
          {/* Critères / Exigences */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Critères recherchés (Optionnel)</Text>
            
            <Text style={styles.label}>Genre</Text>
            <Card variant="outlined" padding="none" style={styles.pickerContainer}>
              <Picker
                selectedValue={values.requirements?.gender || 'all'}
                onValueChange={(itemValue) => setFieldValue('requirements.gender', itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Tous" value="all" />
                <Picker.Item label="Homme" value="male" />
                <Picker.Item label="Femme" value="female" />
              </Picker>
            </Card>
            
            <Text style={styles.label}>Expérience</Text>
            <Card variant="outlined" padding="none" style={styles.pickerContainer}>
              <Picker
                selectedValue={values.requirements?.experience || 'beginner'}
                onValueChange={(itemValue) => setFieldValue('requirements.experience', itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Débutant" value="beginner" />
                <Picker.Item label="Intermédiaire" value="intermediate" />
                <Picker.Item label="Expérimenté" value="experienced" />
              </Picker>
            </Card>
          </View>
          
          {/* Images */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Images (Optionnel)</Text>
            <Text style={styles.helperText}>
              Ajoutez jusqu'à 5 images pour illustrer votre prestation
            </Text>
            
            <View style={styles.imagesContainer}>
              {images.map((image, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri: image.uri }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons name="close-circle" size={24} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
              
              {images.length < 5 && (
                <TouchableOpacity style={styles.addImageButton} onPress={pickImages}>
                  <MaterialIcons name="add-photo-alternate" size={36} color={theme.colors.primary} />
                  <Text style={styles.addImageText}>Ajouter</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          {/* Bouton de soumission */}
          <Button
            title={buttonText}
            onPress={() => handleSubmit()}
            loading={isSubmitting}
            fullWidth
            size="lg"
            style={styles.submitButton}
          />
        </ScrollView>
      )}
    </Formik>
  );
};

const useStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl * 2,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  label: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    fontWeight: theme.typography.fontWeights.medium,
  },
  pickerContainer: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  dateText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSizes.sm,
    marginTop: -theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  helperText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  imageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 2,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
  },
  submitButton: {
    marginTop: theme.spacing.lg,
  },
}));