import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Home',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="game" 
        options={{ 
          title: 'Game',
          headerShown: false,
        }} 
      />
    </Stack>
  );
}