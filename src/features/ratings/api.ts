import { useQuery } from '@tanstack/react-query';
import { http, unwrap, ALL_ROWS_PARAMS } from '../../api/client';
import { endpoints } from '../../api/endpoints';
import type { ApiResponse } from '../../api/types';
import type { Rating } from './types';

// Ratings (see docs/12 §M20). Read-only list; paginated server-side so we pass ALL_ROWS_PARAMS.
export const ratingKeys = { all: ['ratings'] as const };

export function useRatings() {
  return useQuery({
    queryKey: ratingKeys.all,
    queryFn: () =>
      unwrap<Rating[]>(
        http.get<ApiResponse<Rating[]>>(endpoints.ratings.index, { params: ALL_ROWS_PARAMS }),
      ),
  });
}
