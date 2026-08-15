import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http, unwrap, ALL_ROWS_PARAMS } from '../../api/client';
import { endpoints } from '../../api/endpoints';
import type { ApiResponse } from '../../api/types';
import type { AdjustWalletInput, Wallet, WalletTransaction } from './types';

// Wallets (see docs/12 §M21).
export const walletKeys = {
  all: ['wallets'] as const,
  transactions: (customerId: number) => ['wallet-transactions', customerId] as const,
};

export function useWallets() {
  return useQuery({
    queryKey: walletKeys.all,
    queryFn: () =>
      unwrap<Wallet[]>(
        http.get<ApiResponse<Wallet[]>>(endpoints.wallets.index, { params: ALL_ROWS_PARAMS }),
      ),
  });
}

// Only fetched when a customer is selected (the transactions dialog is open).
export function useWalletTransactions(customerId: number | null) {
  return useQuery({
    queryKey: walletKeys.transactions(customerId ?? 0),
    enabled: customerId != null,
    queryFn: () =>
      unwrap<WalletTransaction[]>(
        http.get<ApiResponse<WalletTransaction[]>>(
          endpoints.walletTransactions.index(customerId ?? undefined),
          { params: ALL_ROWS_PARAMS },
        ),
      ),
  });
}

export function useAdjustWallet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ customerId, input }: { customerId: number; input: AdjustWalletInput }) =>
      unwrap<Wallet>(
        http.post<ApiResponse<Wallet>>(endpoints.wallets.adjust(customerId), input),
      ),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: walletKeys.all });
      qc.invalidateQueries({ queryKey: walletKeys.transactions(vars.customerId) });
    },
  });
}
