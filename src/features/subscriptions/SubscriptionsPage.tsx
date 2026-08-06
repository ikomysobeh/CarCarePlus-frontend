import { useState } from 'react';
import { Box, Button, Heading, HStack, IconButton, Input, SimpleGrid, Stack } from '@chakra-ui/react';
import { MdAdd, MdEdit, MdDelete, MdOutlineLoyalty, MdSearch } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import {
  PageHeader,
  DataTable,
  StatCard,
  StatusChip,
  ConfirmDialog,
  EmptyState,
  type Column,
} from '../../components';
import { useAuth } from '../../auth/AuthContext';
import {
  useUserPackages,
  useDeleteUserPackage,
  usePointsBalance,
  usePointsHistory,
} from './api';
import UserPackageFormDialog from './UserPackageFormDialog';
import type { UserPackage, PointsTransaction } from './types';

// Statuses that make a subscription read-only (no more edits) — business rule from docs/08 §4.
const LOCKED_STATUSES = ['expired', 'cancelled'];

export default function SubscriptionsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const role = user?.role;
  const canWrite = role === 'super_admin' || role === 'admin';
  const canDelete = role === 'super_admin';

  const [customerInput, setCustomerInput] = useState('');
  const [customerId, setCustomerId] = useState<number | undefined>(undefined);

  const subs = useUserPackages(customerId);
  const balance = usePointsBalance(customerId);
  const history = usePointsHistory(customerId);
  const del = useDeleteUserPackage(customerId);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<UserPackage | null>(null);
  const [toDelete, setToDelete] = useState<UserPackage | null>(null);

  const load = () => {
    const id = Number(customerInput);
    setCustomerId(Number.isFinite(id) && id > 0 ? id : undefined);
  };

  const subColumns: Column<UserPackage>[] = [
    { key: 'package', header: t('packages.package'), render: (r) => r.package?.name ?? `#${r.package_id}` },
    { key: 'remaining_count', header: t('field.remainingCount'), align: 'center' },
    { key: 'start_date', header: t('subscriptions.startDate'), render: (r) => r.start_date ?? '—' },
    { key: 'end_date', header: t('subscriptions.endDate'), render: (r) => r.end_date ?? '—' },
    { key: 'status', header: t('field.status'), render: (r) => <StatusChip status={r.status} /> },
  ];
  if (canWrite) {
    subColumns.push({
      key: 'actions',
      header: '',
      align: 'right',
      render: (r) => {
        const locked = LOCKED_STATUSES.includes(r.status);
        return (
          <HStack justify="flex-end" gap={1}>
            <IconButton
              aria-label={t('common.edit')}
              size="sm"
              variant="ghost"
              disabled={locked}
              onClick={() => { setEditing(r); setFormOpen(true); }}
            >
              <MdEdit />
            </IconButton>
            {canDelete && (
              <IconButton aria-label={t('common.delete')} size="sm" variant="ghost" colorPalette="red"
                onClick={() => setToDelete(r)}>
                <MdDelete />
              </IconButton>
            )}
          </HStack>
        );
      },
    });
  }

  const historyColumns: Column<PointsTransaction>[] = [
    { key: 'type', header: t('field.type'), render: (r) => <StatusChip status={r.type} /> },
    { key: 'points', header: t('field.points'), align: 'center' },
    { key: 'balance_after', header: t('field.balance'), align: 'center' },
    { key: 'expires_at', header: t('field.expiresAt'), render: (r) => r.expires_at ?? '—' },
    { key: 'note', header: t('field.note'), render: (r) => r.note ?? '—' },
    { key: 'created_at', header: t('field.date'), render: (r) => r.created_at },
  ];

  return (
    <Box>
      <PageHeader title={t('subscriptions.title')} subtitle={t('subscriptions.hint')} />

      {/* Customer picker (no /customers lookup endpoint yet — enter the id, same as cars). */}
      <HStack mb={6} gap={3} maxW="480px">
        <Input
          value={customerInput}
          onChange={(e) => setCustomerInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') load(); }}
          type="number"
          placeholder={t('field.customerId')}
          bg="surface"
          borderColor="line"
          rounded="full"
        />
        <Button colorPalette="brand" onClick={load} flexShrink={0}>
          <MdSearch /> {t('subscriptions.load')}
        </Button>
      </HStack>

      {customerId == null ? (
        <EmptyState message={t('subscriptions.enterCustomer')} />
      ) : (
        <Stack gap={8}>
          {/* Points balance */}
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={4}>
            <StatCard
              label={t('subscriptions.pointsBalance')}
              value={balance.data?.balance ?? 0}
              loading={balance.isLoading}
              icon={<MdOutlineLoyalty />}
              accent="purple"
            />
          </SimpleGrid>

          {/* Subscriptions */}
          <Box>
            <HStack justify="space-between" mb={4}>
              <Heading size="md" fontWeight="800">{t('nav.subscriptions')}</Heading>
              {canWrite && (
                <Button colorPalette="brand" onClick={() => { setEditing(null); setFormOpen(true); }}>
                  <MdAdd /> {t('subscriptions.add')}
                </Button>
              )}
            </HStack>
            <DataTable
              columns={subColumns}
              rows={subs.data ?? []}
              getRowId={(r) => r.id}
              loading={subs.isLoading}
              error={subs.error}
              onRetry={subs.refetch}
              emptyMessage={t('subscriptions.empty')}
            />
          </Box>

          {/* Points history */}
          <Box>
            <Heading size="md" fontWeight="800" mb={4}>{t('subscriptions.history')}</Heading>
            <DataTable
              columns={historyColumns}
              rows={history.data ?? []}
              getRowId={(r) => r.id}
              loading={history.isLoading}
              error={history.error}
              onRetry={history.refetch}
              emptyMessage={t('subscriptions.emptyHistory')}
            />
          </Box>
        </Stack>
      )}

      <UserPackageFormDialog
        open={formOpen}
        customerId={customerId}
        row={editing}
        onClose={() => setFormOpen(false)}
      />
      <ConfirmDialog
        open={!!toDelete}
        title={t('subscriptions.deleteTitle')}
        message={t('catalog.deleteMessage', { name: toDelete?.package?.name ?? '' })}
        destructive
        loading={del.isPending}
        onConfirm={() => { if (toDelete) del.mutate(toDelete.id, { onSettled: () => setToDelete(null) }); }}
        onClose={() => setToDelete(null)}
      />
    </Box>
  );
}
