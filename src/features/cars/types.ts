import type { FuelType } from '../../utils/enums';

// A car as returned by the API (CarResource). owner/car_type/branch are eager-loaded;
// note there is NO `brand` object — only `brand_id` (we map it via the car-brands list).
// `year` arrives as a string.
export interface Car {
  id: number;
  user_id: number;
  brand_id: number;
  car_type_id: number;
  branch_id: number;
  plate_number: string;
  model: string;
  year: string;
  color: string;
  fuel_type: FuelType;
  cylinders: number | null;
  mileage: number | null;
  image_url: string | null;
  is_active: boolean;
  owner?: { id: number; name: string; email: string; phone: string | null; role: string };
  car_type?: { id: number; name: string; name_ar: string };
  branch?: { id: number; name: string; name_ar: string; city: string };
  created_at: string;
  updated_at: string;
}

// The body we SEND when creating/updating a car (customer_id goes in the URL, not here).
// `image` is a File (new upload) or null. Sent as multipart/form-data.
export interface CarInput {
  brand_id: number;
  car_type_id: number;
  branch_id: number;
  plate_number: string;
  model: string;
  year: number;
  color: string;
  fuel_type: FuelType;
  cylinders?: number;
  mileage?: number;
  image?: File | null;
  is_active?: boolean;
}
