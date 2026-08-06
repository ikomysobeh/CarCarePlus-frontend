import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http, unwrap, ALL_ROWS_PARAMS } from '../../api/client';
import { endpoints } from '../../api/endpoints';
import type { ApiResponse } from '../../api/types';
import type {
  ProblemType,
  ProblemTypeInput,
  SuggestedProblem,
  SuggestedProblemInput,
  SystemSetting,
  SystemSettingInput,
  AiRule,
  AiRuleInput,
} from './types';

// React Query hooks for the M14 Settings group (see docs/10 §9). Four independent
// catalog-shaped CRUDs — same POST-update/DELETE convention as everything since Categories.

// ===========================================================================
// Problem Types
// ===========================================================================
export const problemTypeKeys = { all: ['problem-types'] as const };

export function useProblemTypes() {
  return useQuery({
    queryKey: problemTypeKeys.all,
    // Paginated server-side now (docs/11 §1) — see ALL_ROWS_PARAMS's doc comment.
    queryFn: () =>
      unwrap<ProblemType[]>(
        http.get<ApiResponse<ProblemType[]>>(endpoints.problemTypes.index, {
          params: ALL_ROWS_PARAMS,
        }),
      ),
  });
}
export function useCreateProblemType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProblemTypeInput) =>
      unwrap<ProblemType>(http.post<ApiResponse<ProblemType>>(endpoints.problemTypes.store, input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: problemTypeKeys.all }),
  });
}
export function useUpdateProblemType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ProblemTypeInput }) =>
      unwrap<ProblemType>(
        http.post<ApiResponse<ProblemType>>(endpoints.problemTypes.update(id), input),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: problemTypeKeys.all }),
  });
}
export function useDeleteProblemType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => http.delete(endpoints.problemTypes.destroy(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: problemTypeKeys.all }),
  });
}

// ===========================================================================
// Suggested Problems
// ===========================================================================
export const suggestedProblemKeys = { all: ['suggested-problems'] as const };

export function useSuggestedProblems() {
  return useQuery({
    queryKey: suggestedProblemKeys.all,
    // Paginated server-side now (docs/11 §1).
    queryFn: () =>
      unwrap<SuggestedProblem[]>(
        http.get<ApiResponse<SuggestedProblem[]>>(endpoints.suggestedProblems.index, {
          params: ALL_ROWS_PARAMS,
        }),
      ),
  });
}
export function useCreateSuggestedProblem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SuggestedProblemInput) =>
      unwrap<SuggestedProblem>(
        http.post<ApiResponse<SuggestedProblem>>(endpoints.suggestedProblems.store, input),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: suggestedProblemKeys.all }),
  });
}
export function useUpdateSuggestedProblem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: SuggestedProblemInput }) =>
      unwrap<SuggestedProblem>(
        http.post<ApiResponse<SuggestedProblem>>(endpoints.suggestedProblems.update(id), input),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: suggestedProblemKeys.all }),
  });
}
export function useDeleteSuggestedProblem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => http.delete(endpoints.suggestedProblems.destroy(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: suggestedProblemKeys.all }),
  });
}

// ===========================================================================
// System Settings
// ===========================================================================
export const systemSettingKeys = { all: ['system-settings'] as const };

export function useSystemSettings() {
  return useQuery({
    queryKey: systemSettingKeys.all,
    // Paginated server-side now (docs/11 §1).
    queryFn: () =>
      unwrap<SystemSetting[]>(
        http.get<ApiResponse<SystemSetting[]>>(endpoints.systemSettings.index, {
          params: ALL_ROWS_PARAMS,
        }),
      ),
  });
}
export function useCreateSystemSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SystemSettingInput) =>
      unwrap<SystemSetting>(
        http.post<ApiResponse<SystemSetting>>(endpoints.systemSettings.store, input),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: systemSettingKeys.all }),
  });
}
export function useUpdateSystemSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: SystemSettingInput }) =>
      unwrap<SystemSetting>(
        http.post<ApiResponse<SystemSetting>>(endpoints.systemSettings.update(id), input),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: systemSettingKeys.all }),
  });
}
export function useDeleteSystemSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => http.delete(endpoints.systemSettings.destroy(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: systemSettingKeys.all }),
  });
}

// ===========================================================================
// AI Rules
// ===========================================================================
export const aiRuleKeys = { all: ['ai-rules'] as const };

export function useAiRules() {
  return useQuery({
    queryKey: aiRuleKeys.all,
    // Paginated server-side now (docs/11 §1).
    queryFn: () =>
      unwrap<AiRule[]>(
        http.get<ApiResponse<AiRule[]>>(endpoints.aiRules.index, { params: ALL_ROWS_PARAMS }),
      ),
  });
}
export function useCreateAiRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AiRuleInput) =>
      unwrap<AiRule>(http.post<ApiResponse<AiRule>>(endpoints.aiRules.store, input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: aiRuleKeys.all }),
  });
}
export function useUpdateAiRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: AiRuleInput }) =>
      unwrap<AiRule>(http.post<ApiResponse<AiRule>>(endpoints.aiRules.update(id), input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: aiRuleKeys.all }),
  });
}
export function useDeleteAiRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => http.delete(endpoints.aiRules.destroy(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: aiRuleKeys.all }),
  });
}
