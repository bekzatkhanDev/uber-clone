import { Ride } from "@/types/type";
import { router } from "expo-router";

// Priority: admin > driver > customer
export function getHomeRouteForRoles(roles: string[]): string {
  if (roles.includes('admin')) return '/(admin)/(tabs)/dashboard';
  if (roles.includes('driver')) return '/(driver)/(tabs)/home';
  return '/(root)/(tabs)/home';
}

export function navigateByRole(roles: string[]): void {
  const route = getHomeRouteForRoles(roles);
  router.replace(route as any);
}

export const sortRides = (rides: Ride[]): Ride[] => {
  return [...rides].sort((a, b) => {
    // Сортируем от новых к старым
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
};

export function formatTime(minutes: number): string {
  const totalMinutes = Math.round(Math.max(0, minutes)); // Защита от NaN/negative

  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  } else {
    const hours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  return `${day.toString().padStart(2, "0")} ${month} ${year}`;
}