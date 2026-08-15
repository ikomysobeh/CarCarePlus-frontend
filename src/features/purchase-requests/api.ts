import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http, unwrap, ALL_ROWS_PARAMS } from '../../api/client';
import { endpoints } from '../../api/endpoints';
import type { ApiResponse } from '../../api/types';
import type { PurchaseRequest, PurchaseRequestInput, TransferInput } from './types';

// Purchase Requests (see docs/12 §M17).
export const prKeys = { all: ['purchase-requests'] as const };

export function usePurchaseRequests() {
  return useQuery({
    queryKey: prKeys.all,
    queryFn: () =>
      unwrap<PurchaseRequest[]>(
        http.get<ApiResponse<PurchaseRequest[]>>(endpoints.purchaseRequests.index, {
          params: ALL_ROWS_PARAMS,
        }),
      ),
  });
}

const invalidate = (qc: ReturnType<typeof useQueryClient>) =>
  qc.invalidateQueries({ queryKey: prKeys.all });

export function useCreatePurchaseRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PurchaseRequestInput) =>
      unwrap<PurchaseRequest>(http.post<ApiResponse<PurchaseRequest>>(endpoints.purchaseRequests.store, input)),
    onSuccess: () => invalidate(qc),
  });
}

export function useUpdatePurchaseRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: PurchaseRequestInput }) =>
      unwrap<PurchaseRequest>(http.post<ApiResponse<PurchaseRequest>>(endpoints.purchaseRequests.update(id), input)),
    onSuccess: () => invalidate(qc),
  });
}

export function useDeletePurchaseRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      unwrap<unknown>(http.delete<ApiResponse<unknown>>(endpoints.purchaseRequests.destroy(id))),
    onSuccess: () => invalidate(qc),
  });
}

export function useApprovePurchaseRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      unwrap<PurchaseRequest>(http.post<ApiResponse<PurchaseRequest>>(endpoints.purchaseRequests.approve(id))),
    onSuccess: () => invalidate(qc),
  });
}

export function useRejectPurchaseRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rejection_reason }: { id: number; rejection_reason: string }) =>
      unwrap<PurchaseRequest>(
        http.post<ApiResponse<PurchaseRequest>>(endpoints.purchaseRequests.reject(id), { rejection_reason }),
      ),
    onSuccess: () => invalidate(qc),
  });
}

export function useTransferStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TransferInput) =>
      unwrap<PurchaseRequest>(http.post<ApiResponse<PurchaseRequest>>(endpoints.purchaseRequests.transfer, input)),
    onSuccess: () => invalidate(qc),
  });
}
