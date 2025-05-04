// app/index.tsx
import { Redirect } from 'expo-router';

export default function Index() {
  // Redirige automatiquement vers la bonne route
  return <Redirect href="/(public)/login" />;
}