import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http, unwrap, ALL_ROWS_PARAMS } from '../../api/client';
import { endpoints } from '../../api/endpoints';
import type { ApiResponse } from '../../api/types';
import type { AppNotification, UnreadCount } from './types';

// React Query hooks for in-app notifications (M28).

export const notificationKeys = {
  all: ['notifications'] as const,
  list: ['notifications', 'list'] as const,
  unread: ['notifications', 'unread-count'] as const,
};

// How often to re-check the badge. 60s is a deliberate compromise: the backend has no
// websocket/SSE channel, so polling is the only way to notice a new notification, and a
// tighter interval would hammer the API for a number that rarely changes.
const POLL_MS = 60_000;

/**
 * Unread badge count. Polls in the background and keeps polling while the tab is hidden is
 * disabled by default in React Query, so a backgrounded tab stops costing requests.
 */
export function useUnreadCount(enabled: boolean) {
  return useQuery({
    enabled,
    queryKey: notificationKeys.unread,
    refetchInterval: POLL_MS,
    queryFn: () =>
      unwrap<UnreadCount>(
        http.get<ApiResponse<UnreadCount>>(endpoints.notifications.unreadCount),
      ),
  });
}

/** The list itself — only fetched while the panel is actually open. */
export function useNotifications(enabled: boolean) {
  return useQuery({
    enabled,
    queryKey: notificationKeys.list,
    queryFn: () =>
      unwrap<AppNotification[]>(
        http.get<ApiResponse<AppNotification[]>>(endpoints.notifications.index, {
          params: ALL_ROWS_PARAMS,
        }),
      ),
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => http.post(endpoints.notifications.markRead(id)),
    // `notificationKeys.all` is a prefix of both the list and the badge, so one invalidate
    // refreshes the row AND the count — they must never disagree.
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => http.post(endpoints.notifications.markAllRead),
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}
