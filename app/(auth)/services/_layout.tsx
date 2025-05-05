// app/(auth)/services/_layout.tsx
import { Stack } from 'expo-router';

export default function ServicesLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Prestations',
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="[id]" 
        options={{ 
          title: 'Détails',
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="create" 
        options={{ 
          title: 'Créer une prestation',
          headerShown: true,
        }} 
      />
    </Stack>
  );
}