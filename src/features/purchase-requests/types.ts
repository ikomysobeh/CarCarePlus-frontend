// Shapes for Purchase Requests (see docs/12 §M17). Branch procurement: an admin raises a
// request (materials + quantities + unit prices); a super_admin approves/rejects, or does a
// direct branch-to-branch transfer.
import type { PurchaseRequestStatus } from '../../utils/enums';

interface BranchRef {
  id: number;
  name: string;
  name_ar: string;
}

export interface PurchaseRequestItem {
  id: number;
  purchase_req_id: number;
  material_id: number;
  material?: { id: number; name: string; name_ar: string };
  quantity: number;
  unit_price: string;
  total_price: string;
}

export interface PurchaseRequest {
  id: number;
  branch_id: number | null;
  branch?: BranchRef;
  from_branch_id: number | null;
  from_branch?: BranchRef;
  status: PurchaseRequestStatus;
  total_amount: string;
  notes: string | null;
  request_type: string; // 'purchase' | 'transfer'
  rejection_reason: string | null;
  approved_at: string | null;
  items?: PurchaseRequestItem[];
  created_at: string | null;
  updated_at: string | null;
}

// POST/PUT body — items REPLACES the whole set when sent.
export interface PurchaseRequestInput {
  notes?: string;
  items: { material_id: number; quantity: number; unit_price: number }[];
}

// POST /purchase-requests/transfer — no unit_price on transfers.
export interface TransferInput {
  from_branch_id: number;
  to_branch_id: number;
  notes?: string;
  items: { material_id: number; quantity: number }[];
}
