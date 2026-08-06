// Shapes for customer subscriptions (user-packages) and loyalty points (see docs/08 §4–5).
import type { UserPackageStatus, PointsTxType } from '../../utils/enums';
import type { Package } from '../packages/types';

// A customer's subscription to a package.
export interface UserPackage {
  id: number;
  user_id: number;
  package_id: number;
  package?: Package;
  start_date: string | null;
  end_date: string | null;
  remaining_count: number;
  status: UserPackageStatus;
  created_at: string;
}
// Create: pick a package (status is optional, server defaults it).
export interface UserPackageInput {
  package_id: number;
  status?: UserPackageStatus;
}
// Update: only the mutable fields.
export interface UserPackageUpdateInput {
  remaining_count?: number;
  status?: UserPackageStatus;
}

// Loyalty points balance for one customer.
export interface PointsBalance {
  id: number;
  customer_id: number;
  balance: number;
}

// One points transaction (earn/redeem).
export interface PointsTransaction {
  id: number;
  customer_id: number;
  type: PointsTxType;
  points: number;
  balance_before: number;
  balance_after: number;
  expires_at: string | null;
  note: string | null;
  created_at: string;
}
