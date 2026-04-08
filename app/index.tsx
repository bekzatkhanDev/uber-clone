// Entry point: redirect to role-appropriate home or auth screen
import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { useAuthCheck, getUserRoles } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { getHomeRouteForRoles } from "@/lib/utils";

const Page = () => {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const { data: secureStoreAuth, isLoading: secureLoading } = useAuthCheck();
  const [homeRoute, setHomeRoute] = useState<string | null>(null);
  const [rolesLoaded, setRolesLoaded] = useState(false);

  const isReady = isInitialized || !secureLoading;
  const isAuth = isAuthenticated || secureStoreAuth;

  useEffect(() => {
    if (!isReady) return;
    if (!isAuth) {
      setRolesLoaded(true);
      return;
    }
    getUserRoles().then((roles) => {
      setHomeRoute(getHomeRouteForRoles(roles));
      setRolesLoaded(true);
    });
  }, [isReady, isAuth]);

  if (!isReady || !rolesLoaded) {
    return null;
  }

  if (isAuth && homeRoute) {
    return <Redirect href={homeRoute as any} />;
  }

  return <Redirect href="/(auth)/welcome" />;
};

export default Page;
