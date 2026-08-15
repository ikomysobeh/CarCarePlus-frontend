import { useState } from 'react';
import { Box, Button, HStack, IconButton } from '@chakra-ui/react';
import { MdPersonAdd, MdPlayArrow, MdCheck, MdClose, MdVisibility } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { PageHeader, DataTable, StatusChip, ConfirmDialog, type Column } from '../../components';
import { useAuth } from '../../auth/AuthContext';
import { canAssignOrders, canEditOrderStatus, canCancelOrders } from '../../utils/permissions';
import { useOrders, useStartOrder, useCompleteOrder, useCancelOrder } from './api';
import AssignOrderDialog from './AssignOrderDialog';
import CancelOrderDialog from './CancelOrderDialog';
import OrderDetailsDialog from './OrderDetailsDialog';
import type { Order } from './types';

// Orders/Bookings (see docs/11 §2). The customer-facing quote→confirm flow that CREATES a
// booking is deliberately NOT built here — that's the mobile app's job. This screen is the
// admin/staff operations console: view (auto-scoped per role by the backend) + the 4 status
// actions (assign/start/complete/cancel), each gated by both role AND the order's current
// status (e.g. "Start" only makes sense once a booking is already assigned).
export default function OrdersPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const role = user?.role;
  const canAssign = role ? canAssignOrders(role) : false;
  const canEditStatus = role ? canEditOrderStatus(role) : false;
  const canCancel = role ? canCancelOrders(role) : false;

  const { data, isLoading, error, refetch } = useOrders();
  const start = useStartOrder();
  const complete = useCompleteOrder();
  const cancel = useCancelOrder();

  const [assigning, setAssigning] = useState<Order | null>(null);
  const [starting, setStarting] = useState<Order | null>(null);
  const [completing, setCompleting] = useState<Order | null>(null);
  const [cancelling, setCancelling] = useState<Order | null>(null);
  const [viewing, setViewing] = useState<Order | null>(null);

  const columns: Column<Order>[] = [
    { key: 'id', header: t('orders.id') },
    { key: 'customer', header: t('field.name'), render: (o) => o.customer?.name ?? `#${o.customer_id}` },
    {
      key: 'car',
      header: t('orders.car'),
      render: (o) => (o.car ? `${o.car.plate_number} · ${o.car.model}` : `#${o.car_id}`),
    },
    { key: 'branch', header: t('cars.branch'), render: (o) => o.branch?.name_ar ?? (o.branch_id ? `#${o.branch_id}` : '—') },
    { key: 'service', header: t('catalog.services'), render: (o) => o.service?.name_ar ?? `#${o.service_id}` },
    { key: 'status', header: t('field.status'), render: (o) => <StatusChip status={o.status} /> },
    { key: 'total_price', header: t('field.price'), render: (o) => o.total_price },
    {
      key: 'scheduled_at',
      header: t('orders.scheduledAt'),
      render: (o) => (o.scheduled_at ? new Date(o.scheduled_at).toLocaleString() : t('orders.immediate')),
    },
  ];

  columns.push({
    key: 'actions',
    header: '',
    align: 'right',
    render: (o) => (
      <HStack justify="flex-end" gap={1}>
        <IconButton aria-label={t('orderDetail.view')} size="sm" variant="ghost" onClick={() => setViewing(o)}>
          <MdVisibility />
        </IconButton>
        {(canAssign || canEditStatus || canCancel) && (
          <>
            {canAssign && o.status === 'pending' && (
            <Button size="xs" variant="outline" onClick={() => setAssigning(o)}>
              <MdPersonAdd /> {t('orders.assign')}
            </Button>
          )}
          {canEditStatus && o.status === 'assigned' && (
            <Button size="xs" variant="outline" onClick={() => setStarting(o)}>
              <MdPlayArrow /> {t('orders.start')}
            </Button>
          )}
          {canEditStatus && o.status === 'in_progress' && (
            <Button size="xs" variant="outline" colorPalette="green" onClick={() => setCompleting(o)}>
              <MdCheck /> {t('orders.complete')}
            </Button>
          )}
          {canCancel && o.status !== 'completed' && o.status !== 'cancelled' && (
              <Button size="xs" variant="outline" colorPalette="red" onClick={() => setCancelling(o)}>
                <MdClose /> {t('common.cancel')}
              </Button>
            )}
          </>
        )}
      </HStack>
    ),
  });

  return (
    <Box>
      <PageHeader title={t('nav.orders')} subtitle={t('orders.hint')} />
      <DataTable
        columns={columns}
        rows={data ?? []}
        getRowId={(o) => o.id}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        emptyMessage={t('orders.empty')}
      />

      <OrderDetailsDialog order={viewing} onClose={() => setViewing(null)} />

      <AssignOrderDialog open={!!assigning} order={assigning} onClose={() => setAssigning(null)} />

      <ConfirmDialog
        open={!!starting}
        title={t('orders.startTitle')}
        message={t('orders.startMessage')}
        loading={start.isPending}
        onConfirm={() => { if (starting) start.mutate(starting.id, { onSettled: () => setStarting(null) }); }}
        onClose={() => setStarting(null)}
      />
      <ConfirmDialog
        open={!!completing}
        title={t('orders.completeTitle')}
        message={t('orders.completeMessage')}
        loading={complete.isPending}
        onConfirm={() => { if (completing) complete.mutate(completing.id, { onSettled: () => setCompleting(null) }); }}
        onClose={() => setCompleting(null)}
      />
      <CancelOrderDialog
        open={!!cancelling}
        loading={cancel.isPending}
        onConfirm={(reason) => {
          if (cancelling) {
            cancel.mutate(
              { id: cancelling.id, input: reason ? { cancel_reason: reason } : {} },
              { onSettled: () => setCancelling(null) },
            );
          }
        }}
        onClose={() => setCancelling(null)}
      />
    </Box>
  );
}
