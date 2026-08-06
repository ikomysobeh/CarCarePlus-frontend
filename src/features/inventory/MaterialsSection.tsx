import { useState } from 'react';
import { Box, Button, HStack, IconButton } from '@chakra-ui/react';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { PageHeader, DataTable, StatusChip, ConfirmDialog, type Column } from '../../components';
import { useAuth } from '../../auth/AuthContext';
import { canWriteCatalog } from '../../utils/permissions';
import { useMaterials, useDeleteMaterial } from './api';
import MaterialFormDialog from './MaterialFormDialog';
import type { Material } from './types';

// ⚠️ Materials write is super_admin ONLY — same as Material Units (docs/10 §5).
export default function MaterialsSection() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canWrite = user ? canWriteCatalog(user.role) : false;

  const { data, isLoading, error, refetch } = useMaterials();
  const del = useDeleteMaterial();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [toDelete, setToDelete] = useState<Material | null>(null);

  const columns: Column<Material>[] = [
    { key: 'name_ar', header: t('field.nameAr') },
    { key: 'unit', header: t('inventory.units'), render: (m) => m.unit?.name_ar ?? '—' },
    { key: 'unit_price', header: t('inventory.unitPrice'), render: (m) => String(m.unit_price) },
    {
      key: 'is_vip_material',
      header: t('inventory.isVip'),
      render: (m) => <StatusChip status={m.is_vip_material ? 'active' : 'inactive'} label={m.is_vip_material ? t('common.yes') : t('common.no')} />,
    },
    {
      key: 'is_visible_to_customer',
      header: t('inventory.isVisibleToCustomer'),
      render: (m) => <StatusChip status={m.is_visible_to_customer ? 'active' : 'inactive'} label={m.is_visible_to_customer ? t('common.yes') : t('common.no')} />,
    },
    { key: 'is_active', header: t('field.status'), render: (m) => <StatusChip status={m.is_active ? 'active' : 'inactive'} /> },
  ];

  if (canWrite) {
    columns.push({
      key: 'actions',
      header: '',
      align: 'right',
      render: (m) => (
        <HStack justify="flex-end" gap={1}>
          <IconButton aria-label={t('common.edit')} size="sm" variant="ghost"
            onClick={() => { setEditing(m); setFormOpen(true); }}>
            <MdEdit />
          </IconButton>
          <IconButton aria-label={t('common.delete')} size="sm" variant="ghost" colorPalette="red"
            onClick={() => setToDelete(m)}>
            <MdDelete />
          </IconButton>
        </HStack>
      ),
    });
  }

  return (
    <Box>
      <PageHeader
        title={t('inventory.materials')}
        action={
          canWrite ? (
            <Button colorPalette="brand" onClick={() => { setEditing(null); setFormOpen(true); }}>
              <MdAdd /> {t('inventory.addMaterial')}
            </Button>
          ) : undefined
        }
      />
      <DataTable
        columns={columns}
        rows={data ?? []}
        getRowId={(m) => m.id}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchKeys={['name', 'name_ar']}
        emptyMessage={t('inventory.emptyMaterials')}
      />
      <MaterialFormDialog open={formOpen} material={editing} onClose={() => setFormOpen(false)} />
      <ConfirmDialog
        open={!!toDelete}
        title={t('inventory.deleteMaterialTitle')}
        message={t('inventory.deleteMaterialMessage', { name: toDelete?.name_ar ?? '' })}
        destructive
        loading={del.isPending}
        onConfirm={() => { if (toDelete) del.mutate(toDelete.id, { onSettled: () => setToDelete(null) }); }}
        onClose={() => setToDelete(null)}
      />
    </Box>
  );
}
