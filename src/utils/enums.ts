// Backend enum values (see docs/05-enums-reference.md). Send the `value`; the
// label is for display and should ultimately come from i18n.

export const FUEL_TYPES = ['petrol', 'diesel', 'electric', 'hybrid'] as const;
export type FuelType = (typeof FUEL_TYPES)[number];

export const EMPLOYEE_TYPES = ['washer', 'mechanic', 'admin'] as const;
export type EmployeeType = (typeof EMPLOYEE_TYPES)[number];

export const REGISTRATION_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];

export const WORKSHOP_STATUSES = [
  'pending',
  'approved',
  'rejected',
  'active',
  'inactive',
  'suspended',
] as const;
export type WorkshopStatus = (typeof WORKSHOP_STATUSES)[number];

// --- M15: Orders/Bookings (see docs/11 §2 — the backend enum values match exactly what
// we guessed back in M0/M7, so nothing here needed to change now that it's wired up) ---
export const ORDER_STATUSES = [
  'pending',
  'assigned',
  'in_progress',
  'completed',
  'cancelled',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_METHODS = ['cash', 'card', 'wallet', 'point', 'package'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

// `spare` added by backend commit d880a3a (migration add_spare_part_to_payments): approving a
// spare-part request now auto-creates a PENDING payment, collected on delivery.
export const PAYMENT_TYPES = ['order', 'package', 'wallet_topup', 'spare'] as const;
export type PaymentType = (typeof PAYMENT_TYPES)[number];

// --- M8: Packages & Points (see docs/08) ---
export const PACKAGE_TYPES = ['weekly', 'monthly', 'company'] as const;
export type PackageType = (typeof PACKAGE_TYPES)[number];

export const USER_PACKAGE_STATUSES = ['active', 'expired', 'cancelled', 'suspended'] as const;
export type UserPackageStatus = (typeof USER_PACKAGE_STATUSES)[number];

export const POINTS_TX_TYPES = ['earn', 'redeem'] as const;
export type PointsTxType = (typeof POINTS_TX_TYPES)[number];

// --- M14: Settings group (see docs/10 §9) ---
export const SUGGESTED_PROBLEM_CATEGORIES = [
  'engine',
  'brakes',
  'electrical',
  'tires',
  'mechanical',
  'locksmith',
] as const;
export type SuggestedProblemCategory = (typeof SUGGESTED_PROBLEM_CATEGORIES)[number];

export const SYSTEM_SETTING_TYPES = ['string', 'number', 'boolean', 'json'] as const;
export type SystemSettingType = (typeof SYSTEM_SETTING_TYPES)[number];

export const AI_RULE_TYPES = [
  'maintenance',
  'recommendation',
  'warning',
  'promotion',
  'upsell',
  'diagnosis',
] as const;
export type AiRuleType = (typeof AI_RULE_TYPES)[number];

// NOT the same thing as catalog's `CarType` (a real relation, `car_type_id` on Car) — this is
// a separate fixed enum used only by AI Rules' `car_type` column. Confirmed against the backend
// model cast (App\Enums\CarEnums\CarTypeSize) — don't merge these two concepts.
export const CAR_TYPE_SIZES = ['sedan', 'suv', 'hatchback', 'pickup'] as const;
export type CarTypeSizeEnum = (typeof CAR_TYPE_SIZES)[number];

// --- M17/M18: procurement & spare parts (see docs/12) ---
export const PURCHASE_REQUEST_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type PurchaseRequestStatus = (typeof PURCHASE_REQUEST_STATUSES)[number];

export const SPARE_PART_REQUEST_STATUSES = [
  'pending',
  'approved',
  'rejected',
  'ordered',
  'received',
] as const;
export type SparePartRequestStatus = (typeof SPARE_PART_REQUEST_STATUSES)[number];

// --- M21: wallet transactions (see docs/12 §M21) ---
export const WALLET_TX_TYPES = ['credit', 'debit'] as const;
export type WalletTxType = (typeof WALLET_TX_TYPES)[number];

export const WALLET_TX_REASONS = ['order_payment', 'refund', 'topup', 'adjustment'] as const;
export type WalletTxReason = (typeof WALLET_TX_REASONS)[number];

// --- M22: employee reports (see docs/12 §M22) ---
export const EMPLOYEE_REPORT_STATUSES = ['pending', 'reviewed', 'approved', 'rejected'] as const;
export type EmployeeReportStatus = (typeof EMPLOYEE_REPORT_STATUSES)[number];
