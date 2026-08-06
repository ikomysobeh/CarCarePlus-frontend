import { useState } from 'react';
import { Box, Button, HStack, IconButton } from '@chakra-ui/react';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { PageHeader, DataTable, StatusChip, ConfirmDialog, type Column } from '../../components';
import { useAuth } from '../../auth/AuthContext';
import { useBranches, useDeleteBranch } from './api';
import BranchFormDialog from './BranchFormDialog';
import type { Branch } from './types';

// Branches CRUD (docs/10 §1). super_admin manages every branch; an admin may only ADD
// nothing and EDIT the one branch they manage (admin_id === their own id) — never add/delete.
export default function BranchesPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  const canAddOrDelete = isSuperAdmin;

  const { data, isLoading, error, refetch } = useBranches();
  const del = useDeleteBranch();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [toDelete, setToDelete] = useState<Branch | null>(null);

  const canEditRow = (b: Branch) => isSuperAdmin || b.admin_id === user?.id;

  const columns: Column<Branch>[] = [
    { key: 'name_ar', header: t('field.nameAr') },
    { key: 'city', header: t('branches.city') },
    { key: 'phone', header: t('admin.phone') },
    { key: 'manager', header: t('branches.manager'), render: (b) => b.manager?.name ?? `#${b.admin_id}` },
    {
      key: 'is_24h',
      header: t('branches.is24h'),
      render: (b) => <StatusChip status={b.is_24h ? 'active' : 'inactive'} label={b.is_24h ? t('common.yes') : t('common.no')} />,
    },
    {
      key: 'is_active',
      header: t('field.status'),
      render: (b) => <StatusChip status={b.is_active ? 'active' : 'inactive'} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (b) => (
        <HStack justify="flex-end" gap={1}>
          {canEditRow(b) && (
            <IconButton aria-label={t('common.edit')} size="sm" variant="ghost"
              onClick={() => { setEditing(b); setFormOpen(true); }}>
              <MdEdit />
            </IconButton>
          )}
          {canAddOrDelete && (
            <IconButton aria-label={t('common.delete')} size="sm" variant="ghost" colorPalette="red"
              onClick={() => setToDelete(b)}>
              <MdDelete />
            </IconButton>
          )}
        </HStack>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title={t('nav.branches')}
        action={
          canAddOrDelete ? (
            <Button colorPalette="brand" onClick={() => { setEditing(null); setFormOpen(true); }}>
              <MdAdd /> {t('branches.add')}
            </Button>
          ) : undefined
        }
      />
      <DataTable
        columns={columns}
        rows={data ?? []}
        getRowId={(b) => b.id}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchKeys={['name', 'name_ar', 'city']}
        emptyMessage={t('branches.empty')}
      />
      <BranchFormDialog open={formOpen} branch={editing} onClose={() => setFormOpen(false)} />
      <ConfirmDialog
        open={!!toDelete}
        title={t('branches.deleteTitle')}
        message={t('catalog.deleteMessage', { name: toDelete?.name_ar ?? '' })}
        destructive
        loading={del.isPending}
        onConfirm={() => { if (toDelete) del.mutate(toDelete.id, { onSettled: () => setToDelete(null) }); }}
        onClose={() => setToDelete(null)}
      />
    </Box>
  );
}
