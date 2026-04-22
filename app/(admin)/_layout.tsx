import { Redirect, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { getAuthToken, getUserRoles } from '@/hooks/useAuth';

const AdminLayout = () => {
  const [checked, setChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    Promise.all([getAuthToken(), getUserRoles()]).then(([token, roles]) => {
      setAllowed(!!token && roles.includes('admin'));
      setChecked(true);
    });
  }, []);

  if (!checked) return null;
  if (!allowed) return <Redirect href="/(auth)/welcome" />;

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="users/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="drivers/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="trips/[id]" options={{ headerShown: false }} />
    </Stack>
  );
};

export default AdminLayout;
