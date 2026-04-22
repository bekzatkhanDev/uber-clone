// Admin API hooks: dashboard, users, drivers, trips, suspend, approve, cancel
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const useAdminDashboard = () =>
  useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => fetchWithAuth('/admin/dashboard/'),
  });

// ─── Users ────────────────────────────────────────────────────────────────────

export const useAdminUsers = (search = '') =>
  useQuery({
    queryKey: ['admin', 'users', search],
    queryFn: () =>
      fetchWithAuth(`/users/${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  });

export const useAdminUserDetail = (id: number) =>
  useQuery({
    queryKey: ['admin', 'user', id],
    queryFn: () => fetchWithAuth(`/users/${id}/`),
    enabled: !!id,
  });

export const useAdminUserRoleUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, roles }: { id: number; roles: string[] }) =>
      fetchWithAuth(`/users/${id}/roles/`, {
        method: 'POST',
        body: JSON.stringify({ roles }),
      }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

export const useAdminSuspendUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      fetchWithAuth(`/admin/users/${id}/suspend/`, { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'user'] });
    },
  });
};

// ─── Drivers ──────────────────────────────────────────────────────────────────

export const useAdminDrivers = (status = '', search = '') =>
  useQuery({
    queryKey: ['admin', 'drivers', status, search],
    queryFn: () => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (search) params.set('search', search);
      const qs = params.toString();
      return fetchWithAuth(`/admin/drivers/${qs ? `?${qs}` : ''}`);
    },
  });

export const useAdminDriverDetail = (id: number) =>
  useQuery({
    queryKey: ['admin', 'driver', id],
    queryFn: () => fetchWithAuth(`/admin/drivers/${id}/`),
    enabled: !!id,
  });

export const useAdminApproveDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      fetchWithAuth(`/admin/drivers/${id}/approve/`, { method: 'PATCH' }),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'driver', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'drivers'] });
    },
  });
};

export const useAdminSuspendDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      fetchWithAuth(`/admin/drivers/${id}/suspend/`, { method: 'PATCH' }),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'driver', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'drivers'] });
    },
  });
};

export const useAdminReactivateDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      fetchWithAuth(`/admin/drivers/${id}/reactivate/`, { method: 'PATCH' }),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'driver', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'drivers'] });
    },
  });
};

// ─── Trips ────────────────────────────────────────────────────────────────────

export const useAdminTrips = (filters: { status?: string; search?: string } = {}) =>
  useQuery({
    queryKey: ['admin', 'trips', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.search) params.set('search', filters.search);
      const qs = params.toString();
      return fetchWithAuth(`/admin/trips/${qs ? `?${qs}` : ''}`);
    },
  });

export const useAdminTripDetail = (id: string) =>
  useQuery({
    queryKey: ['admin', 'trip', id],
    queryFn: () => fetchWithAuth(`/admin/trips/${id}/`),
    enabled: !!id,
  });

export const useAdminCancelTrip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      fetchWithAuth(`/admin/trips/${id}/cancel/`, {
        method: 'POST',
        body: JSON.stringify({ cancel_reason: reason || 'Cancelled by admin' }),
      }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'trip', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'trips'] });
    },
  });
};

// ─── Tariffs ──────────────────────────────────────────────────────────────────

export interface Tariff {
  id: number;
  code: string;
  base_price: string;
  price_per_km: string;
  price_per_min: string;
  min_price: string;
  is_active: boolean;
}

export interface TariffPayload {
  code: string;
  base_price: string;
  price_per_km: string;
  price_per_min: string;
  min_price: string;
  is_active?: boolean;
}

export const useAdminTariffs = () =>
  useQuery<Tariff[]>({
    queryKey: ['admin', 'tariffs'],
    queryFn: () => fetchWithAuth('/admin/tariffs/'),
  });

export const useAdminCreateTariff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TariffPayload) =>
      fetchWithAuth('/admin/tariffs/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tariffs'] });
    },
  });
};

export const useAdminUpdateTariff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TariffPayload> }) =>
      fetchWithAuth(`/admin/tariffs/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tariffs'] });
    },
  });
};

export const useAdminToggleTariff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      fetchWithAuth(`/admin/tariffs/${id}/`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tariffs'] });
    },
  });
};
