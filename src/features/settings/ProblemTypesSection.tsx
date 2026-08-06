import { useState } from 'react';
import { Box, Button, HStack, IconButton } from '@chakra-ui/react';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { PageHeader, DataTable, StatusChip, ConfirmDialog, type Column } from '../../components';
import { useAuth } from '../../auth/AuthContext';
import { canManageSettings } from '../../utils/permissions';
import { useProblemTypes, useDeleteProblemType } from './api';
import ProblemTypeFormDialog from './ProblemTypeFormDialog';
import type { ProblemType } from './types';

export default function ProblemTypesSection() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canWrite = user ? canManageSettings(user.role) : false;

  const { data, isLoading, error, refetch } = useProblemTypes();
  const del = useDeleteProblemType();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProblemType | null>(null);
  const [toDelete, setToDelete] = useState<ProblemType | null>(null);

  const columns: Column<ProblemType>[] = [
    { key: 'name_ar', header: t('field.nameAr') },
    { key: 'name', header: t('field.name') },
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
        title={t('settings.problemTypes')}
        action={
          canWrite ? (
            <Button colorPalette="brand" onClick={() => { setEditing(null); setFormOpen(true); }}>
              <MdAdd /> {t('settings.addProblemType')}
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
        searchKeys={['name', 'name_ar']}
        emptyMessage={t('settings.emptyProblemTypes')}
      />
      <ProblemTypeFormDialog open={formOpen} problemType={editing} onClose={() => setFormOpen(false)} />
      <ConfirmDialog
        open={!!toDelete}
        title={t('settings.deleteProblemTypeTitle')}
        message={t('catalog.deleteMessage', { name: toDelete?.name_ar ?? '' })}
        destructive
        loading={del.isPending}
        onConfirm={() => { if (toDelete) del.mutate(toDelete.id, { onSettled: () => setToDelete(null) }); }}
        onClose={() => setToDelete(null)}
      />
    </Box>
  );
}
