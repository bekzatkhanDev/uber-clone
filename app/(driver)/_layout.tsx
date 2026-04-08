import { Redirect, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { getAuthToken, getUserRoles } from '@/hooks/useAuth';

const DriverLayout = () => {
  const [checked, setChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    Promise.all([getAuthToken(), getUserRoles()]).then(([token, roles]) => {
      setAllowed(!!token && roles.includes('driver'));
      setChecked(true);
    });
  }, []);

  if (!checked) return null;
  if (!allowed) return <Redirect href="/(root)/(tabs)/home" />;

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
};

export default DriverLayout;
