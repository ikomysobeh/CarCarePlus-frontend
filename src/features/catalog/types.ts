// Shapes for the Categories resource (mirrors the API — see docs/03 section 5).

// A category as returned by the API.
export interface Category {
  id: number;
  name: string;
  name_ar: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

// The payload we SEND when creating/updating a category.
export interface CategoryInput {
  name: string;
  name_ar: string;
  description?: string;
  is_active: boolean;
}

// --- Services -------------------------------------------------------------
// Note: prices arrive as strings ("120.00"); Services have NO is_active field.
export interface Service {
  id: number;
  category_id: number;
  category?: Category;
  name: string;
  name_ar: string;
  description: string | null;
  base_price: string;
  is_vip_available: boolean;
  vip_extra_price: string | null;
  duration_minutes: number;
}
export interface ServiceInput {
  category_id: number;
  name: string;
  name_ar: string;
  description?: string;
  base_price: number;
  is_vip_available: boolean;
  vip_extra_price?: number;
  duration_minutes: number;
}

// --- Sub-services ---------------------------------------------------------
export interface SubService {
  id: number;
  service_id: number;
  service?: Service;
  name: string;
  name_ar: string;
  description: string | null;
  price: string;
  is_active: boolean;
}
export interface SubServiceInput {
  service_id: number;
  name: string;
  name_ar: string;
  description?: string;
  price: number;
  is_active: boolean;
}

// --- Car types ------------------------------------------------------------
export interface CarType {
  id: number;
  name: string;
  name_ar: string;
  price_multiplier: string;
  is_active: boolean;
}
export interface CarTypeInput {
  name: string;
  name_ar: string;
  price_multiplier?: number;
  is_active: boolean;
}

// --- Car brands -----------------------------------------------------------
// Car brands have NO name_ar; `logo` is a path/URL string.
export interface CarBrand {
  id: number;
  name: string;
  logo: string | null;
  is_active: boolean;
}
export interface CarBrandInput {
  name: string;
  logo?: string;
  is_active: boolean;
}
