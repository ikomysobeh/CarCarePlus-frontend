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
