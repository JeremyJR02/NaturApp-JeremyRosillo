// app/index.js
// ============================================
// Punto de entrada — Redirige a Home
// ============================================

import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/(tabs)/home" />;
}
