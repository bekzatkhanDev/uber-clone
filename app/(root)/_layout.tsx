import { Redirect, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { getAuthToken } from "@/hooks/useAuth";

const Layout = () => {
  const [checked, setChecked] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    getAuthToken().then((token) => {
      setHasToken(!!token);
      setChecked(true);
    });
  }, []);

  if (!checked) return null;
  if (!hasToken) return <Redirect href="/(auth)/welcome" />;

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="find-ride" options={{ headerShown: false }} />
      <Stack.Screen name="confirm-ride" options={{ headerShown: false }} />
      <Stack.Screen name="book-ride" options={{ headerShown: false }} />
    </Stack>
  );
};

export default Layout;