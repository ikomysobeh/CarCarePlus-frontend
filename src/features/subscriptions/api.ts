import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http, unwrap } from '../../api/client';
import { endpoints } from '../../api/endpoints';
import type { ApiResponse } from '../../api/types';
import type {
  UserPackage,
  UserPackageInput,
  UserPackageUpdateInput,
  PointsBalance,
  PointsTransaction,
} from './types';

// Everything here is scoped to a specific customerId (the admin picks it, same as cars).
// Queries are disabled until a customerId is provided.

export const subscriptionKeys = {
  userPackages: (customerId?: number) => ['user-packages', customerId] as const,
  pointsBalance: (customerId?: number) => ['points-balance', customerId] as const,
  pointsHistory: (customerId?: number) => ['points-history', customerId] as const,
};

// GET /user-packages/{customerId}
export function useUserPackages(customerId?: number) {
  return useQuery({
    queryKey: subscriptionKeys.userPackages(customerId),
    enabled: customerId != null,
    queryFn: () =>
      unwrap<UserPackage[]>(
        http.get<ApiResponse<UserPackage[]>>(endpoints.userPackages.index(customerId)),
      ),
  });
}

// POST /user-packages/{customerId} — subscribe a customer to a package.
export function useCreateUserPackage(customerId?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UserPackageInput) =>
      unwrap<UserPackage>(
        http.post<ApiResponse<UserPackage>>(endpoints.userPackages.store(customerId), input),
      ),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: subscriptionKeys.userPackages(customerId) }),
  });
}

// POST /user-packages/update/{id}
export function useUpdateUserPackage(customerId?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UserPackageUpdateInput }) =>
      unwrap<UserPackage>(
        http.post<ApiResponse<UserPackage>>(endpoints.userPackages.update(id), input),
      ),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: subscriptionKeys.userPackages(customerId) }),
  });
}

// DELETE /user-packages/{id}
export function useDeleteUserPackage(customerId?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => http.delete(endpoints.userPackages.destroy(id)),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: subscriptionKeys.userPackages(customerId) }),
  });
}

// GET /points/show/{customerId}
export function usePointsBalance(customerId?: number) {
  return useQuery({
    queryKey: subscriptionKeys.pointsBalance(customerId),
    enabled: customerId != null,
    queryFn: () =>
      unwrap<PointsBalance>(
        http.get<ApiResponse<PointsBalance>>(endpoints.points.show(customerId)),
      ),
  });
}

// GET /points/transactions/{customerId}
export function usePointsHistory(customerId?: number) {
  return useQuery({
    queryKey: subscriptionKeys.pointsHistory(customerId),
    enabled: customerId != null,
    queryFn: () =>
      unwrap<PointsTransaction[]>(
        http.get<ApiResponse<PointsTransaction[]>>(endpoints.points.transactions(customerId)),
      ),
  });
}
