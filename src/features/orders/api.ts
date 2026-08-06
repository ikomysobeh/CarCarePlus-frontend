import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http, unwrap } from '../../api/client';
import { endpoints } from '../../api/endpoints';
import type { ApiResponse } from '../../api/types';
import type { Order, AssignOrderInput, CancelOrderInput } from './types';

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
