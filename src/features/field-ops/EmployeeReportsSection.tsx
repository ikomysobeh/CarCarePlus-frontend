import { useMemo, useState } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { PageHeader, DataTable, StatusChip, type Column } from '../../components';
import { useEmployeeReports, filterReports } from './api';
import EmployeeReportFilterBar from './EmployeeReportFilterBar';
import type { EmployeeReport, EmployeeReportFilters } from './types';

export default function EmployeeReportsSection() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<EmployeeReportFilters>({});
  const { data, isLoading, error, refetch } = useEmployeeReports();

  // Filtering happens in the browser (see `filterReports` for why), so it is instant — no
  // debounce needed and no request per keystroke.
  const rows = useMemo(() => filterReports(data ?? [], filters), [data, filters]);
  const hasFilters = Object.values(filters).some((v) => v !== '' && v != null);

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
      <EmployeeReportFilterBar value={filters} onChange={setFilters} />
      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        // A different message when filters are on: "no reports yet" would wrongly suggest the
        // system is empty, when the rows are simply filtered out.
        emptyMessage={hasFilters ? t('fieldOps.emptyFiltered') : t('fieldOps.emptyReports')}
      />
    </Box>
  );
}
