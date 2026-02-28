// Точка входа: редирект на главную или на экран входа по авторизации
import { Redirect } from "expo-router";
import { useAuthCheck } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";

const Page = () => {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const { data: secureStoreAuth, isLoading: secureLoading } = useAuthCheck();

  const isReady = isInitialized || !secureLoading;
  const isAuth = isAuthenticated || secureStoreAuth;

  if (!isReady) {
    return null;
  }

  if (isAuth) {
    return <Redirect href="/(root)/(tabs)/home" />;
  }

  return <Redirect href="/(auth)/welcome" />;
};

export default Page;
