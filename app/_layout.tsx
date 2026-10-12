import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#000010' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="login" options={{ title: 'Login', animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="game" options={{ title: 'Game', gestureEnabled: false }} />
      <Stack.Screen name="ships" options={{ title: 'Naves' }} />
      <Stack.Screen name="ranking" options={{ title: 'Ranking' }} />
      <Stack.Screen name="perfil" options={{ title: 'Perfil' }} />
    </Stack>
  );
}
