import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="sign-in" options={{ headerTitle: 'Sign In', headerBackTitle: 'Back' }} />
      <Stack.Screen name="sign-up" options={{ headerTitle: 'Sign Up', headerBackTitle: 'Back' }} />
    </Stack>
  );
}
