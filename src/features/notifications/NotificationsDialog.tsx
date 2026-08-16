import { Box, Button, CloseButton, Dialog, HStack, Portal, Stack, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { EmptyState, ErrorState, Loader } from '../../components';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from './api';
import type { AppNotification } from './types';

// Maps the backend's `type` onto a Chakra colour palette. Unknown values fall back to `gray`
// rather than breaking — the enum lives server-side and may grow without us.
const TYPE_PALETTE: Record<string, string> = {
  success: 'green',
  info: 'blue',
  warning: 'orange',
  error: 'red',
};

function NotificationRow({
  item,
  onRead,
  busy,
}: {
  item: AppNotification;
  onRead: (id: number) => void;
  busy: boolean;
}) {
  const { t } = useTranslation();
  const palette = TYPE_PALETTE[item.type ?? ''] ?? 'gray';
  return (
    <HStack
      align="start"
      gap={3}
      p={4}
      rounded="badge"
      borderWidth="1px"
      borderColor="line"
      // Unread rows get the tinted background so a full panel is scannable at a glance;
      // read ones recede to plain surface.
      bg={item.is_read ? 'surface' : 'navActiveBg'}
    >
      <Box
        mt={1.5}
        w="8px"
        h="8px"
        rounded="full"
        flexShrink={0}
        bg={item.is_read ? 'transparent' : `${palette}.500`}
        borderWidth={item.is_read ? '1px' : undefined}
        borderColor="line"
      />
      <Stack gap={1} flex="1" minW={0}>
        <Text fontSize="sm" fontWeight={item.is_read ? '500' : '700'} color="fg">
          {item.title}
        </Text>
        <Text fontSize="sm" color="fgMuted">
          {item.body}
        </Text>
        <Text fontSize="xs" color="fgMuted">
          {item.created_at}
        </Text>
      </Stack>
      {!item.is_read && (
        <Button size="xs" variant="ghost" disabled={busy} onClick={() => onRead(item.id)}>
          {t('notifications.markRead')}
        </Button>
      )}
    </HStack>
  );
}

export default function NotificationsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  // Only fetches while the panel is open — the badge count polls separately and cheaply.
  const list = useNotifications(open);
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const rows = list.data ?? [];
  const unreadCount = rows.filter((n) => !n.is_read).length;
  const busy = markRead.isPending || markAll.isPending;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
      size="md"
      placement="center"
      scrollBehavior="inside"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg="surface" color="fg" rounded="card">
            <Dialog.Header>
              <Dialog.Title>{t('notifications.title')}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              {list.isLoading ? (
                <Loader />
              ) : list.error ? (
                <ErrorState error={list.error} onRetry={list.refetch} />
              ) : rows.length === 0 ? (
                <EmptyState message={t('notifications.empty')} />
              ) : (
                <Stack gap={3}>
                  {rows.map((n) => (
                    <NotificationRow
                      key={n.id}
                      item={n}
                      busy={busy}
                      onRead={(id) => markRead.mutate(id)}
                    />
                  ))}
                </Stack>
              )}
            </Dialog.Body>
            <Dialog.Footer gap={2}>
              <Button
                variant="ghost"
                disabled={busy || unreadCount === 0}
                loading={markAll.isPending}
                onClick={() => markAll.mutate()}
              >
                {t('notifications.markAllRead')}
              </Button>
              <Button colorPalette="brand" onClick={onClose}>
                {t('common.close', { defaultValue: 'Close' })}
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
