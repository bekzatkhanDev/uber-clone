// hooks/useTariffs.ts
import { useQuery } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/fetch';
import { Tariff } from '@/types/type';

export const useTariffs = () => {
  return useQuery<Tariff[]>({
    queryKey: ['tariffs'],
    queryFn: () => fetchAPI('/tariffs/'),
  });
};
