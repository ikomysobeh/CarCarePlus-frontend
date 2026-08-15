// Shapes for Orders/Bookings (see docs/11 §2). This is the admin/staff-facing side of the
// feature only — the customer-facing quote→confirm flow (POST /bookings/quote + /confirm)
// is out of scope for this dashboard (that's the mobile app's job, per the project split).
import type { OrderStatus, PaymentMethod, PaymentStatus, PaymentType } from '../../utils/enums';
import type { Branch } from '../branches/types';
import type { Car } from '../cars/types';
import type { Category, Service } from '../catalog/types';

interface OrderPerson {
  id: number;
  name: string;
  email: string;
  phone: string | null;
}

export interface OrderPriceItem {
  id: number;
  pricing_rule_id: number | null;
  label: string;
  amount: string; // decimal-as-string, same convention as everywhere else
}

export interface OrderPayment {
  id: number;
  payment_number: string;
  type: PaymentType;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: string;
  points_used: number;
}

// Relations (customer/car/branch/employee/service/category) only appear when the backend
// eager-loads them — same `whenLoaded()` convention as every other resource in this app.
export interface Order {
  id: number;
  booking_group_id: string | null;

  customer_id: number;
  customer?: OrderPerson;

  company_id: number | null;

  car_id: number;
  car?: Car;

  branch_id: number | null;
  branch?: Branch;

  employee_id: number | null;
  employee?: OrderPerson;

  service_id: number;
  service?: Service;

  category_id: number;
  category?: Category;

  booking_type: boolean; // immediate vs. scheduled — replaced the old OrderType enum
  is_vip: boolean;
  status: OrderStatus;

  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  assigned_at: string | null;

  location_lat: number | null;
  location_lng: number | null;
  location_address: string | null;
  distance_km: number | null;

  discount_amount: string;
  total_price: string;
  price_items: OrderPriceItem[];
  payments: OrderPayment[];

  notes: string | null;
  created_at: string;
  updated_at: string;
}

// POST /bookings/{id}/assign
export interface AssignOrderInput {
  employee_id: number;
}

// DELETE /bookings/{id} (cancel_reason is nullable — sent in the body)
export interface CancelOrderInput {
  cancel_reason?: string;
}

// --- M16: booking detail sub-resources (see docs/12 §M16) ---

interface EmployeeRef {
  id: number;
  user?: { id: number; name: string };
}

// GET /bookings/{id}/status-history
export interface OrderStatusHistory {
  id: number;
  order_id: number;
  employee_id: number | null;
  employee?: EmployeeRef;
  from_status: string | null;
  to_status: string;
  note: string | null;
  created_at: string | null;
}

// GET /bookings/{id}/price-items → { price_items, total_items_price }
export interface PriceItemsResult {
  price_items: OrderPriceItem[];
  total_items_price: string;
}

// GET /bookings/{id}/sub-services
export interface OrderSubServiceRow {
  id: number;
  sub_service_id: number;
  sub_service?: { id: number; name: string; name_ar: string };
  price: string;
  covered_by_package: boolean;
  status: string;
  notes: string | null;
  checked_at: string | null;
}
export interface SubServicesResult {
  sub_services: OrderSubServiceRow[];
  total_sub_service_price: string;
}

// GET /bookings/{id}/materials
export interface OrderMaterialRow {
  id: number;
  material_id: number;
  material?: { id: number; name: string; name_ar: string };
  requested_by: number | null;
  quantity: number;
  unit_price: string;
  total_price: string;
  status: string;
  approved_at: string | null;
}
export interface MaterialsResult {
  materials: OrderMaterialRow[];
  total_materials_price: string;
}

// GET/POST /bookings/{id}/maintenance-detail (null until set)
export interface MaintenanceDetail {
  id: number;
  order_id: number;
  workshop_id: number | null;
  notes: string | null;
  created_at: string | null;
}
export interface MaintenanceDetailInput {
  workshop_id?: number;
  notes?: string;
}

// GET/POST /bookings/{id}/road-detail
export interface RoadDetail {
  id: number;
  order_id: number;
  problem_type_id: number | null;
  car_type_size: string | null;
  problem_description: string | null;
  problem_image_url: string | null;
  ai_diagnosis: string | null;
  created_at: string | null;
}
export interface RoadDetailInput {
  problem_type_id?: number;
  car_type_size?: string;
  problem_description?: string;
  problem_image_url?: string;
  ai_diagnosis?: string;
}

// GET/POST /bookings/{id}/towing-detail
export interface TowingDetail {
  id: number;
  order_id: number;
  car_type_size: string | null;
  destination_lat: number | null;
  destination_lng: number | null;
  destination_address: string | null;
  notes: string | null;
  created_at: string | null;
}
export interface TowingDetailInput {
  car_type_size?: string;
  destination_lat?: number;
  destination_lng?: number;
  destination_address?: string;
  notes?: string;
}
