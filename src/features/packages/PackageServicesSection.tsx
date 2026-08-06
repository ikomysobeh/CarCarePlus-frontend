import { useState } from 'react';
import { Box, Button, HStack, IconButton } from '@chakra-ui/react';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { PageHeader, DataTable, ConfirmDialog, type Column } from '../../components';
import { useAuth } from '../../auth/AuthContext';
import { canManagePackages } from '../../utils/permissions';
import { usePackageServices, useDeletePackageService } from './api';
import PackageServiceFormDialog from './PackageServiceFormDialog';
import type { PackageService } from './types';

export default function PackageServicesSection() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canWrite = user ? canManagePackages(user.role) : false;

  const { data, isLoading, error, refetch } = usePackageServices();
  const del = useDeletePackageService();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PackageService | null>(null);
  const [toDelete, setToDelete] = useState<PackageService | null>(null);

  const columns: Column<PackageService>[] = [
    { key: 'package', header: t('packages.package'), render: (r) => r.package?.name ?? `#${r.package_id}` },
    { key: 'service', header: t('packages.service'), render: (r) => r.service?.name_ar ?? `#${r.service_id}` },
    { key: 'allowed_count', header: t('field.allowedCount'), align: 'center' },
  ];

  if (canWrite) {
    columns.push({
      key: 'actions',
      header: '',
      align: 'right',
      render: (r) => (
        <HStack justify="flex-end" gap={1}>
          <IconButton aria-label={t('common.edit')} size="sm" variant="ghost"
            onClick={() => { setEditing(r); setFormOpen(true); }}>
            <MdEdit />
          </IconButton>
          <IconButton aria-label={t('common.delete')} size="sm" variant="ghost" colorPalette="red"
            onClick={() => setToDelete(r)}>
            <MdDelete />
          </IconButton>
        </HStack>
      ),
    });
  }

  return (
    <Box>
      <PageHeader
        title={t('packages.tabServices')}
        action={
          canWrite ? (
            <Button colorPalette="brand" onClick={() => { setEditing(null); setFormOpen(true); }}>
              <MdAdd /> {t('packages.addService')}
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
        emptyMessage={t('packages.emptyServices')}
      />
      <PackageServiceFormDialog open={formOpen} row={editing} onClose={() => setFormOpen(false)} />
      <ConfirmDialog
        open={!!toDelete}
        title={t('packages.deleteServiceTitle')}
        message={t('catalog.deleteMessage', { name: toDelete?.service?.name_ar ?? '' })}
        destructive
        loading={del.isPending}
        onConfirm={() => { if (toDelete) del.mutate(toDelete.id, { onSettled: () => setToDelete(null) }); }}
        onClose={() => setToDelete(null)}
      />
    </Box>
  );
}
