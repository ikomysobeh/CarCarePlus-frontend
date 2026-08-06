// Shapes for the M14 "Settings group" resources (see docs/10 §9). Four small, unrelated
// lookup/config CRUDs sharing one nav slot and one page — same reasoning as CatalogPage.
import type { SuggestedProblemCategory, SystemSettingType, AiRuleType, CarTypeSizeEnum } from '../../utils/enums';
import type { FuelType } from '../../utils/enums';
import type { CarBrand } from '../catalog/types';

// --- Problem Types ----------------------------------------------------------
export interface ProblemType {
  id: number;
  name: string;
  name_ar: string;
  is_active: boolean;
}
export interface ProblemTypeInput {
  name: string;
  name_ar: string;
  is_active: boolean;
}

// --- Suggested Problems ------------------------------------------------------
export interface SuggestedProblem {
  id: number;
  name: string;
  name_ar: string;
  description: string | null;
  category: SuggestedProblemCategory;
}
export interface SuggestedProblemInput {
  name: string;
  name_ar: string;
  description?: string;
  category: SuggestedProblemCategory;
}

// --- System Settings ---------------------------------------------------------
// `value` is always a plain string on the wire — the `type` field is a hint for how the
// consumer (backend/AI layer) should interpret it, this screen doesn't parse/validate it.
export interface SystemSetting {
  id: number;
  key: string;
  value: string;
  type: SystemSettingType;
  description: string | null;
  updated_at: string;
}
export interface SystemSettingInput {
  key: string;
  value: string;
  type: SystemSettingType;
  description?: string;
}

// --- AI Rules -----------------------------------------------------------------
// `car_type`/`fuel_type` here are fixed enums (CarTypeSize/FuelType casts on the backend
// model) — NOT the catalog CarType relation used by Cars/Services. See utils/enums.ts.
export interface AiRule {
  id: number;
  brand_id: number | null;
  brand?: CarBrand;
  name: string;
  name_ar: string;
  type: AiRuleType;
  condition_key: string | null;
  condition_value: string | null;
  car_type: CarTypeSizeEnum | null;
  fuel_type: FuelType | null;
  response_template: string;
  is_active: boolean;
}
export interface AiRuleInput {
  brand_id?: number;
  name: string;
  name_ar: string;
  type: AiRuleType;
  condition_key?: string;
  condition_value?: string;
  car_type?: CarTypeSizeEnum;
  fuel_type?: FuelType;
  response_template: string;
  is_active?: boolean;
}
