import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http, unwrap } from '../../api/client';
import { endpoints } from '../../api/endpoints';
import type { ApiResponse } from '../../api/types';
import type { Workshop, WorkshopInput } from './types';

// React Query hooks for Workshops (see docs/10 §3). Plain JSON POST, same catalog pattern.
// `endpoints.workshops.my` (GET /workshops/my) exists but has no hook here — it's the
// workshop role's own self-service view, out of scope for this admin dashboard.

export const workshopKeys = { all: ['workshops'] as const };

export function useWorkshops() {
  return useQuery({
    queryKey: workshopKeys.all,
    queryFn: () => unwrap<Workshop[]>(http.get<ApiResponse<Workshop[]>>(endpoints.workshops.index)),
  });
}
export function useCreateWorkshop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: WorkshopInput) =>
      unwrap<Workshop>(http.post<ApiResponse<Workshop>>(endpoints.workshops.store, input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: workshopKeys.all }),
  });
}
export function useUpdateWorkshop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<WorkshopInput> }) =>
      unwrap<Workshop>(http.post<ApiResponse<Workshop>>(endpoints.workshops.update(id), input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: workshopKeys.all }),
  });
}
export function useDeleteWorkshop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => http.delete(endpoints.workshops.destroy(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: workshopKeys.all }),
  });
}
