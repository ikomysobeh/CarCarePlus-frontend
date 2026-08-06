import { useState } from 'react';
import { Box, Button, HStack, IconButton } from '@chakra-ui/react';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { PageHeader, DataTable, StatusChip, ConfirmDialog, type Column } from '../../components';
import { useAuth } from '../../auth/AuthContext';
import { canManageWorkshops } from '../../utils/permissions';
import { useWorkshops, useDeleteWorkshop } from './api';
import WorkshopFormDialog from './WorkshopFormDialog';
import type { Workshop } from './types';

// Workshops (see docs/10 §3). `admin` can view the list but is explicitly blocked from
// writing server-side (403 regardless of the `can:edit.workshop` gate) — so write buttons
// are super_admin-only here, same as canManageWorkshops encodes.
export default function WorkshopsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canWrite = user ? canManageWorkshops(user.role) : false;

  const { data, isLoading, error, refetch } = useWorkshops();
  const del = useDeleteWorkshop();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Workshop | null>(null);
  const [toDelete, setToDelete] = useState<Workshop | null>(null);

  const columns: Column<Workshop>[] = [
    { key: 'name_ar', header: t('field.nameAr') },
    { key: 'city', header: t('branches.city') },
    { key: 'status', header: t('field.status'), render: (w) => <StatusChip status={w.status} /> },
    { key: 'rating_avg', header: t('workshops.rating'), render: (w) => w.rating_avg ?? '—' },
    { key: 'owner', header: t('admin.owner'), render: (w) => w.owner?.email ?? '—' },
  ];

  if (canWrite) {
    columns.push({
      key: 'actions',
      header: '',
      align: 'right',
      render: (w) => (
        <HStack justify="flex-end" gap={1}>
          <IconButton aria-label={t('common.edit')} size="sm" variant="ghost"
            onClick={() => { setEditing(w); setFormOpen(true); }}>
            <MdEdit />
          </IconButton>
          <IconButton aria-label={t('common.delete')} size="sm" variant="ghost" colorPalette="red"
            onClick={() => setToDelete(w)}>
            <MdDelete />
          </IconButton>
        </HStack>
      ),
    });
  }

  return (
    <Box>
      <PageHeader
        title={t('nav.workshops')}
        action={
          canWrite ? (
            <Button colorPalette="brand" onClick={() => { setEditing(null); setFormOpen(true); }}>
              <MdAdd /> {t('workshops.add')}
            </Button>
          ) : undefined
        }
      />
      <DataTable
        columns={columns}
        rows={data ?? []}
        getRowId={(w) => w.id}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchKeys={['name', 'name_ar', 'city']}
        emptyMessage={t('workshops.empty')}
      />
      <WorkshopFormDialog open={formOpen} workshop={editing} onClose={() => setFormOpen(false)} />
      <ConfirmDialog
        open={!!toDelete}
        title={t('workshops.deleteTitle')}
        message={t('catalog.deleteMessage', { name: toDelete?.name_ar ?? '' })}
        destructive
        loading={del.isPending}
        onConfirm={() => { if (toDelete) del.mutate(toDelete.id, { onSettled: () => setToDelete(null) }); }}
        onClose={() => setToDelete(null)}
      />
    </Box>
  );
}
