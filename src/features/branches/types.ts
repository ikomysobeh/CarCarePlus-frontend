// Shapes for the Branches resource (see docs/10 §1). Creating a branch requires an
// existing admin_id (a user already holding the `admin` role) — see the bootstrap note
// in BranchFormDialog.tsx.

interface Manager {
  id: number;
  name: string;
  email: string;
}

export interface Branch {
  id: number;
  admin_id: number;
  manager?: Manager;
  name: string;
  name_ar: string;
  city: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  phone: string;
  is_active: boolean;
  working_hours: Record<string, unknown> | null;
  is_24h: boolean;
}

export interface BranchInput {
  admin_id: number;
  name: string;
  name_ar: string;
  city: string;
  address: string;
  latitude?: number;
  longitude?: number;
  phone: string;
  is_active?: boolean;
  is_24h?: boolean;
}
