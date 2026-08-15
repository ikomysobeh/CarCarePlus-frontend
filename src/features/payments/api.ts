import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http, unwrap, ALL_ROWS_PARAMS } from '../../api/client';
import { endpoints } from '../../api/endpoints';
import type { ApiResponse } from '../../api/types';
import type { Payment } from './types';

// React Query hooks for Payments (see docs/12 §M19). The list is paginated server-side
// (default 15/page) — we pass ALL_ROWS_PARAMS so the client-side DataTable keeps the full list.
export const paymentKeys = { all: ['payments'] as const };

export function usePayments() {
  return useQuery({
    queryKey: paymentKeys.all,
    queryFn: () =>
      unwrap<Payment[]>(
        http.get<ApiResponse<Payment[]>>(endpoints.payments.index, { params: ALL_ROWS_PARAMS }),
      ),
  });
}

export function useConfirmCash() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      unwrap<Payment>(http.post<ApiResponse<Payment>>(endpoints.payments.confirmCash(id))),
    onSuccess: () => qc.invalidateQueries({ queryKey: paymentKeys.all }),
  });
}
