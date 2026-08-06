import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http, unwrap, ALL_ROWS_PARAMS } from '../../api/client';
import { endpoints } from '../../api/endpoints';
import type { ApiResponse } from '../../api/types';
import type {
  MaterialUnit,
  MaterialUnitInput,
  Material,
  MaterialInput,
  Inventory,
  InventoryInput,
  InventoryTransaction,
  InventoryTransactionInput,
} from './types';

// React Query hooks for the Materials/Inventory domain (see docs/10 §5). All plain JSON
// POST — no file uploads anywhere in this feature.

// --- Material Units ---
export const materialUnitKeys = { all: ['material-units'] as const };
export function useMaterialUnits() {
  return useQuery({
    queryKey: materialUnitKeys.all,
    // Paginated server-side now (docs/11 §1) — Inventories/Transactions below are NOT affected.
    queryFn: () =>
      unwrap<MaterialUnit[]>(
        http.get<ApiResponse<MaterialUnit[]>>(endpoints.materialUnits.index, {
          params: ALL_ROWS_PARAMS,
        }),
      ),
  });
}
export function useCreateMaterialUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: MaterialUnitInput) =>
      unwrap<MaterialUnit>(http.post<ApiResponse<MaterialUnit>>(endpoints.materialUnits.store, input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: materialUnitKeys.all }),
  });
}
export function useUpdateMaterialUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: MaterialUnitInput }) =>
      unwrap<MaterialUnit>(http.post<ApiResponse<MaterialUnit>>(endpoints.materialUnits.update(id), input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: materialUnitKeys.all }),
  });
}
export function useDeleteMaterialUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => http.delete(endpoints.materialUnits.destroy(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: materialUnitKeys.all }),
  });
}

// --- Materials ---
export const materialKeys = { all: ['materials'] as const };
export function useMaterials() {
  return useQuery({
    queryKey: materialKeys.all,
    // Paginated server-side now (docs/11 §1).
    queryFn: () =>
      unwrap<Material[]>(
        http.get<ApiResponse<Material[]>>(endpoints.materials.index, { params: ALL_ROWS_PARAMS }),
      ),
  });
}
export function useCreateMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: MaterialInput) =>
      unwrap<Material>(http.post<ApiResponse<Material>>(endpoints.materials.store, input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: materialKeys.all }),
  });
}
export function useUpdateMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: MaterialInput }) =>
      unwrap<Material>(http.post<ApiResponse<Material>>(endpoints.materials.update(id), input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: materialKeys.all }),
  });
}
export function useDeleteMaterial() {
  const qc = useQueryClient();
  return useMutation({
    // Deleting a material cascade-deletes its inventory rows + transaction history
    // server-side (docs/10 §5) — the UI warns about this in the confirm dialog.
    mutationFn: (id: number) => http.delete(endpoints.materials.destroy(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: materialKeys.all }),
  });
}

// --- Inventories (stock levels — corrections, not day-to-day movement) ---
export const inventoryKeys = { all: ['inventories'] as const };
export function useInventories() {
  return useQuery({
    queryKey: inventoryKeys.all,
    queryFn: () => unwrap<Inventory[]>(http.get<ApiResponse<Inventory[]>>(endpoints.inventories.index)),
  });
}
export function useCreateInventory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: InventoryInput) =>
      unwrap<Inventory>(http.post<ApiResponse<Inventory>>(endpoints.inventories.store, input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: inventoryKeys.all }),
  });
}
export function useUpdateInventory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: InventoryInput }) =>
      unwrap<Inventory>(http.post<ApiResponse<Inventory>>(endpoints.inventories.update(id), input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: inventoryKeys.all }),
  });
}
export function useDeleteInventory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => http.delete(endpoints.inventories.destroy(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: inventoryKeys.all }),
  });
}

// --- Inventory Transactions (append-only ledger — read + create only) ---
export const inventoryTransactionKeys = { all: ['inventory-transactions'] as const };
export function useInventoryTransactions() {
  return useQuery({
    queryKey: inventoryTransactionKeys.all,
    queryFn: () =>
      unwrap<InventoryTransaction[]>(
        http.get<ApiResponse<InventoryTransaction[]>>(endpoints.inventoryTransactions.index),
      ),
  });
}
export function useCreateInventoryTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: InventoryTransactionInput) =>
      unwrap<InventoryTransaction>(
        http.post<ApiResponse<InventoryTransaction>>(endpoints.inventoryTransactions.store, input),
      ),
    // A transaction changes stock levels too — invalidate BOTH caches, or the Inventories
    // tab shows stale numbers until an unrelated refetch happens.
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inventoryTransactionKeys.all });
      qc.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
}
