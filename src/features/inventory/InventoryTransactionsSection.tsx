import { useState } from 'react';
import { Box, Button } from '@chakra-ui/react';
import { MdAdd } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { PageHeader, DataTable, StatusChip, type Column } from '../../components';
import { useAuth } from '../../auth/AuthContext';
import { canManageInventory } from '../../utils/permissions';
import { useInventoryTransactions } from './api';
import InventoryTransactionFormDialog from './InventoryTransactionFormDialog';
import type { InventoryTransaction } from './types';

// Read-only list — this is an append-only ledger, there's no edit/delete for any row,
// only a "create" action (docs/10 §5).
export default function InventoryTransactionsSection() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canCreate = user ? canManageInventory(user.role) : false;

  const { data, isLoading, error, refetch } = useInventoryTransactions();
  const [formOpen, setFormOpen] = useState(false);

  const columns: Column<InventoryTransaction>[] = [
    { key: 'created_at', header: t('inventory.date') },
    { key: 'branch', header: t('cars.branch'), render: (r) => r.branch?.name_ar ?? `#${r.branch_id}` },
    { key: 'material', header: t('inventory.materials'), render: (r) => r.material?.name_ar ?? `#${r.material_id}` },
    { key: 'type', header: t('inventory.txTypeLabel'), render: (r) => <StatusChip status={r.type === 'transfer_out' || r.type === 'transfer_in' ? 'assigned' : r.type === 'in' ? 'active' : 'inactive'} label={t(`inventory.txType.${r.type}`)} /> },
    { key: 'quantity', header: t('inventory.quantity'), render: (r) => String(r.quantity) },
    { key: 'quantity_after', header: t('inventory.quantityAfter'), render: (r) => String(r.quantity_after) },
    { key: 'destination_branch', header: t('inventory.destinationBranch'), render: (r) => r.destination_branch?.name_ar ?? '—' },
    { key: 'creator', header: t('inventory.by'), render: (r) => r.creator?.name ?? `#${r.created_by}` },
    { key: 'note', header: t('inventory.note'), render: (r) => r.note ?? '—' },
  ];

  return (
    <Box>
      <PageHeader
        title={t('inventory.transactions')}
        action={
          canCreate ? (
            <Button colorPalette="brand" onClick={() => setFormOpen(true)}>
              <MdAdd /> {t('inventory.addTransaction')}
            </Button>
          ) : undefined
        }
      />
      <DataTable
        columns={columns}
        rows={data ?? []}
        getRowId={(r) => r.id}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        emptyMessage={t('inventory.emptyTransactions')}
      />
      <InventoryTransactionFormDialog open={formOpen} onClose={() => setFormOpen(false)} />
    </Box>
  );
}
