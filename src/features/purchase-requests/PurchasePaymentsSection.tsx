import { Box } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { PageHeader, DataTable, type Column } from '../../components';
import { usePurchasePayments } from './api';
import type { PurchasePayment } from './types';

// M26 (see docs/13 §5): read-only list of purchase payments — one is created when a purchase
// request is approved. Shown as a tab inside the Purchase Requests screen (super_admin).
export default function PurchasePaymentsSection() {
  const { t } = useTranslation();
  const { data, isLoading, error, refetch } = usePurchasePayments();

  const columns: Column<PurchasePayment>[] = [
    { key: 'id', header: t('purchaseRequests.number'), render: (p) => `#${p.id}` },
    { key: 'request', header: t('purchaseRequests.payFor'), render: (p) => `#${p.purchase_request_id}` },
    {
      key: 'branch',
      header: t('purchaseRequests.branch'),
      render: (p) => p.branch?.name_ar ?? (p.branch_id ? `#${p.branch_id}` : '—'),
    },
    { key: 'amount', header: t('purchaseRequests.total'), render: (p) => `${p.amount} ${t('common.sar')}` },
    { key: 'note', header: t('purchaseRequests.notes'), render: (p) => p.note || '—' },
    {
      key: 'created_at',
      header: t('purchaseRequests.createdAt'),
      render: (p) => (p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'),
    },
  ];

  return (
    <Box>
      <PageHeader title={t('purchaseRequests.paymentsTitle')} subtitle={t('purchaseRequests.paymentsHint')} />
      <DataTable
        columns={columns}
        rows={data ?? []}
        getRowId={(p) => p.id}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        emptyMessage={t('purchaseRequests.paymentsEmpty')}
      />
    </Box>
  );
}
