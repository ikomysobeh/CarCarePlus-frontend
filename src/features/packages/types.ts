// Shapes for the Packages domain (mirrors docs/08). Prices arrive as STRINGS from the API
// (same "decimal as string" pattern as Service.base_price) — convert with z.coerce.number on input.
import type { PackageType } from '../../utils/enums';
import type { Service, SubService } from '../catalog/types';

// --- Package (a subscription plan) ---------------------------------------
export interface Package {
  id: number;
  name: string;
  description: string | null;
  type: PackageType;
  is_company_package: boolean; // new field, docs/11 §3 — filters which customers can see it
  price: string; // decimal-as-string
  discount_pct: string; // decimal-as-string
  services_count: number;
  valid_days: number;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}
export interface PackageInput {
  name: string;
  description?: string;
  type: PackageType;
  is_company_package?: boolean;
  price: number;
  discount_pct?: number;
  services_count: number;
  valid_days: number;
  is_active: boolean;
}

// --- Package Service (a service included in a package, with an allowance) --
export interface PackageService {
  id: number;
  package_id: number;
  package?: Package;
  service_id: number;
  service?: Service;
  allowed_count: number;
}
export interface PackageServiceInput {
  package_id: number;
  service_id: number;
  allowed_count: number;
}

// --- Package Service Sub-Service (a sub-service under a package-service) ---
export interface PackageServiceSubService {
  id: number;
  package_service_id: number;
  package_service?: PackageService;
  sub_service_id: number;
  sub_service?: SubService;
  price_override: string | null; // decimal-as-string
  is_active: boolean;
}
export interface PackageServiceSubServiceInput {
  package_service_id: number;
  sub_service_id: number;
  price_override?: number;
  is_active: boolean;
}
