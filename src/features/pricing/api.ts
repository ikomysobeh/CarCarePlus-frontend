import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http, unwrap, ALL_ROWS_PARAMS } from '../../api/client';
import { endpoints } from '../../api/endpoints';
import type { ApiResponse } from '../../api/types';
import type { PricingRuleType, PricingRuleTypeInput, PricingRule, PricingRuleInput } from './types';

// React Query hooks for the pricing engine (see docs/09). Plain JSON POST (not multipart —
// unlike cars/profile, there's no file field here).

export const pricingRuleTypeKeys = { all: ['pricing-rule-types'] as const };

export function usePricingRuleTypes() {
  return useQuery({
    queryKey: pricingRuleTypeKeys.all,
    // Paginated server-side now (docs/11 §1).
    queryFn: () =>
      unwrap<PricingRuleType[]>(
        http.get<ApiResponse<PricingRuleType[]>>(endpoints.pricingRuleTypes.index, {
          params: ALL_ROWS_PARAMS,
        }),
      ),
  });
}
export function useCreatePricingRuleType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PricingRuleTypeInput) =>
      unwrap<PricingRuleType>(
        http.post<ApiResponse<PricingRuleType>>(endpoints.pricingRuleTypes.store, input),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: pricingRuleTypeKeys.all }),
  });
}
export function useUpdatePricingRuleType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: PricingRuleTypeInput }) =>
      unwrap<PricingRuleType>(
        http.post<ApiResponse<PricingRuleType>>(endpoints.pricingRuleTypes.update(id), input),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: pricingRuleTypeKeys.all }),
  });
}
export function useDeletePricingRuleType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => http.delete(endpoints.pricingRuleTypes.destroy(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: pricingRuleTypeKeys.all }),
  });
}

export const pricingRuleKeys = { all: ['pricing-rules'] as const };

export function usePricingRules() {
  return useQuery({
    queryKey: pricingRuleKeys.all,
    // Paginated server-side now (docs/11 §1).
    queryFn: () =>
      unwrap<PricingRule[]>(
        http.get<ApiResponse<PricingRule[]>>(endpoints.pricingRules.index, {
          params: ALL_ROWS_PARAMS,
        }),
      ),
  });
}
export function useCreatePricingRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PricingRuleInput) =>
      unwrap<PricingRule>(http.post<ApiResponse<PricingRule>>(endpoints.pricingRules.store, input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: pricingRuleKeys.all }),
  });
}
export function useUpdatePricingRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: PricingRuleInput }) =>
      unwrap<PricingRule>(
        http.post<ApiResponse<PricingRule>>(endpoints.pricingRules.update(id), input),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: pricingRuleKeys.all }),
  });
}
export function useDeletePricingRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => http.delete(endpoints.pricingRules.destroy(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: pricingRuleKeys.all }),
  });
}
