import { useState } from 'react';
import { Box, Button, Heading, HStack, IconButton, NativeSelect, SimpleGrid, Stack } from '@chakra-ui/react';
import { MdAdd, MdEdit, MdDelete, MdOutlineLoyalty } from 'react-icons/md';
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
import { useCustomerOptions } from '../customers/api';
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

  const [customerId, setCustomerId] = useState<number | undefined>(undefined);
  const customers = useCustomerOptions();

  const subs = useUserPackages(customerId);
  const balance = usePointsBalance(customerId);
  const history = usePointsHistory(customerId);
  const del = useDeleteUserPackage(customerId);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<UserPackage | null>(null);
  const [toDelete, setToDelete] = useState<UserPackage | null>(null);

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

      {/* Customer picker. Selecting IS the action, so there's no separate "Load" button —
          one less click, and no way to type an id that doesn't exist. */}
      <Box mb={6} maxW="480px">
        <NativeSelect.Root disabled={customers.isLoading}>
          <NativeSelect.Field
            value={customerId ?? ''}
            onChange={(e) => setCustomerId(e.target.value ? Number(e.target.value) : undefined)}
            bg="surface"
            borderColor="line"
            rounded="full"
            _hover={{ borderColor: 'fgMuted' }}
            _focusVisible={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--ccp-colors-brand-500)' }}
          >
            <option value="">{t('subscriptions.selectCustomer')}</option>
            {customers.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.isCompany ? `${o.label} (${t('cars.customerCompanyTag')})` : o.label}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Box>

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
