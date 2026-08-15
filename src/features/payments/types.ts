// Shapes for Payments (see docs/12 §M19). Read + a single "confirm cash" action.
import type { PaymentMethod, PaymentStatus, PaymentType } from '../../utils/enums';

export interface Payment {
  id: number;
  payment_number: string;
  type: PaymentType;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: string; // decimal-as-string, same convention as everywhere else
  points_used: number;
  order_id: number | null;
}
