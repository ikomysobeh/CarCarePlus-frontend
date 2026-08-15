import { Box, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { PageHeader, DataTable, StatusChip, type Column } from '../../components';
import { useEmployeeReports } from './api';
import type { EmployeeReport } from './types';

export default function EmployeeReportsSection() {
  const { t } = useTranslation();
  const { data, isLoading, error, refetch } = useEmployeeReports();

  const columns: Column<EmployeeReport>[] = [
    { key: 'id', header: t('fieldOps.id') },
    { key: 'order_id', header: t('fieldOps.order'), render: (r) => `#${r.order_id}` },
    { key: 'employee', header: t('fieldOps.employee'), render: (r) => r.employee?.user?.name ?? `#${r.employee_id ?? '—'}` },
    {
      key: 'problem_description',
      header: t('fieldOps.problemDescription'),
      render: (r) => (
        <Text maxW="320px" truncate>
          {r.problem_description}
        </Text>
      ),
    },
    {
      key: 'affected_parts',
      header: t('fieldOps.affectedParts'),
      render: (r) => (r.affected_parts?.length ? r.affected_parts.join(', ') : '—'),
    },
    { key: 'status', header: t('field.status'), render: (r) => <StatusChip status={r.status} /> },
    {
      key: 'created_at',
      header: t('fieldOps.createdAt'),
      render: (r) => (r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'),
    },
  ];

  return (
    <Box>
      <PageHeader title={t('fieldOps.tabReports')} />
      <DataTable
        columns={columns}
        rows={data ?? []}
        getRowId={(r) => r.id}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        emptyMessage={t('fieldOps.emptyReports')}
      />
    </Box>
  );
}
