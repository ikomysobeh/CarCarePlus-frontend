import { useState } from 'react';
import { Box, Button, HStack, IconButton } from '@chakra-ui/react';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { PageHeader, DataTable, StatusChip, ConfirmDialog, type Column } from '../../components';
import { useAuth } from '../../auth/AuthContext';
import { canWriteCatalog } from '../../utils/permissions';
import { useSubServices, useDeleteSubService } from './api';
import SubServiceFormDialog from './SubServiceFormDialog';
import type { SubService } from './types';

export default function SubServicesSection() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canWrite = user ? canWriteCatalog(user.role) : false;

  const { data, isLoading, error, refetch } = useSubServices();
  const del = useDeleteSubService();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SubService | null>(null);
  const [toDelete, setToDelete] = useState<SubService | null>(null);

  const columns: Column<SubService>[] = [
    { key: 'name_ar', header: t('field.nameAr') },
    { key: 'service', header: t('catalog.services'), render: (s) => s.service?.name_ar ?? '—' },
    { key: 'price', header: t('field.price'), render: (s) => `${s.price} ${t('common.sar')}` },
    {
      key: 'is_active',
      header: t('field.status'),
      render: (s) => <StatusChip status={s.is_active ? 'active' : 'inactive'} />,
    },
  ];

  if (canWrite) {
    columns.push({
      key: 'actions',
      header: '',
      align: 'right',
      render: (s) => (
        <HStack justify="flex-end" gap={1}>
          <IconButton aria-label={t('common.edit')} size="sm" variant="ghost"
            onClick={() => { setEditing(s); setFormOpen(true); }}>
            <MdEdit />
          </IconButton>
          <IconButton aria-label={t('common.delete')} size="sm" variant="ghost" colorPalette="red"
            onClick={() => setToDelete(s)}>
            <MdDelete />
          </IconButton>
        </HStack>
      ),
    });
  }

  return (
    <Box>
      <PageHeader
        title={t('catalog.subServices')}
        action={
          canWrite ? (
            <Button colorPalette="brand" onClick={() => { setEditing(null); setFormOpen(true); }}>
              <MdAdd /> {t('catalog.addSubService')}
            </Button>
          ) : undefined
        }
      />
      <DataTable
        columns={columns}
        rows={data ?? []}
        getRowId={(s) => s.id}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchKeys={['name', 'name_ar']}
        emptyMessage={t('catalog.emptySubServices')}
      />
      <SubServiceFormDialog open={formOpen} subService={editing} onClose={() => setFormOpen(false)} />
      <ConfirmDialog
        open={!!toDelete}
        title={t('catalog.deleteSubServiceTitle')}
        message={t('catalog.deleteMessage', { name: toDelete?.name_ar ?? '' })}
        destructive
        loading={del.isPending}
        onConfirm={() => { if (toDelete) del.mutate(toDelete.id, { onSettled: () => setToDelete(null) }); }}
        onClose={() => setToDelete(null)}
      />
    </Box>
  );
}
