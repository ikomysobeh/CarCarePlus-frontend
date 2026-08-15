// Shapes for Spare Part Requests (see docs/12 §M18). Read-only in this dashboard: field
// staff create them, customers approve/reject from their own app.
import type { SparePartRequestStatus } from '../../utils/enums';

export interface SparePartRequest {
  id: number;
  order_id: number;
  employee_id: number | null;
  material_id: number;
  material?: { id: number; name: string; name_ar: string };
  quantity: number;
  specifications: string | null;
  status: SparePartRequestStatus;
  notes: string | null;
  decided_at: string | null;
  created_at: string | null;
}
