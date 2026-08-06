import { useState } from 'react';
import { Avatar, Box, Button, HStack, IconButton } from '@chakra-ui/react';
import { MdAdd, MdEdit, MdDelete, MdPauseCircle, MdPlayCircle } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { PageHeader, DataTable, StatusChip, ConfirmDialog, type Column } from '../../components';
import { useAdmins, useDeleteAdmin, useSetAdminActive } from './api';
import AdminFormDialog from './AdminFormDialog';
import type { Admin } from './types';

// Super-admin manages branch-admin accounts. See docs/09 — no branch_id field yet.
export default function AdminsPage() {
  const { t } = useTranslation();
  const { data, isLoading, error, refetch } = useAdmins();
  const del = useDeleteAdmin();
  const setActive = useSetAdminActive();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Admin | null>(null);
  const [toDelete, setToDelete] = useState<Admin | null>(null);
  const [toToggle, setToToggle] = useState<Admin | null>(null);

  const columns: Column<Admin>[] = [
    {
      key: 'image_url',
      header: '',
      render: (a) => (
        <Avatar.Root size="sm">
          <Avatar.Image src={a.image_url ?? undefined} />
          <Avatar.Fallback>{a.name?.[0] ?? '?'}</Avatar.Fallback>
        </Avatar.Root>
      ),
    },
    { key: 'name', header: t('field.name') },
    { key: 'email', header: t('auth.email') },
    { key: 'phone', header: t('admin.phone'), render: (a) => a.phone ?? '—' },
    {
      key: 'is_active',
      header: t('field.status'),
      render: (a) => <StatusChip status={a.is_active ? 'active' : 'inactive'} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (a) => (
        <HStack justify="flex-end" gap={1}>
          <IconButton
            aria-label={a.is_active ? t('admin.deactivate') : t('admin.activate')}
            size="sm"
            variant="ghost"
            colorPalette={a.is_active ? 'orange' : 'green'}
            onClick={() => setToToggle(a)}
          >
            {a.is_active ? <MdPauseCircle /> : <MdPlayCircle />}
          </IconButton>
          <IconButton aria-label={t('common.edit')} size="sm" variant="ghost"
            onClick={() => { setEditing(a); setFormOpen(true); }}>
            <MdEdit />
          </IconButton>
          <IconButton aria-label={t('common.delete')} size="sm" variant="ghost" colorPalette="red"
            onClick={() => setToDelete(a)}>
            <MdDelete />
          </IconButton>
        </HStack>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title={t('nav.admins')}
        subtitle={t('admin.adminsHint')}
        action={
          <Button colorPalette="brand" onClick={() => { setEditing(null); setFormOpen(true); }}>
            <MdAdd /> {t('admin.addAdmin')}
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={data ?? []}
        getRowId={(a) => a.id}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchKeys={['name', 'email']}
        emptyMessage={t('admin.emptyAdmins')}
      />
      <AdminFormDialog open={formOpen} admin={editing} onClose={() => setFormOpen(false)} />
      <ConfirmDialog
        open={!!toDelete}
        title={t('admin.deleteAdminTitle')}
        message={t('admin.deleteAdminMessage', { name: toDelete?.name ?? '' })}
        destructive
        loading={del.isPending}
        onConfirm={() => { if (toDelete) del.mutate(toDelete.id, { onSettled: () => setToDelete(null) }); }}
        onClose={() => setToDelete(null)}
      />
      <ConfirmDialog
        open={!!toToggle}
        title={toToggle?.is_active ? t('admin.deactivateTitle') : t('admin.activateTitle')}
        message={
          toToggle?.is_active
            ? t('admin.deactivateMessage', { name: toToggle?.name ?? '' })
            : t('admin.activateMessage', { name: toToggle?.name ?? '' })
        }
        confirmText={toToggle?.is_active ? t('admin.deactivate') : t('admin.activate')}
        destructive={!!toToggle?.is_active}
        loading={setActive.isPending}
        onConfirm={() => {
          if (toToggle) {
            setActive.mutate(
              { id: toToggle.id, active: !toToggle.is_active },
              { onSettled: () => setToToggle(null) },
            );
          }
        }}
        onClose={() => setToToggle(null)}
      />
    </Box>
  );
}
