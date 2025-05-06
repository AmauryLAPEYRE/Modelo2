// src/utils/professionalType.ts
// Utilitaire pour gérer les types de professionnels
import { Ionicons } from '@expo/vector-icons';

export type ProfessionalType = 'coiffeur' | 'maquilleur' | 'photographe' | 'estheticienne';

/**
 * Formate le type de professionnel pour l'affichage
 * @param type Le type de professionnel
 * @returns La chaîne formatée avec première lettre en majuscule
 */
export const formatProfessionalType = (type?: string): string => {
  if (!type) return '';
  
  // Première lettre en majuscule
  return type.charAt(0).toUpperCase() + type.slice(1);
};

/**
 * Obtient l'icône correspondant au type de professionnel
 * @param type Le type de professionnel
 * @returns La clé d'icône Ionicons à utiliser
 */
export const getProfessionalTypeIcon = (type?: string): keyof typeof Ionicons.glyphMap => {
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

/**
 * Liste tous les types de professionnels disponibles avec leur label et icône
 */
export const professionalTypeOptions = [
  { value: 'coiffeur', label: 'Coiffeur', icon: 'cut' },
  { value: 'maquilleur', label: 'Maquilleur', icon: 'color-palette' },
  { value: 'photographe', label: 'Photographe', icon: 'camera' },
  { value: 'estheticienne', label: 'Esthéticienne', icon: 'flower' }
];

/**
 * Obtient la couleur associée au type de professionnel
 * Utile pour la personnalisation visuelle
 */
export const getProfessionalTypeColor = (type?: string, theme?: any): string => {
  if (!type || !theme) return '#3B82F6'; // Couleur par défaut (bleu)
  
  switch (type) {
    case 'coiffeur':
      return '#06B6D4'; // Cyan
    case 'maquilleur':
      return '#F472B6'; // Rose
    case 'photographe':
      return '#10B981'; // Vert
    case 'estheticienne':
      return '#8B5CF6'; // Violet
    default:
      return '#3B82F6'; // Bleu par défaut
  }
};