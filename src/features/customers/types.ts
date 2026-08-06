// Two DIFFERENT resources under one screen (see docs/10 §2) — don't unify them into one
// type. Personal customers are User-shaped; Company customers are *meant* to be
// Company-shaped (with a nested owner), but as of docs/10 §2 there's a live backend bug:
// the resource reads Company fields off a User instance, so name_ar/commercial_reg/
// tax_number/address/status/owner all come back null or missing today. Typed as nullable
// here on purpose — render every one of them with a `?? '—'` fallback in the UI so the
// screen degrades gracefully instead of assuming data that isn't actually there yet.

export interface PersonalCustomer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  image_url: string | null;
  is_active: boolean;
  role: 'customer_personal';
  created_at: string;
  updated_at: string;
}

interface CompanyOwner {
  id: number;
  name: string;
  email: string;
  phone: string | null;
}

export interface CompanyCustomer {
  id: number;
  name: string; // currently the underlying USER's name, not the company's, due to the bug
  name_ar: string | null; // ⚠️ null today — see docs/10 §2
  commercial_reg: string | null; // ⚠️ null today
  tax_number: string | null; // ⚠️ null today
  address: string | null; // ⚠️ null today
  status: 'pending' | 'approved' | 'rejected' | null; // ⚠️ null today
  is_active: boolean;
  owner?: CompanyOwner; // ⚠️ missing entirely today
  created_at: string;
  updated_at: string;
}

// Same update shape for both resources (only super_admin ever sends this — see permissions).
export interface CustomerUpdateInput {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  is_active?: boolean;
  image_url?: string;
}
