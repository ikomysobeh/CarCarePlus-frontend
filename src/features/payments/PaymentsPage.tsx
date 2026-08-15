import { useState } from 'react';
import { Box, Button, HStack } from '@chakra-ui/react';
import { MdCheck } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { PageHeader, DataTable, StatusChip, ConfirmDialog, type Column } from '../../components';
import { useAuth } from '../../auth/AuthContext';
import { canConfirmCashPayment } from '../../utils/permissions';
import { usePayments, useConfirmCash } from './api';
import type { Payment } from './types';

// Payments (see docs/12 §M19). Read-only list + a "confirm cash" action for staff, enabled
// only on payments that are still pending AND were made by the cash method.
export default function PaymentsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canConfirm = user ? canConfirmCashPayment(user.role) : false;

  const { data, isLoading, error, refetch } = usePayments();
  const confirmCash = useConfirmCash();
  const [confirming, setConfirming] = useState<Payment | null>(null);

  const columns: Column<Payment>[] = [
    { key: 'payment_number', header: t('payments.number') },
    { key: 'order_id', header: t('spareParts.order'), render: (p) => (p.order_id ? `#${p.order_id}` : '—') },
    { key: 'type', header: t('payments.type'), render: (p) => t(`enums.paymentType.${p.type}`, { defaultValue: p.type }) },
    { key: 'method', header: t('payments.method'), render: (p) => t(`enums.paymentMethod.${p.method}`, { defaultValue: p.method }) },
    { key: 'amount', header: t('payments.amount'), render: (p) => `${p.amount} ${t('common.sar')}` },
    { key: 'points_used', header: t('payments.pointsUsed'), render: (p) => p.points_used || '—' },
    { key: 'status', header: t('field.status'), render: (p) => <StatusChip status={p.status} /> },
  ];

  if (canConfirm) {
    columns.push({
      key: 'actions',
      header: '',
      align: 'right',
      render: (p) => (
        <HStack justify="flex-end" gap={1}>
          {p.status === 'pending' && p.method === 'cash' && (
            <Button size="xs" variant="outline" colorPalette="green" onClick={() => setConfirming(p)}>
              <MdCheck /> {t('payments.confirmCash')}
            </Button>
          )}
        </HStack>
      ),
    });
  }

  return (
    <Box>
      <PageHeader title={t('nav.payments')} subtitle={t('payments.hint')} />
      <DataTable
        columns={columns}
        rows={data ?? []}
        getRowId={(p) => p.id}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchKeys={['payment_number']}
        emptyMessage={t('payments.empty')}
      />

      <ConfirmDialog
        open={!!confirming}
        title={t('payments.confirmCashTitle')}
        message={
          confirming
            ? `${t('payments.confirmCashMessage')} (${confirming.payment_number} · ${confirming.amount} ${t('common.sar')})`
            : t('payments.confirmCashMessage')
        }
        loading={confirmCash.isPending}
        onConfirm={() => {
          if (confirming) confirmCash.mutate(confirming.id, { onSettled: () => setConfirming(null) });
        }}
        onClose={() => setConfirming(null)}
      />
    </Box>
  );
}
