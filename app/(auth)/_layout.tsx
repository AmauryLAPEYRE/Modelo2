// app/(auth)/_layout.tsx
import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { redirect, Tabs } from 'expo-router';
import React from 'react';
// import { useTheme } from '../../src/utils/theme';
import { useAuthViewModel } from '../../src/viewModels/useAuthViewModel';

export default function TabLayout() {
  const theme = useTheme();
  const { currentUser } = useAuthViewModel();

  // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
  if (!currentUser) {
    redirect('/(public)/login');
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          paddingBottom: 5,
          paddingTop: 5,
        },
        headerStyle: {
          backgroundColor: theme.colors.background,
          borderBottomColor: theme.colors.border,
          borderBottomWidth: 1,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="services/index"
        options={{
          title: 'Prestations',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="design-services" size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="applications/index"
        options={{
          title: 'Candidatures',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="file-text-o" size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="messages/index"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-outline" size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user" size={size} color={color} />
          ),
        }}
      />
      
      {/* Screens that don't have a tab but are part of this stack group */}
      <Tabs.Screen
        name="services/create"
        options={{
          title: 'Créer une prestation',
          // Hide this screen in the tab bar
          href: null,
        }}
      />
      
      <Tabs.Screen
        name="services/[id]"
        options={{
          title: 'Détails de la prestation',
          // Hide this screen in the tab bar
          href: null,
        }}
      />
      
      <Tabs.Screen
        name="applications/[id]"
        options={{
          title: 'Détails de la candidature',
          // Hide this screen in the tab bar
          href: null,
        }}
      />
      
      <Tabs.Screen
        name="messages/[id]"
        options={{
          title: 'Conversation',
          // Hide this screen in the tab bar
          href: null,
        }}
      />
    </Tabs>
  );
}