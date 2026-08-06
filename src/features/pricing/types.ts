// Shapes for the dynamic pricing engine (see docs/09). `conditions` is free-form JSON whose
// shape depends on `pricing_rule_type_id` (e.g. { "vehicle_type": "SUV" }) — we edit it as a
// raw JSON textarea rather than structured fields until the backend documents a fixed shape.

export interface PricingRuleType {
  id: number;
  name: string;
  name_ar: string;
}
export interface PricingRuleTypeInput {
  name: string;
  name_ar: string;
}

export interface PricingRule {
  id: number;
  pricing_rule_type_id: number;
  rule_type?: PricingRuleType;
  name: string;
  name_ar: string;
  value: number;
  conditions: Record<string, unknown> | null;
  is_active: boolean;
}
export interface PricingRuleInput {
  pricing_rule_type_id: number;
  name: string;
  name_ar: string;
  value: number;
  conditions?: Record<string, unknown>;
  is_active?: boolean;
}
