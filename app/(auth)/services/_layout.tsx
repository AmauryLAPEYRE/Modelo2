// app/(auth)/services/_layout.tsx
import { Stack } from 'expo-router';

export default function ServicesLayout() {
  return (
    <Stack
      screenOptions={{
        // Suppression du header par défaut pour toutes les routes "services/*"
        headerShown: false,
        // Styles complémentaires pour maintenir l'apparence générale
        contentStyle: {
          backgroundColor: '#000000',
        }
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="create" />
      <Stack.Screen name="edit" />
    </Stack>
  );
}