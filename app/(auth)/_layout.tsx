import { Stack } from "expo-router";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const authHeaderOptions = {
  headerShown: true,
  headerTransparent: true,
  headerTitle: '',
  headerRight: () => <LanguageSwitcher variant="dark" />,
  headerLeft: () => null,
} as const;

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="role-select" options={authHeaderOptions} />
      <Stack.Screen name="sign-up" options={authHeaderOptions} />
      <Stack.Screen name="driver-register" options={authHeaderOptions} />
      <Stack.Screen name="sign-in" options={authHeaderOptions} />
    </Stack>
  );
};

export default Layout;
