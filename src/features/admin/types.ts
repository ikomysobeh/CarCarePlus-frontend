import type { EmployeeType } from '../../utils/enums';

// Shapes from the admin/approval endpoints (docs/03 §4). The pending lists were empty
// on the live server, so these follow the documented CompanyResource / WorkshopResource.

interface Owner {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
}

export interface Company {
  id: number;
  name: string;
  name_ar: string;
  commercial_reg: string;
  tax_number: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  is_active: boolean;
  owner?: Owner;
  created_at: string;
}

export interface Workshop {
  id: number;
  name: string;
  name_ar: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  status: 'pending' | 'approved' | 'rejected';
  rating_avg: number | null;
  owner?: Owner;
  created_at: string;
}

// POST /admin/employees — create a staff account.
export interface StaffInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  branch_id: number;
  type: EmployeeType; // washer | mechanic | admin
  is_active: boolean;
}

// --- M9: Admins CRUD (/api/admins) — see docs/09 ------------------------
// Branch-admin accounts. NOTE: no branch_id field on this endpoint yet, and
// image_url here is a plain STRING (not a file upload like Cars/Profile).
export interface Admin {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  image_url: string | null;
  is_active: boolean;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface AdminInput {
  name: string;
  email: string;
  phone?: string;
  password?: string; // required on create, optional on edit ("leave blank to keep")
  password_confirmation?: string; // Laravel's `confirmed` rule needs this sent alongside password
  is_active?: boolean;
  image_url?: string;
}
