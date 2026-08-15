// Shapes for Ratings (see docs/12 §M20). Read-only in this dashboard — customers create/
// update ratings from their own app.

interface RatingPerson {
  id: number;
  name: string;
}

export interface Rating {
  id: number;
  order_id: number;
  customer_id: number;
  customer?: RatingPerson;
  employee_id: number | null;
  employee?: { id: number; user?: RatingPerson };
  service_rating: number;
  employee_rating: number | null;
  workshop_rating: number | null;
  comment: string | null;
  image_urls: string[];
  created_at: string | null;
}
