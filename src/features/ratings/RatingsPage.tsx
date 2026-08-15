import { Box, HStack, Icon, Text } from '@chakra-ui/react';
import { MdStar, MdStarBorder } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { PageHeader, DataTable, type Column } from '../../components';
import { useRatings } from './api';
import type { Rating } from './types';

// Small read-only star row (1–5). null renders a muted dash.
function Stars({ value }: { value: number | null }) {
  if (value == null) return <Text color="fgMuted">—</Text>;
  return (
    <HStack gap={0.5}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon key={n} color={n <= value ? 'orange.400' : 'fgMuted'} boxSize={4}>
          {n <= value ? <MdStar /> : <MdStarBorder />}
        </Icon>
      ))}
    </HStack>
  );
}

// Ratings (see docs/12 §M20) — read-only. Customers submit ratings from their own app.
export default function RatingsPage() {
  const { t } = useTranslation();
  const { data, isLoading, error, refetch } = useRatings();

  const columns: Column<Rating>[] = [
    { key: 'id', header: t('ratings.id') },
    { key: 'order_id', header: t('ratings.order'), render: (r) => `#${r.order_id}` },
    { key: 'customer', header: t('orderDetail.customer'), render: (r) => r.customer?.name ?? `#${r.customer_id}` },
    { key: 'service_rating', header: t('ratings.serviceRating'), render: (r) => <Stars value={r.service_rating} /> },
    { key: 'employee_rating', header: t('ratings.employeeRating'), render: (r) => <Stars value={r.employee_rating} /> },
    { key: 'workshop_rating', header: t('ratings.workshopRating'), render: (r) => <Stars value={r.workshop_rating} /> },
    {
      key: 'comment',
      header: t('ratings.comment'),
      render: (r) => (
        <Text maxW="320px" truncate color={r.comment ? 'fg' : 'fgMuted'}>
          {r.comment || '—'}
        </Text>
      ),
    },
    {
      key: 'created_at',
      header: t('ratings.createdAt'),
      render: (r) => (r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'),
    },
  ];

  return (
    <Box>
      <PageHeader title={t('nav.ratings')} subtitle={t('ratings.hint')} />
      <DataTable
        columns={columns}
        rows={data ?? []}
        getRowId={(r) => r.id}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        emptyMessage={t('ratings.empty')}
      />
    </Box>
  );
}
