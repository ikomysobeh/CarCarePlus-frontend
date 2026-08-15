import { Box, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { PageHeader, DataTable, StatusChip, type Column } from '../../components';
import { useSparePartRequests } from './api';
import type { SparePartRequest } from './types';

// Spare Part Requests (see docs/12 §M18) — read-only. Employees raise them on an order;
// the customer approves/rejects from their app, so there are no action buttons here.
export default function SparePartsPage() {
  const { t } = useTranslation();
  const { data, isLoading, error, refetch } = useSparePartRequests();

  const columns: Column<SparePartRequest>[] = [
    { key: 'id', header: t('spareParts.id') },
    { key: 'order_id', header: t('spareParts.order'), render: (s) => `#${s.order_id}` },
    { key: 'material', header: t('spareParts.material'), render: (s) => s.material?.name_ar ?? `#${s.material_id}` },
    { key: 'quantity', header: t('spareParts.quantity'), render: (s) => String(s.quantity) },
    {
      key: 'specifications',
      header: t('spareParts.specifications'),
      render: (s) => (
        <Text maxW="280px" truncate color={s.specifications ? 'fg' : 'fgMuted'}>
          {s.specifications || '—'}
        </Text>
      ),
    },
    { key: 'status', header: t('field.status'), render: (s) => <StatusChip status={s.status} /> },
    {
      key: 'created_at',
      header: t('spareParts.createdAt'),
      render: (s) => (s.created_at ? new Date(s.created_at).toLocaleDateString() : '—'),
    },
  ];

  return (
    <Box>
      <PageHeader title={t('nav.spareParts')} subtitle={t('spareParts.hint')} />
      <DataTable
        columns={columns}
        rows={data ?? []}
        getRowId={(s) => s.id}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        emptyMessage={t('spareParts.empty')}
      />
    </Box>
  );
}
