// app/(auth)/applications/_layout.tsx
import { Stack } from 'expo-router';

export default function ApplicationsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: '#000000',
        }
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}