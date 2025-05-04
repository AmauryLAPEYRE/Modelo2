// app.config.js
export default {
    expo: {
      name: "Modelo",
      slug: "modelo",
      version: "1.0.0",
      orientation: "portrait",
      icon: "./assets/icon.png",
      splash: {
        image: "./assets/splash.png",
        resizeMode: "contain",
        backgroundColor: "#6366F1"
      },
      updates: {
        fallbackToCacheTimeout: 0
      },
      assetBundlePatterns: [
        "**/*"
      ],
      ios: {
        supportsTablet: true,
        bundleIdentifier: "com.modelo.app",
        infoPlist: {
          NSCameraUsageDescription: "Cette application a besoin d'accéder à votre appareil photo pour prendre des photos.",
          NSPhotoLibraryUsageDescription: "Cette application a besoin d'accéder à votre galerie pour sélectionner des photos.",
          NSLocationWhenInUseUsageDescription: "Cette application a besoin d'accéder à votre localisation pour trouver des prestations près de vous."
        }
      },
      android: {
        adaptiveIcon: {
          foregroundImage: "./assets/adaptive-icon.png",
          backgroundColor: "#6366F1"
        },
        package: "com.modelo.app",
        permissions: [
          "CAMERA",
          "READ_EXTERNAL_STORAGE",
          "WRITE_EXTERNAL_STORAGE",
          "ACCESS_FINE_LOCATION",
          "ACCESS_COARSE_LOCATION"
        ]
      },
      web: {
        favicon: "./assets/favicon.png"
      },
      extra: {
        // Exporter ces variables depuis un fichier .env
        firebaseApiKey: process.env.FIREBASE_API_KEY,
        firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
        firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
        firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        firebaseAppId: process.env.FIREBASE_APP_ID,
        eas: {
          projectId: "votre-eas-project-id"
        }
      },
      scheme: "modelo",
      plugins: [
        "expo-image-picker",
        "expo-location",
        [
          "expo-build-properties",
          {
            "ios": {
              "useFrameworks": "static"
            }
          }
        ]
      ]
    }
  };
  