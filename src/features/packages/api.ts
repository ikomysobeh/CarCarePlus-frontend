import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http, unwrap, ALL_ROWS_PARAMS } from '../../api/client';
import { endpoints } from '../../api/endpoints';
import type { ApiResponse } from '../../api/types';
import type {
  Package,
  PackageInput,
  PackageService,
  PackageServiceInput,
  PackageServiceSubService,
  PackageServiceSubServiceInput,
} from './types';

// React Query hooks for the Packages domain. Same shape as the catalog (see
// features/catalog/api.ts): plain JSON bodies, POST for update, invalidate on write.

// ===========================================================================
// Packages
// ===========================================================================
export const packageKeys = { all: ['packages'] as const };

export function usePackages() {
  return useQuery({
    queryKey: packageKeys.all,
    queryFn: () => unwrap<Package[]>(http.get<ApiResponse<Package[]>>(endpoints.packages.index)),
  });
}
export function useCreatePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PackageInput) =>
      unwrap<Package>(http.post<ApiResponse<Package>>(endpoints.packages.store, input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: packageKeys.all }),
  });
}
export function useUpdatePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: PackageInput }) =>
      unwrap<Package>(http.post<ApiResponse<Package>>(endpoints.packages.update(id), input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: packageKeys.all }),
  });
}
export function useDeletePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => http.delete(endpoints.packages.destroy(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: packageKeys.all }),
  });
}

// ===========================================================================
// Package Services
// ===========================================================================
export const packageServiceKeys = { all: ['package-services'] as const };

export function usePackageServices() {
  return useQuery({
    queryKey: packageServiceKeys.all,
    // Paginated server-side now (docs/11 §1) — base Packages above is NOT affected.
    queryFn: () =>
      unwrap<PackageService[]>(
        http.get<ApiResponse<PackageService[]>>(endpoints.packageServices.index, {
          params: ALL_ROWS_PARAMS,
        }),
      ),
  });
}
export function useCreatePackageService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PackageServiceInput) =>
      unwrap<PackageService>(
        http.post<ApiResponse<PackageService>>(endpoints.packageServices.store, input),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: packageServiceKeys.all }),
  });
}
export function useUpdatePackageService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: PackageServiceInput }) =>
      unwrap<PackageService>(
        http.post<ApiResponse<PackageService>>(endpoints.packageServices.update(id), input),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: packageServiceKeys.all }),
  });
}
export function useDeletePackageService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => http.delete(endpoints.packageServices.destroy(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: packageServiceKeys.all }),
  });
}

// ===========================================================================
// Package Service Sub-Services
// ===========================================================================
export const packageServiceSubServiceKeys = { all: ['package-service-sub-services'] as const };

export function usePackageServiceSubServices() {
  return useQuery({
    queryKey: packageServiceSubServiceKeys.all,
    // Paginated server-side now (docs/11 §1).
    queryFn: () =>
      unwrap<PackageServiceSubService[]>(
        http.get<ApiResponse<PackageServiceSubService[]>>(
          endpoints.packageServiceSubServices.index,
          { params: ALL_ROWS_PARAMS },
        ),
      ),
  });
}
export function useCreatePackageServiceSubService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PackageServiceSubServiceInput) =>
      unwrap<PackageServiceSubService>(
        http.post<ApiResponse<PackageServiceSubService>>(
          endpoints.packageServiceSubServices.store,
          input,
        ),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: packageServiceSubServiceKeys.all }),
  });
}
export function useUpdatePackageServiceSubService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: PackageServiceSubServiceInput }) =>
      unwrap<PackageServiceSubService>(
        http.post<ApiResponse<PackageServiceSubService>>(
          endpoints.packageServiceSubServices.update(id),
          input,
        ),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: packageServiceSubServiceKeys.all }),
  });
}
export function useDeletePackageServiceSubService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => http.delete(endpoints.packageServiceSubServices.destroy(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: packageServiceSubServiceKeys.all }),
  });
}
