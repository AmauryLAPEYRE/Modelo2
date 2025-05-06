// app/(auth)/_layout.tsx
import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme';
import { router } from 'expo-router';

export default function AuthLayout() {
  const { user, loading } = useAuth();
  const theme = useTheme();

  if (loading) return null;
  if (!user) return <Redirect href="/(public)/login" />;

  const handleServicePress = () => {
    // Navigue vers l'index des services et réinitialise la stack
    router.navigate('/(auth)/services');
    
    // Attendre un tick pour éviter les conflits de navigation
    setTimeout(() => {
      router.replace('/(auth)/services');
    }, 100);
  };

  return (
    <Tabs
      screenOptions={{
        // Suppression des headers
        headerShown: false,
        
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'home' : 'home-outline'} 
              size={size + 2} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Services',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'calendar' : 'calendar-outline'} 
              size={size + 2} 
              color={color} 
            />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            handleServicePress();
          },
        })}
      />
      <Tabs.Screen
        name="applications"
        options={{
          title: 'Candidatures',
          tabBarLabel: 'Candidatures',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'document' : 'document-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'person' : 'person-outline'} 
              size={size + 2} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}