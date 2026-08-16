import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http, unwrap } from '../../api/client';
import { endpoints } from '../../api/endpoints';
import type { ApiResponse } from '../../api/types';
import type { PersonalCustomer, CompanyCustomer, CustomerUpdateInput } from './types';

// React Query hooks for Customers (see docs/10 §2). NOTE: no create hooks anywhere here —
// customers self-register via /auth/register/*, there's no admin-side "add customer".

export const personalCustomerKeys = { all: ['customers', 'personal'] as const };

export function usePersonalCustomers() {
  return useQuery({
    queryKey: personalCustomerKeys.all,
    queryFn: () =>
      unwrap<PersonalCustomer[]>(
        http.get<ApiResponse<PersonalCustomer[]>>(endpoints.customersPersonal.index),
      ),
  });
}
export function useUpdatePersonalCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: CustomerUpdateInput }) =>
      unwrap<PersonalCustomer>(
        http.post<ApiResponse<PersonalCustomer>>(endpoints.customersPersonal.update(id), input),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: personalCustomerKeys.all }),
  });
}
export function useDeletePersonalCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => http.delete(endpoints.customersPersonal.destroy(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: personalCustomerKeys.all }),
  });
}

export const companyCustomerKeys = { all: ['customers', 'company'] as const };

export function useCompanyCustomers() {
  return useQuery({
    queryKey: companyCustomerKeys.all,
    queryFn: () =>
      unwrap<CompanyCustomer[]>(
        http.get<ApiResponse<CompanyCustomer[]>>(endpoints.customersCompany.index),
      ),
  });
}
export function useUpdateCompanyCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: CustomerUpdateInput }) =>
      unwrap<CompanyCustomer>(
        http.post<ApiResponse<CompanyCustomer>>(endpoints.customersCompany.update(id), input),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: companyCustomerKeys.all }),
  });
}
export function useDeleteCompanyCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => http.delete(endpoints.customersCompany.destroy(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: companyCustomerKeys.all }),
  });
}

/**
 * Ready-made <select> options for "pick a customer", used by every screen that needs an owner
 * (cars, subscriptions, …) so the merge rule lives in ONE place.
 *
 * ⚠️ The `value` is the USER id, not the company id. Both endpoints return User-shaped rows —
 * `GET /customers/company` gives `id: 5` where user #5 holds the `customer_company` role, while
 * `companies.id` for that same record is 1. Getting this wrong attaches records to the wrong
 * owner with no error at all, so never swap in a company id here.
 *
 * `admin` lacks `show.company_customers`, so that request 403s for them and the list quietly
 * falls back to personal customers only.
 */
export interface CustomerOption {
  value: number;
  label: string;
  isCompany?: boolean;
}

export function useCustomerOptions(): { isLoading: boolean; options: CustomerOption[] } {
  const personal = usePersonalCustomers();
  const company = useCompanyCustomers();
  return {
    isLoading: personal.isLoading || company.isLoading,
    options: [
      ...(personal.data ?? []).map((c) => ({ value: c.id, label: `${c.name} — ${c.email}` })),
      ...(company.data ?? []).map((c) => ({ value: c.id, label: c.name, isCompany: true })),
    ],
  };
}
