import { Stack } from 'expo-router';

export default function PublicLayout() {
  return (
    <Stack>
      <Stack.Screen name="tracks/[token]" options={{ headerShown: false }} />
    </Stack>
  );
}
