import { useState } from 'react';
import { Box, Button, HStack, IconButton } from '@chakra-ui/react';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { PageHeader, DataTable, ConfirmDialog, type Column } from '../../components';
import { useAuth } from '../../auth/AuthContext';
import { canManageInventory } from '../../utils/permissions';
import { useInventories, useDeleteInventory } from './api';
import InventoryFormDialog from './InventoryFormDialog';
import type { Inventory } from './types';

// Stock levels — for corrections only. For day-to-day stock movement, use the
// Transactions tab (docs/10 §5). Both super_admin and admin can write here.
export default function InventoriesSection() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canWrite = user ? canManageInventory(user.role) : false;

  const { data, isLoading, error, refetch } = useInventories();
  const del = useDeleteInventory();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Inventory | null>(null);
  const [toDelete, setToDelete] = useState<Inventory | null>(null);

  const columns: Column<Inventory>[] = [
    { key: 'branch', header: t('cars.branch'), render: (i) => i.branch?.name_ar ?? `#${i.branch_id}` },
    { key: 'material', header: t('inventory.materials'), render: (i) => i.material?.name_ar ?? `#${i.material_id}` },
    { key: 'quantity', header: t('inventory.quantity'), render: (i) => String(i.quantity) },
    { key: 'min_quantity', header: t('inventory.minQuantity'), render: (i) => String(i.min_quantity) },
  ];

  if (canWrite) {
    columns.push({
      key: 'actions',
      header: '',
      align: 'right',
      render: (i) => (
        <HStack justify="flex-end" gap={1}>
          <IconButton aria-label={t('common.edit')} size="sm" variant="ghost"
            onClick={() => { setEditing(i); setFormOpen(true); }}>
            <MdEdit />
          </IconButton>
          <IconButton aria-label={t('common.delete')} size="sm" variant="ghost" colorPalette="red"
            onClick={() => setToDelete(i)}>
            <MdDelete />
          </IconButton>
        </HStack>
      ),
    });
  }

  return (
    <Box>
      <PageHeader
        title={t('inventory.stock')}
        subtitle={t('inventory.stockHint')}
        action={
          canWrite ? (
            <Button colorPalette="brand" onClick={() => { setEditing(null); setFormOpen(true); }}>
              <MdAdd /> {t('inventory.addStock')}
            </Button>
          ) : undefined
        }
      />
      <DataTable
        columns={columns}
        rows={data ?? []}
        getRowId={(i) => i.id}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        emptyMessage={t('inventory.emptyStock')}
      />
      <InventoryFormDialog open={formOpen} inventory={editing} onClose={() => setFormOpen(false)} />
      <ConfirmDialog
        open={!!toDelete}
        title={t('inventory.deleteStockTitle')}
        message={t('inventory.deleteStockMessage')}
        destructive
        loading={del.isPending}
        onConfirm={() => { if (toDelete) del.mutate(toDelete.id, { onSettled: () => setToDelete(null) }); }}
        onClose={() => setToDelete(null)}
      />
    </Box>
  );
}
