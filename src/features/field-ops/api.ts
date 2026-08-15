import { useQuery } from '@tanstack/react-query';
import { http, unwrap, ALL_ROWS_PARAMS } from '../../api/client';
import { endpoints } from '../../api/endpoints';
import type { ApiResponse } from '../../api/types';
import type { EmployeeReport, GpsLog } from './types';

// Field ops (see docs/12 §M22) — read-only lists, paginated server-side.
export const fieldOpsKeys = {
  reports: ['employee-reports'] as const,
  gps: ['gps-logs'] as const,
};

export function useEmployeeReports() {
  return useQuery({
    queryKey: fieldOpsKeys.reports,
    queryFn: () =>
      unwrap<EmployeeReport[]>(
        http.get<ApiResponse<EmployeeReport[]>>(endpoints.employeeReports.index, {
          params: ALL_ROWS_PARAMS,
        }),
      ),
  });
}

export function useGpsLogs() {
  return useQuery({
    queryKey: fieldOpsKeys.gps,
    queryFn: () =>
      unwrap<GpsLog[]>(
        http.get<ApiResponse<GpsLog[]>>(endpoints.gpsLogs.index, { params: ALL_ROWS_PARAMS }),
      ),
  });
}
