// Shapes for Materials, Material Units, Inventories (stock levels), and Inventory
// Transactions (the append-only ledger) — see docs/10 §5.

export interface MaterialUnit {
  id: number;
  name: string;
  name_ar: string;
  is_decimal: boolean;
}
export interface MaterialUnitInput {
  name: string;
  name_ar: string;
  is_decimal?: boolean;
}

export interface Material {
  id: number;
  material_unit_id: number;
  unit?: MaterialUnit; // NOT loaded on the create response — only on show/update (docs/10 §5)
  name: string;
  name_ar: string;
  description: string | null;
  unit_price: number;
  is_vip_material: boolean;
  is_visible_to_customer: boolean; // new field, docs/11 §3
  is_active: boolean;
}
export interface MaterialInput {
  material_unit_id: number;
  name: string;
  name_ar: string;
  description?: string;
  unit_price: number;
  is_vip_material?: boolean;
  is_visible_to_customer?: boolean;
  is_active?: boolean;
}

// Stock level for one (branch, material) pair. NOT an audit trail — see InventoryTransaction
// below for the real ledger. This endpoint overwrites quantity directly.
export interface Inventory {
  id: number;
  branch_id: number;
  branch?: { id: number; name: string; name_ar: string };
  material_id: number;
  material?: Material;
  quantity: number;
  min_quantity: number;
  updated_at: string;
}
export interface InventoryInput {
  branch_id?: number; // required for super_admin; ignored/overridden server-side for admin
  material_id: number;
  quantity?: number;
  min_quantity?: number;
}

// The append-only stock ledger. `type` never includes 'transfer_in' as a value we SEND —
// it's system-generated only (sending it is rejected server-side).
export type InventoryTransactionType = 'in' | 'out' | 'transfer_out' | 'transfer_in';

export interface InventoryTransaction {
  id: number;
  branch_id: number;
  branch?: { id: number; name: string; name_ar: string };
  destination_branch_id: number | null;
  destination_branch?: { id: number; name: string; name_ar: string } | null;
  material_id: number;
  material?: Material;
  created_by: number;
  creator?: { id: number; name: string };
  type: InventoryTransactionType;
  quantity: number;
  quantity_before: number;
  quantity_after: number;
  reference_id: string | null;
  note: string | null;
  created_at: string;
}

// What we're allowed to SEND — 'transfer_in' is deliberately excluded from this type.
export interface InventoryTransactionInput {
  branch_id?: number; // required for super_admin; ignored/overridden for admin
  destination_branch_id?: number; // required when type=transfer_out, prohibited otherwise
  material_id: number;
  type: 'in' | 'out' | 'transfer_out';
  quantity: number;
  reference_id?: string;
  note?: string;
}
