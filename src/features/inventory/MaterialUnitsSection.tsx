import { useState } from 'react';
import { Box, Button, HStack, IconButton } from '@chakra-ui/react';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { PageHeader, DataTable, StatusChip, ConfirmDialog, type Column } from '../../components';
import { useAuth } from '../../auth/AuthContext';
import { canWriteCatalog } from '../../utils/permissions';
import { useMaterialUnits, useDeleteMaterialUnit } from './api';
import MaterialUnitFormDialog from './MaterialUnitFormDialog';
import type { MaterialUnit } from './types';

// ⚠️ Material Units write is super_admin ONLY (unlike Inventories/Transactions below,
// where admin also writes, scoped to their own branch) — see docs/10 §5.
export default function MaterialUnitsSection() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canWrite = user ? canWriteCatalog(user.role) : false;

  const { data, isLoading, error, refetch } = useMaterialUnits();
  const del = useDeleteMaterialUnit();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MaterialUnit | null>(null);
  const [toDelete, setToDelete] = useState<MaterialUnit | null>(null);

  const columns: Column<MaterialUnit>[] = [
    { key: 'name_ar', header: t('field.nameAr') },
    { key: 'name', header: t('field.name') },
    {
      key: 'is_decimal',
      header: t('inventory.isDecimal'),
      render: (u) => <StatusChip status={u.is_decimal ? 'active' : 'inactive'} label={u.is_decimal ? t('common.yes') : t('common.no')} />,
    },
  ];

  if (canWrite) {
    columns.push({
      key: 'actions',
      header: '',
      align: 'right',
      render: (u) => (
        <HStack justify="flex-end" gap={1}>
          <IconButton aria-label={t('common.edit')} size="sm" variant="ghost"
            onClick={() => { setEditing(u); setFormOpen(true); }}>
            <MdEdit />
          </IconButton>
          <IconButton aria-label={t('common.delete')} size="sm" variant="ghost" colorPalette="red"
            onClick={() => setToDelete(u)}>
            <MdDelete />
          </IconButton>
        </HStack>
      ),
    });
  }

  return (
    <Box>
      <PageHeader
        title={t('inventory.units')}
        action={
          canWrite ? (
            <Button colorPalette="brand" onClick={() => { setEditing(null); setFormOpen(true); }}>
              <MdAdd /> {t('inventory.addUnit')}
            </Button>
          ) : undefined
        }
      />
      <DataTable
        columns={columns}
        rows={data ?? []}
        getRowId={(u) => u.id}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchKeys={['name', 'name_ar']}
        emptyMessage={t('inventory.emptyUnits')}
      />
      <MaterialUnitFormDialog open={formOpen} unit={editing} onClose={() => setFormOpen(false)} />
      <ConfirmDialog
        open={!!toDelete}
        title={t('inventory.deleteUnitTitle')}
        message={t('inventory.deleteUnitMessage', { name: toDelete?.name_ar ?? '' })}
        destructive
        loading={del.isPending}
        onConfirm={() => { if (toDelete) del.mutate(toDelete.id, { onSettled: () => setToDelete(null) }); }}
        onClose={() => setToDelete(null)}
      />
    </Box>
  );
}
