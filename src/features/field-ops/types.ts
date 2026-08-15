// Shapes for Field Ops (see docs/12 §M22): employee reports + GPS logs. Read-only here —
// employees create these from the field; this dashboard just reviews them.
import type { EmployeeReportStatus } from '../../utils/enums';

interface EmployeeRef {
  id: number;
  user?: { id: number; name: string };
}

export interface EmployeeReport {
  id: number;
  order_id: number;
  employee_id: number | null;
  employee?: EmployeeRef;
  problem_description: string;
  affected_parts: string[] | null;
  images: string[] | null;
  recommendation: string | null;
  status: EmployeeReportStatus;
  reviewed_at: string | null;
  created_at: string | null;
}

export interface GpsLog {
  id: number;
  employee_id: number | null;
  employee?: EmployeeRef;
  order_id: number | null;
  latitude: number;
  longitude: number;
  recorded_at: string | null;
  created_at: string | null;
}
