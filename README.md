# Modelo - Application de Mise en Relation

Modelo est une application mobile qui connecte les modèles avec les professionnels de la beauté (coiffeurs, maquilleurs, photographes) pour des collaborations et des prestations.

## 🚀 Fonctionnalités Actuelles

### Authentification
- Inscription/Connexion avec Firebase Auth
- Distinction de rôles (Modèle / Professionnel)
- Interface minimaliste en thème sombre

### Pour les Professionnels
- Création de prestations (services)
- Gestion des candidatures reçues
- Acceptation/Refus des modèles
- Dashboard personnel

### Pour les Modèles
- Navigation des services disponibles
- Candidature aux prestations
- Suivi du statut des candidatures
- Dashboard personnel

### Général
- Design noir professionnel type Instagram
- Navigation fluide avec Expo Router
- Interface responsive
- Temps réel avec Firebase

## 📱 Stack Technique

- **Frontend**: React Native avec Expo
- **Navigation**: Expo Router
- **Backend**: Firebase (Auth, Firestore)
- **State Management**: Hooks React
- **Styling**: ThemeProvider personnalisé
- **Types**: TypeScript

## 🛠️ Installation

1. Cloner le repository
```bash
git clone https://github.com/votreusername/modelo.git
cd modelo
```

2. Installer les dépendances
```bash
npm install --legacy-peer-deps
```

3. Configurer Firebase
```bash
# Créer un fichier .env à la racine
cp .env.example .env
# Modifier avec vos clés Firebase
```

4. Lancer l'application
```bash
npx expo start
```

## 🔄 Évolutions Futures

### Phase 1 - Q2 2025
#### Géolocalisation
- Recherche de services par proximité
- Carte interactive des services disponibles
- Filtrage par distance

#### Système de Messagerie
- Chat temps réel entre modèles et professionnels
- Notifications push
- Historique des conversations

### Phase 2 - Q3 2025
#### Paiements Intégrés
- Système de paiement sécurisé (Stripe)
- Gestion des factures
- Suivi des transactions

#### Portfolios
- Galerie photos pour les modèles
- Espace d'exposition pour les professionnels
- Upload et gestion des images

### Phase 3 - Q4 2025
#### Système d'Évaluation
- Notes et avis après prestation
- Badges de confiance
- Système de réputation

#### Gestion Avancée
- Calendrier intégré avec disponibilités
- Rappels automatiques
- Statistiques et analytics
- Exportation des données

### Phase 4 - 2026
#### Fonctionnalités Business
- Compte entreprise
- Gestion des équipes
- API pour intégrations externes
- Version web desktop

#### Intelligence Artificielle
- Recommandations personnalisées
- Matching automatique modèle/pro
- Analyse des tendances

## 🏗️ Architecture

L'application suit une architecture modulaire avec :
- Séparation claire des préoccupations
- Hooks réutilisables
- Composants UI atomiques
- Thème centralisé

## 🤝 Contribuer

Les contributions sont les bienvenues ! Consultez notre guide de contribution pour plus de détails.

## 📄 Licence

MIT License

## 📞 Contact

- Email: contact@modelo.app
- Website: https://modelo.app
- Support: support@modelo.app

---

Made with ❤️ for the beauty community