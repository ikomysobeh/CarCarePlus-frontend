// Shapes for in-app notifications (backend commit 6b4b477, NotificationResource).
//
// These rows are produced server-side by the queue — `php artisan queue:work` must be running
// or nothing is ever written. There is no create/delete endpoint exposed to us: the dashboard
// only reads them and flips them to read.

// `type` drives the colour of the row's dot. The backend enum is open-ended, so anything we
// don't recognise falls back to a neutral tone rather than crashing the render.
export type NotificationType = 'success' | 'info' | 'warning' | 'error';

export interface AppNotification {
  id: number;
  title: string;
  body: string;
  type: NotificationType | string | null;
  /** What the notification is about, e.g. 'purchase_request' — used for the deep link. */
  reference_type: string | null;
  reference_id: number | null;
  is_read: boolean;
  read_at: string | null;
  /** Channels the backend actually delivered through, e.g. ['mail','in_app']. */
  sent_via: string[] | null;
  created_at: string;
}

export interface UnreadCount {
  unread_count: number;
}
