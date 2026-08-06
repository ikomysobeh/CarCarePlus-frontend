import { useState } from 'react';
import { Box, Button, HStack, IconButton } from '@chakra-ui/react';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { PageHeader, DataTable, StatusChip, ConfirmDialog, type Column } from '../../components';
import { useAuth } from '../../auth/AuthContext';
import { canWriteCatalog } from '../../utils/permissions';
import { useCarTypes, useDeleteCarType } from './api';
import CarTypeFormDialog from './CarTypeFormDialog';
import type { CarType } from './types';

export default function CarTypesSection() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canWrite = user ? canWriteCatalog(user.role) : false;

  const { data, isLoading, error, refetch } = useCarTypes();
  const del = useDeleteCarType();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CarType | null>(null);
  const [toDelete, setToDelete] = useState<CarType | null>(null);

  const columns: Column<CarType>[] = [
    { key: 'name_ar', header: t('field.nameAr') },
    { key: 'name', header: t('field.name') },
    { key: 'price_multiplier', header: t('field.priceMultiplier'), render: (c) => `×${c.price_multiplier}` },
    {
      key: 'is_active',
      header: t('field.status'),
      render: (c) => <StatusChip status={c.is_active ? 'active' : 'inactive'} />,
    },
  ];

  if (canWrite) {
    columns.push({
      key: 'actions',
      header: '',
      align: 'right',
      render: (c) => (
        <HStack justify="flex-end" gap={1}>
          <IconButton aria-label={t('common.edit')} size="sm" variant="ghost"
            onClick={() => { setEditing(c); setFormOpen(true); }}>
            <MdEdit />
          </IconButton>
          <IconButton aria-label={t('common.delete')} size="sm" variant="ghost" colorPalette="red"
            onClick={() => setToDelete(c)}>
            <MdDelete />
          </IconButton>
        </HStack>
      ),
    });
  }

  return (
    <Box>
      <PageHeader
        title={t('catalog.carTypes')}
        action={
          canWrite ? (
            <Button colorPalette="brand" onClick={() => { setEditing(null); setFormOpen(true); }}>
              <MdAdd /> {t('catalog.addCarType')}
            </Button>
          ) : undefined
        }
      />
      <DataTable
        columns={columns}
        rows={data ?? []}
        getRowId={(c) => c.id}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchKeys={['name', 'name_ar']}
        emptyMessage={t('catalog.emptyCarTypes')}
      />
      <CarTypeFormDialog open={formOpen} carType={editing} onClose={() => setFormOpen(false)} />
      <ConfirmDialog
        open={!!toDelete}
        title={t('catalog.deleteCarTypeTitle')}
        message={t('catalog.deleteMessage', { name: toDelete?.name_ar ?? '' })}
        destructive
        loading={del.isPending}
        onConfirm={() => { if (toDelete) del.mutate(toDelete.id, { onSettled: () => setToDelete(null) }); }}
        onClose={() => setToDelete(null)}
      />
    </Box>
  );
}
