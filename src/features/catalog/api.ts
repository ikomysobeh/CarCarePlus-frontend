import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http, unwrap, ALL_ROWS_PARAMS } from '../../api/client';
import { endpoints } from '../../api/endpoints';
import type { ApiResponse } from '../../api/types';
import type {
  Category,
  CategoryInput,
  Service,
  ServiceInput,
  SubService,
  SubServiceInput,
  CarType,
  CarTypeInput,
  CarBrand,
  CarBrandInput,
} from './types';

// React Query hooks for Categories. Each screen imports these instead of calling the
// API directly — React Query handles loading/error/caching and keeps the list in sync
// after writes (via invalidation). See docs/explanation/features/catalog/api.ts.md.

// The cache identity for this resource. All category queries live under this key, so
// invalidating it after a create/update/delete refetches the list.
export const categoryKeys = {
  all: ['categories'] as const,
};

// GET /categories -> Category[]
export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.all,
    // Categories index is now paginated server-side (docs/11 §1) — ALL_ROWS_PARAMS keeps
    // us seeing the full list until DataTable grows real server-side pagination.
    queryFn: () =>
      unwrap<Category[]>(
        http.get<ApiResponse<Category[]>>(endpoints.categories.index, { params: ALL_ROWS_PARAMS }),
      ),
  });
}

// POST /categories (create)
export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CategoryInput) =>
      unwrap<Category>(http.post<ApiResponse<Category>>(endpoints.categories.store, input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}

// POST /categories/{id} (update — the API uses POST, not PUT; see docs/03)
export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: CategoryInput }) =>
      unwrap<Category>(http.post<ApiResponse<Category>>(endpoints.categories.update(id), input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}

// DELETE /categories/{id}
export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => http.delete(endpoints.categories.destroy(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}

// ===========================================================================
// Services  (same pattern as categories — see docs/explanation/features/catalog)
// ===========================================================================
export const serviceKeys = { all: ['services'] as const };

export function useServices() {
  return useQuery({
    queryKey: serviceKeys.all,
    queryFn: () => unwrap<Service[]>(http.get<ApiResponse<Service[]>>(endpoints.services.index)),
  });
}
export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ServiceInput) =>
      unwrap<Service>(http.post<ApiResponse<Service>>(endpoints.services.store, input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: serviceKeys.all }),
  });
}
export function useUpdateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ServiceInput }) =>
      unwrap<Service>(http.post<ApiResponse<Service>>(endpoints.services.update(id), input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: serviceKeys.all }),
  });
}
export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => http.delete(endpoints.services.destroy(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: serviceKeys.all }),
  });
}

// ===========================================================================
// Sub-services
// ===========================================================================
export const subServiceKeys = { all: ['sub-services'] as const };

export function useSubServices() {
  return useQuery({
    queryKey: subServiceKeys.all,
    queryFn: () =>
      unwrap<SubService[]>(http.get<ApiResponse<SubService[]>>(endpoints.subServices.index)),
  });
}
export function useCreateSubService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SubServiceInput) =>
      unwrap<SubService>(http.post<ApiResponse<SubService>>(endpoints.subServices.store, input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: subServiceKeys.all }),
  });
}
export function useUpdateSubService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: SubServiceInput }) =>
      unwrap<SubService>(
        http.post<ApiResponse<SubService>>(endpoints.subServices.update(id), input),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: subServiceKeys.all }),
  });
}
export function useDeleteSubService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => http.delete(endpoints.subServices.destroy(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: subServiceKeys.all }),
  });
}

// ===========================================================================
// Car types
// ===========================================================================
export const carTypeKeys = { all: ['car-types'] as const };

export function useCarTypes() {
  return useQuery({
    queryKey: carTypeKeys.all,
    // Paginated server-side now (docs/11 §1) — see the Categories query above.
    queryFn: () =>
      unwrap<CarType[]>(
        http.get<ApiResponse<CarType[]>>(endpoints.carTypes.index, { params: ALL_ROWS_PARAMS }),
      ),
  });
}
export function useCreateCarType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CarTypeInput) =>
      unwrap<CarType>(http.post<ApiResponse<CarType>>(endpoints.carTypes.store, input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: carTypeKeys.all }),
  });
}
export function useUpdateCarType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: CarTypeInput }) =>
      unwrap<CarType>(http.post<ApiResponse<CarType>>(endpoints.carTypes.update(id), input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: carTypeKeys.all }),
  });
}
export function useDeleteCarType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => http.delete(endpoints.carTypes.destroy(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: carTypeKeys.all }),
  });
}

// ===========================================================================
// Car brands
// ===========================================================================
export const carBrandKeys = { all: ['car-brands'] as const };

export function useCarBrands() {
  return useQuery({
    queryKey: carBrandKeys.all,
    // Paginated server-side now (docs/11 §1) — was already at 14/15 rows, right on the edge.
    queryFn: () =>
      unwrap<CarBrand[]>(
        http.get<ApiResponse<CarBrand[]>>(endpoints.carBrands.index, { params: ALL_ROWS_PARAMS }),
      ),
  });
}
export function useCreateCarBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CarBrandInput) =>
      unwrap<CarBrand>(http.post<ApiResponse<CarBrand>>(endpoints.carBrands.store, input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: carBrandKeys.all }),
  });
}
export function useUpdateCarBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: CarBrandInput }) =>
      unwrap<CarBrand>(http.post<ApiResponse<CarBrand>>(endpoints.carBrands.update(id), input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: carBrandKeys.all }),
  });
}
export function useDeleteCarBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => http.delete(endpoints.carBrands.destroy(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: carBrandKeys.all }),
  });
}
