import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http, unwrap } from '../../api/client';
import { endpoints } from '../../api/endpoints';
import type { ApiResponse } from '../../api/types';
import type { Car, CarInput } from './types';

// React Query hooks for Cars. New vs the catalog: writes use **multipart/form-data**
// because a car can carry an image file. See docs/explanation/features/cars.

export const carKeys = { all: ['cars'] as const };

// Turn a CarInput into FormData (needed for the file upload). Skips empty values and
// converts booleans to '1'/'0' (Laravel's boolean validation expects those, not "true").
function toFormData(input: CarInput): FormData {
  const fd = new FormData();
  Object.entries(input).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (value instanceof File) fd.append(key, value);
    else if (typeof value === 'boolean') fd.append(key, value ? '1' : '0');
    else fd.append(key, String(value));
  });
  return fd;
}

// GET /cars/all (super_admin / admin see all cars in scope)
export function useCars() {
  return useQuery({
    queryKey: carKeys.all,
    queryFn: () => unwrap<Car[]>(http.get<ApiResponse<Car[]>>(endpoints.cars.all)),
  });
}

// POST /cars/{customer_id?} — create. Admins pass the owner's id in the URL.
export function useCreateCar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ customerId, input }: { customerId?: number; input: CarInput }) =>
      unwrap<Car>(
        http.post<ApiResponse<Car>>(endpoints.cars.store(customerId), toFormData(input)),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: carKeys.all }),
  });
}

// POST /cars/update/{id} — update (also multipart, for a possible new image).
export function useUpdateCar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: CarInput }) =>
      unwrap<Car>(http.post<ApiResponse<Car>>(endpoints.cars.update(id), toFormData(input))),
    onSuccess: () => qc.invalidateQueries({ queryKey: carKeys.all }),
  });
}

// GET /cars/delete/{id} — delete (the backend uses GET here, not DELETE — see docs/03).
export function useDeleteCar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => http.get(endpoints.cars.destroy(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: carKeys.all }),
  });
}
