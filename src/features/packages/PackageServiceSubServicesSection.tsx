import { useState } from 'react';
import { Box, Button, HStack, IconButton } from '@chakra-ui/react';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { PageHeader, DataTable, StatusChip, ConfirmDialog, type Column } from '../../components';
import { useAuth } from '../../auth/AuthContext';
import { canManagePackages } from '../../utils/permissions';
import { usePackageServiceSubServices, useDeletePackageServiceSubService } from './api';
import PackageServiceSubServiceFormDialog from './PackageServiceSubServiceFormDialog';
import type { PackageServiceSubService } from './types';

export default function PackageServiceSubServicesSection() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canWrite = user ? canManagePackages(user.role) : false;

  const { data, isLoading, error, refetch } = usePackageServiceSubServices();
  const del = useDeletePackageServiceSubService();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PackageServiceSubService | null>(null);
  const [toDelete, setToDelete] = useState<PackageServiceSubService | null>(null);

  const columns: Column<PackageServiceSubService>[] = [
    {
      key: 'package_service',
      header: t('packages.packageService'),
      render: (r) =>
        `${r.package_service?.package?.name ?? `#${r.package_service_id}`}` +
        (r.package_service?.service?.name_ar ? ` · ${r.package_service.service.name_ar}` : ''),
    },
    { key: 'sub_service', header: t('packages.subService'), render: (r) => r.sub_service?.name_ar ?? `#${r.sub_service_id}` },
    { key: 'price_override', header: t('field.priceOverride'), render: (r) => r.price_override ?? '—' },
    {
      key: 'is_active',
      header: t('field.status'),
      render: (r) => <StatusChip status={r.is_active ? 'active' : 'inactive'} />,
    },
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
        title={t('packages.tabSubServices')}
        action={
          canWrite ? (
            <Button colorPalette="brand" onClick={() => { setEditing(null); setFormOpen(true); }}>
              <MdAdd /> {t('packages.addSubService')}
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
        emptyMessage={t('packages.emptySubServices')}
      />
      <PackageServiceSubServiceFormDialog open={formOpen} row={editing} onClose={() => setFormOpen(false)} />
      <ConfirmDialog
        open={!!toDelete}
        title={t('packages.deleteSubServiceTitle')}
        message={t('catalog.deleteMessage', { name: toDelete?.sub_service?.name_ar ?? '' })}
        destructive
        loading={del.isPending}
        onConfirm={() => { if (toDelete) del.mutate(toDelete.id, { onSettled: () => setToDelete(null) }); }}
        onClose={() => setToDelete(null)}
      />
    </Box>
  );
}
