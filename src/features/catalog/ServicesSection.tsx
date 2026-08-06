import { useState } from 'react';
import { Box, Button, HStack, IconButton } from '@chakra-ui/react';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { PageHeader, DataTable, StatusChip, ConfirmDialog, type Column } from '../../components';
import { useAuth } from '../../auth/AuthContext';
import { canWriteCatalog } from '../../utils/permissions';
import { useServices, useDeleteService } from './api';
import ServiceFormDialog from './ServiceFormDialog';
import type { Service } from './types';

export default function ServicesSection() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canWrite = user ? canWriteCatalog(user.role) : false;

  const { data, isLoading, error, refetch } = useServices();
  const del = useDeleteService();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [toDelete, setToDelete] = useState<Service | null>(null);

  const columns: Column<Service>[] = [
    { key: 'name_ar', header: t('field.nameAr') },
    { key: 'category', header: t('catalog.categories'), render: (s) => s.category?.name_ar ?? '—' },
    { key: 'base_price', header: t('field.basePrice'), render: (s) => `${s.base_price} ${t('common.sar')}` },
    { key: 'duration_minutes', header: t('field.durationMinutes'), render: (s) => `${s.duration_minutes} ${t('common.min')}` },
    {
      key: 'is_vip_available',
      header: t('field.vipAvailable'),
      render: (s) => (
        <StatusChip status={s.is_vip_available ? 'active' : 'inactive'} label={s.is_vip_available ? t('common.yes') : t('common.no')} />
      ),
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
        title={t('catalog.services')}
        action={
          canWrite ? (
            <Button colorPalette="brand" onClick={() => { setEditing(null); setFormOpen(true); }}>
              <MdAdd /> {t('catalog.addService')}
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
        emptyMessage={t('catalog.emptyServices')}
      />
      <ServiceFormDialog open={formOpen} service={editing} onClose={() => setFormOpen(false)} />
      <ConfirmDialog
        open={!!toDelete}
        title={t('catalog.deleteServiceTitle')}
        message={t('catalog.deleteMessage', { name: toDelete?.name_ar ?? '' })}
        destructive
        loading={del.isPending}
        onConfirm={() => { if (toDelete) del.mutate(toDelete.id, { onSettled: () => setToDelete(null) }); }}
        onClose={() => setToDelete(null)}
      />
    </Box>
  );
}
