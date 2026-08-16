// Shapes for the Workshops resource (see docs/10 §3). Full CRUD exists, but `admin` is
// explicitly blocked from writing server-side (403) even though it can read the list.

interface WorkshopOwner {
  id: number;
  name: string;
  email: string;
  phone: string | null;
}

export interface Workshop {
  id: number;
  name: string;
  name_ar: string;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  status: 'pending' | 'approved' | 'rejected';
  rating_avg: number | null;
  owner?: WorkshopOwner;
  created_at: string;
}

// A `workshop`-role account that doesn't own a workshop yet — the options of the owner
// dropdown on create (GET /workshops/owner-candidates, a UserResource collection).
export interface WorkshopOwnerCandidate {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
}

export interface WorkshopInput {
  // Required on CREATE (workshops.user_id is NOT NULL); never sent on UPDATE — the API
  // refuses to reassign an existing workshop's owner.
  user_id?: number;
  name: string;
  name_ar: string;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
}
