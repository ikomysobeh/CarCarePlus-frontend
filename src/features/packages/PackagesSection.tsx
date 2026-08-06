import { useState } from 'react';
import { Badge, Box, Button, HStack, IconButton } from '@chakra-ui/react';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { PageHeader, DataTable, StatusChip, ConfirmDialog, type Column } from '../../components';
import { useAuth } from '../../auth/AuthContext';
import { canManagePackages } from '../../utils/permissions';
import { usePackages, useDeletePackage } from './api';
import PackageFormDialog from './PackageFormDialog';
import type { Package } from './types';

export default function PackagesSection() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canWrite = user ? canManagePackages(user.role) : false;

  const { data, isLoading, error, refetch } = usePackages();
  const del = useDeletePackage();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Package | null>(null);
  const [toDelete, setToDelete] = useState<Package | null>(null);

  const columns: Column<Package>[] = [
    { key: 'name', header: t('field.name') },
    {
      key: 'type',
      header: t('field.type'),
      render: (p) => (
        <Badge variant="subtle" colorPalette="brand" rounded="full" px={2.5} py={1}>
          {t(`enums.packageType.${p.type}`)}
        </Badge>
      ),
    },
    {
      key: 'is_company_package',
      header: t('packages.isCompanyPackage'),
      render: (p) => <StatusChip status={p.is_company_package ? 'active' : 'inactive'} label={p.is_company_package ? t('common.yes') : t('common.no')} />,
    },
    { key: 'price', header: t('field.price') },
    { key: 'services_count', header: t('field.servicesCount'), align: 'center' },
    { key: 'valid_days', header: t('field.validDays'), align: 'center' },
    {
      key: 'is_active',
      header: t('field.status'),
      render: (p) => <StatusChip status={p.is_active ? 'active' : 'inactive'} />,
    },
  ];

  if (canWrite) {
    columns.push({
      key: 'actions',
      header: '',
      align: 'right',
      render: (p) => (
        <HStack justify="flex-end" gap={1}>
          <IconButton aria-label={t('common.edit')} size="sm" variant="ghost"
            onClick={() => { setEditing(p); setFormOpen(true); }}>
            <MdEdit />
          </IconButton>
          <IconButton aria-label={t('common.delete')} size="sm" variant="ghost" colorPalette="red"
            onClick={() => setToDelete(p)}>
            <MdDelete />
          </IconButton>
        </HStack>
      ),
    });
  }

  return (
    <Box>
      <PageHeader
        title={t('packages.tabPackages')}
        action={
          canWrite ? (
            <Button colorPalette="brand" onClick={() => { setEditing(null); setFormOpen(true); }}>
              <MdAdd /> {t('packages.add')}
            </Button>
          ) : undefined
        }
      />
      <DataTable
        columns={columns}
        rows={data ?? []}
        getRowId={(p) => p.id}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchKeys={['name']}
        emptyMessage={t('packages.empty')}
      />
      <PackageFormDialog open={formOpen} pkg={editing} onClose={() => setFormOpen(false)} />
      <ConfirmDialog
        open={!!toDelete}
        title={t('packages.deleteTitle')}
        message={t('catalog.deleteMessage', { name: toDelete?.name ?? '' })}
        destructive
        loading={del.isPending}
        onConfirm={() => { if (toDelete) del.mutate(toDelete.id, { onSettled: () => setToDelete(null) }); }}
        onClose={() => setToDelete(null)}
      />
    </Box>
  );
}
