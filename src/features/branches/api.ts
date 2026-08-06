import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http, unwrap, ALL_ROWS_PARAMS } from '../../api/client';
import { endpoints } from '../../api/endpoints';
import type { ApiResponse } from '../../api/types';
import type { Branch, BranchInput } from './types';

// React Query hooks for Branches (see docs/10 §1). Plain JSON POST, same catalog pattern.

export const branchKeys = { all: ['branches'] as const };

export function useBranches() {
  return useQuery({
    queryKey: branchKeys.all,
    // Paginated server-side now (docs/11 §1) — ALL_ROWS_PARAMS keeps the full list visible.
    queryFn: () =>
      unwrap<Branch[]>(
        http.get<ApiResponse<Branch[]>>(endpoints.branches.index, { params: ALL_ROWS_PARAMS }),
      ),
  });
}
export function useCreateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: BranchInput) =>
      unwrap<Branch>(http.post<ApiResponse<Branch>>(endpoints.branches.store, input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: branchKeys.all }),
  });
}
export function useUpdateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<BranchInput> }) =>
      unwrap<Branch>(http.post<ApiResponse<Branch>>(endpoints.branches.update(id), input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: branchKeys.all }),
  });
}
export function useDeleteBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => http.delete(endpoints.branches.destroy(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: branchKeys.all }),
  });
}
