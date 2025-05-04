// app/_layout.tsx
import { Slot, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { auth } from '../src/services/firebase/config';
import { ThemeProvider } from '../src/utils/theme';
import { useAuthViewModel } from '../src/viewModels/useAuthViewModel';

// Empêcher le SplashScreen de se cacher automatiquement
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { setCurrentUser, isLoading, setIsLoading } = useAuthViewModel();

  useEffect(() => {
    // Observer les changements d'état d'authentification
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      await setCurrentUser(user);
      setIsLoading(false);
      // Cacher le SplashScreen une fois l'auth vérifiée
      SplashScreen.hideAsync();
    });

    // Nettoyer l'observer quand le composant est démonté
    return unsubscribe;
  }, []);

  if (isLoading) {
    return null; // Le SplashScreen est toujours visible
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider colorScheme={colorScheme}>
        <StatusBar style="auto" />
        <Slot />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
