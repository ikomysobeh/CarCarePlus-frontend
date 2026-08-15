import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http, unwrap } from '../../api/client';
import { endpoints } from '../../api/endpoints';
import type { ApiResponse } from '../../api/types';
import type {
  Order,
  AssignOrderInput,
  CancelOrderInput,
  OrderStatusHistory,
  PriceItemsResult,
  SubServicesResult,
  MaterialsResult,
  MaintenanceDetail,
  MaintenanceDetailInput,
  RoadDetail,
  RoadDetailInput,
  TowingDetail,
  TowingDetailInput,
} from './types';

// React Query hooks for Orders/Bookings (see docs/11 §2). The list is auto-scoped per role
// server-side, so there's no client-side filtering to do here — just render what comes back.
//
// ⚠️ `GET /bookings` is paginated, fixed 10/page, with NO `per_page` override (unlike every
// other resource we patched with ALL_ROWS_PARAMS — see api/client.ts) — the backend controller
// doesn't read a per_page param at all for this one. We're stuck at 10/page until the dev adds
// the same pattern here, or we build real server-side pagination into DataTable.

export const orderKeys = { all: ['orders'] as const };

export function useOrders() {
  return useQuery({
    queryKey: orderKeys.all,
    queryFn: () => unwrap<Order[]>(http.get<ApiResponse<Order[]>>(endpoints.bookings.index)),
  });
}

export function useAssignOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: AssignOrderInput }) =>
      unwrap<Order>(http.post<ApiResponse<Order>>(endpoints.bookings.assign(id), input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: orderKeys.all }),
  });
}

export function useStartOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => unwrap<Order>(http.post<ApiResponse<Order>>(endpoints.bookings.start(id))),
    onSuccess: () => qc.invalidateQueries({ queryKey: orderKeys.all }),
  });
}

export function useCompleteOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      unwrap<Order>(http.post<ApiResponse<Order>>(endpoints.bookings.complete(id))),
    onSuccess: () => qc.invalidateQueries({ queryKey: orderKeys.all }),
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: CancelOrderInput }) =>
      unwrap<Order>(
        http.delete<ApiResponse<Order>>(endpoints.bookings.cancel(id), { data: input }),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: orderKeys.all }),
  });
}

// --- M16: booking detail (see docs/12 §M16). Each tab is its own query, keyed by order id,
// only enabled when a detail dialog is open for that order. ---

export const orderDetailKeys = {
  statusHistory: (id: number) => ['order', id, 'status-history'] as const,
  priceItems: (id: number) => ['order', id, 'price-items'] as const,
  subServices: (id: number) => ['order', id, 'sub-services'] as const,
  materials: (id: number) => ['order', id, 'materials'] as const,
  maintenance: (id: number) => ['order', id, 'maintenance'] as const,
  road: (id: number) => ['order', id, 'road'] as const,
  towing: (id: number) => ['order', id, 'towing'] as const,
};

export function useOrderStatusHistory(id: number | null) {
  return useQuery({
    queryKey: orderDetailKeys.statusHistory(id ?? 0),
    enabled: id != null,
    queryFn: () =>
      unwrap<OrderStatusHistory[]>(
        http.get<ApiResponse<OrderStatusHistory[]>>(endpoints.bookings.statusHistory(id!)),
      ),
  });
}

export function useOrderPriceItems(id: number | null) {
  return useQuery({
    queryKey: orderDetailKeys.priceItems(id ?? 0),
    enabled: id != null,
    queryFn: () =>
      unwrap<PriceItemsResult>(http.get<ApiResponse<PriceItemsResult>>(endpoints.bookings.priceItems(id!))),
  });
}

export function useOrderSubServices(id: number | null) {
  return useQuery({
    queryKey: orderDetailKeys.subServices(id ?? 0),
    enabled: id != null,
    queryFn: () =>
      unwrap<SubServicesResult>(http.get<ApiResponse<SubServicesResult>>(endpoints.bookings.subServices(id!))),
  });
}

export function useOrderMaterials(id: number | null) {
  return useQuery({
    queryKey: orderDetailKeys.materials(id ?? 0),
    enabled: id != null,
    queryFn: () =>
      unwrap<MaterialsResult>(http.get<ApiResponse<MaterialsResult>>(endpoints.bookings.materials(id!))),
  });
}

export function useMaintenanceDetail(id: number | null) {
  return useQuery({
    queryKey: orderDetailKeys.maintenance(id ?? 0),
    enabled: id != null,
    queryFn: () =>
      unwrap<MaintenanceDetail | null>(
        http.get<ApiResponse<MaintenanceDetail | null>>(endpoints.bookings.maintenanceDetail(id!)),
      ),
  });
}

export function useRoadDetail(id: number | null) {
  return useQuery({
    queryKey: orderDetailKeys.road(id ?? 0),
    enabled: id != null,
    queryFn: () =>
      unwrap<RoadDetail | null>(http.get<ApiResponse<RoadDetail | null>>(endpoints.bookings.roadDetail(id!))),
  });
}

export function useTowingDetail(id: number | null) {
  return useQuery({
    queryKey: orderDetailKeys.towing(id ?? 0),
    enabled: id != null,
    queryFn: () =>
      unwrap<TowingDetail | null>(http.get<ApiResponse<TowingDetail | null>>(endpoints.bookings.towingDetail(id!))),
  });
}

export function useUpdateMaintenanceDetail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: MaintenanceDetailInput }) =>
      unwrap<MaintenanceDetail>(
        http.post<ApiResponse<MaintenanceDetail>>(endpoints.bookings.maintenanceDetail(id), input),
      ),
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: orderDetailKeys.maintenance(v.id) }),
  });
}

export function useUpdateRoadDetail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: RoadDetailInput }) =>
      unwrap<RoadDetail>(http.post<ApiResponse<RoadDetail>>(endpoints.bookings.roadDetail(id), input)),
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: orderDetailKeys.road(v.id) }),
  });
}

export function useUpdateTowingDetail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: TowingDetailInput }) =>
      unwrap<TowingDetail>(http.post<ApiResponse<TowingDetail>>(endpoints.bookings.towingDetail(id), input)),
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: orderDetailKeys.towing(v.id) }),
  });
}
