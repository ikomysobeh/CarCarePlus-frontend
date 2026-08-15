import { Box } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { PageHeader, DataTable, type Column } from '../../components';
import { useGpsLogs } from './api';
import type { GpsLog } from './types';

export default function GpsLogsSection() {
  const { t } = useTranslation();
  const { data, isLoading, error, refetch } = useGpsLogs();

  const columns: Column<GpsLog>[] = [
    { key: 'id', header: t('fieldOps.id') },
    { key: 'employee', header: t('fieldOps.employee'), render: (g) => g.employee?.user?.name ?? `#${g.employee_id ?? '—'}` },
    { key: 'order_id', header: t('fieldOps.order'), render: (g) => (g.order_id ? `#${g.order_id}` : '—') },
    { key: 'latitude', header: t('fieldOps.latitude'), render: (g) => String(g.latitude) },
    { key: 'longitude', header: t('fieldOps.longitude'), render: (g) => String(g.longitude) },
    {
      key: 'recorded_at',
      header: t('fieldOps.recordedAt'),
      render: (g) => (g.recorded_at ? new Date(g.recorded_at).toLocaleString() : '—'),
    },
  ];

  return (
    <Box>
      <PageHeader title={t('fieldOps.tabGps')} />
      <DataTable
        columns={columns}
        rows={data ?? []}
        getRowId={(g) => g.id}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        emptyMessage={t('fieldOps.emptyGps')}
      />
    </Box>
  );
}
