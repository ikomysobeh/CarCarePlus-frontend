// The exact response envelope the backend returns (see docs/02-response-format.md).
// Every endpoint wraps its payload in this shape.
export interface ApiResponse<T> {
  status: 0 | 1; // 1 = success, 0 = failure (NOTE: a number, not a boolean)
  data: T | null;
  message: string;
  status_code: number;
  timestamp: string;
}

// Thrown by the API layer when a request fails (status 0 or HTTP >= 400).
export class ApiError extends Error {
  status_code: number;
  // Laravel field-validation errors (HTTP 422). Shape confirmed against the API.
  fieldErrors?: Record<string, string[]>;
  data?: unknown;

  constructor(
    message: string,
    status_code: number,
    fieldErrors?: Record<string, string[]>,
    data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status_code = status_code;
    this.fieldErrors = fieldErrors;
    this.data = data;
  }
}

// The role string returned in the user object.
export type Role =
  | 'super_admin'
  | 'admin'
  | 'workshop'
  | 'customer_personal'
  | 'customer_company'
  | 'employee_washer'
  | 'employee_mechanic';

// User object as returned by UserResource. `token` only present on login/register.
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  image_url: string | null;
  is_active: boolean;
  role: Role;
  token?: string;
}
