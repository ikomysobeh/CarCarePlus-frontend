import { useQuery } from '@tanstack/react-query';
import { http, unwrap, ALL_ROWS_PARAMS } from '../../api/client';
import { endpoints } from '../../api/endpoints';
import type { ApiResponse } from '../../api/types';
import type { SparePartRequest } from './types';

// Spare Part Requests (see docs/12 §M18). Read-only list; paginated server-side (per_page).
export const sparePartKeys = { all: ['spare-part-requests'] as const };

export function useSparePartRequests() {
  return useQuery({
    queryKey: sparePartKeys.all,
    queryFn: () =>
      unwrap<SparePartRequest[]>(
        http.get<ApiResponse<SparePartRequest[]>>(endpoints.sparePartRequests.index, {
          params: ALL_ROWS_PARAMS,
        }),
      ),
  });
}
