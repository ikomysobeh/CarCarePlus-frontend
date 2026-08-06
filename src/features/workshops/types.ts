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

export interface WorkshopInput {
  user_id?: number; // attach to an existing user; omit to create unattached
  name: string;
  name_ar: string;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
}
