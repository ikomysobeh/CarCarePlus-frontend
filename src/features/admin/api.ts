import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http, unwrap, ALL_ROWS_PARAMS } from '../../api/client';
import { endpoints } from '../../api/endpoints';
import type { ApiResponse } from '../../api/types';
import type { Admin, AdminInput, Company, Workshop, StaffInput } from './types';

// React Query hooks for super-admin: registration approvals + staff creation.

export const adminKeys = {
  companies: ['admin', 'pending-companies'] as const,
  workshops: ['admin', 'pending-workshops'] as const,
};

// --- Pending companies ---
export function usePendingCompanies() {
  return useQuery({
    queryKey: adminKeys.companies,
    queryFn: () =>
      unwrap<Company[]>(http.get<ApiResponse<Company[]>>(endpoints.admin.pendingCompanies)),
  });
}
export function useApproveCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => http.post(endpoints.admin.approveCompany(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.companies }),
  });
}
export function useRejectCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      http.post(endpoints.admin.rejectCompany(id), { reason }),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.companies }),
  });
}

// --- Pending workshops ---
export function usePendingWorkshops() {
  return useQuery({
    queryKey: adminKeys.workshops,
    queryFn: () =>
      unwrap<Workshop[]>(http.get<ApiResponse<Workshop[]>>(endpoints.admin.pendingWorkshops)),
  });
}
export function useApproveWorkshop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => http.post(endpoints.admin.approveWorkshop(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.workshops }),
  });
}
export function useRejectWorkshop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      http.post(endpoints.admin.rejectWorkshop(id), { reason }),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.workshops }),
  });
}

// --- Create staff ---
export function useCreateStaff() {
  return useMutation({
    mutationFn: (input: StaffInput) =>
      unwrap(http.post<ApiResponse<unknown>>(endpoints.admin.employees, input)),
  });
}

// --- M9: Admins CRUD ---
export const adminAccountKeys = { all: ['admins'] as const };

export function useAdmins() {
  return useQuery({
    queryKey: adminAccountKeys.all,
    // Paginated server-side now (docs/11 §1) — ALL_ROWS_PARAMS keeps the full list visible.
    queryFn: () =>
      unwrap<Admin[]>(
        http.get<ApiResponse<Admin[]>>(endpoints.admins.index, { params: ALL_ROWS_PARAMS }),
      ),
  });
}
export function useCreateAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminInput) =>
      unwrap<Admin>(http.post<ApiResponse<Admin>>(endpoints.admins.store, input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminAccountKeys.all }),
  });
}
export function useUpdateAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: AdminInput }) =>
      unwrap<Admin>(http.post<ApiResponse<Admin>>(endpoints.admins.update(id), input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminAccountKeys.all }),
  });
}
export function useDeleteAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => http.delete(endpoints.admins.destroy(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminAccountKeys.all }),
  });
}
// Activate/deactivate are dedicated action endpoints, not a generic is_active PATCH.
export function useSetAdminActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      unwrap<Admin>(
        http.post<ApiResponse<Admin>>(
          active ? endpoints.admins.activate(id) : endpoints.admins.deactivate(id),
        ),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminAccountKeys.all }),
  });
}
