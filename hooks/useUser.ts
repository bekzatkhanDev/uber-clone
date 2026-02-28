// Пользователь: текущий, обновление профиля, админка
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/fetch';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => fetchWithAuth('/users/me/'),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<{ first_name: string; last_name: string }>) =>
      fetchWithAuth('/users/me/', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

export const useUserById = (id: number) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchAPI(`/users/${id}/`),
    enabled: !!id,
  });
};

export const useAssignRoles = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roles }: { userId: number; roles: string[] }) =>
      fetchAPI(`/users/${userId}/roles/`, {
        method: 'PATCH',
        body: JSON.stringify({ roles }),
      }),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    },
  });
};