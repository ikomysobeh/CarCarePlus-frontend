import { useQuery } from '@tanstack/react-query';
import { http, unwrap, ALL_ROWS_PARAMS } from '../../api/client';
import { endpoints } from '../../api/endpoints';
import type { ApiResponse } from '../../api/types';
import type { EmployeeReport, EmployeeReportFilters, GpsLog } from './types';

// Field ops (see docs/12 §M22) — read-only lists, paginated server-side.
export const fieldOpsKeys = {
  reports: ['employee-reports'] as const,
  gps: ['gps-logs'] as const,
};

/**
 * Employee reports — the whole list, filtered in the browser (see `filterReports`).
 *
 * The backend ships an `App\Filters\EmployeeReportFilter` supporting order_id / employee_id /
 * status / from_date / to_date / search, but it is NOT wired up: `EmployeeReportController@index`
 * passes only `per_page` to the service, and `EmployeeReportRepository::getAll` never touches the
 * filter class. We verified this against a live server with seeded rows — every parameter
 * returned the full, unfiltered set. So sending them would be pure decoration.
 *
 * Client-side filtering is also what `DataTable` already does for search and paging, so this
 * stays consistent with the rest of the app. Switch to server params once the backend wires the
 * filter in — the shapes already match, so it is a small change here and nothing in the UI.
 */
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

/**
 * Applies the filter bar to a list of reports. Mirrors the backend filter's semantics exactly,
 * so behaviour will not change on the day we switch this over to the server.
 */
export function filterReports(
  rows: EmployeeReport[],
  f: EmployeeReportFilters,
): EmployeeReport[] {
  return rows.filter((r) => {
    if (f.status && r.status !== f.status) return false;
    if (f.order_id && String(r.order_id) !== String(f.order_id)) return false;
    // Backend does `problem_description LIKE %value%` — case-insensitive in MySQL's default
    // collation, so we lowercase both sides to match.
    if (f.search && !r.problem_description?.toLowerCase().includes(f.search.toLowerCase())) {
      return false;
    }
    // `whereDate` compares the DATE part only, so we slice the timestamp rather than
    // constructing Date objects — that also sidesteps timezone shifts moving a row a day.
    const day = r.created_at?.slice(0, 10);
    if (f.from_date && (!day || day < f.from_date)) return false;
    if (f.to_date && (!day || day > f.to_date)) return false;
    return true;
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
