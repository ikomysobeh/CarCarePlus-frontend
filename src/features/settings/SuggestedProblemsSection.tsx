import { useState } from 'react';
import { Box, Button, HStack, IconButton } from '@chakra-ui/react';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { PageHeader, DataTable, ConfirmDialog, type Column } from '../../components';
import { useAuth } from '../../auth/AuthContext';
import { canManageSettings } from '../../utils/permissions';
import { useSuggestedProblems, useDeleteSuggestedProblem } from './api';
import SuggestedProblemFormDialog from './SuggestedProblemFormDialog';
import type { SuggestedProblem } from './types';

export default function SuggestedProblemsSection() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canWrite = user ? canManageSettings(user.role) : false;

  const { data, isLoading, error, refetch } = useSuggestedProblems();
  const del = useDeleteSuggestedProblem();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SuggestedProblem | null>(null);
  const [toDelete, setToDelete] = useState<SuggestedProblem | null>(null);

  const columns: Column<SuggestedProblem>[] = [
    { key: 'name_ar', header: t('field.nameAr') },
    { key: 'name', header: t('field.name') },
    { key: 'category', header: t('settings.category'), render: (p) => t(`enums.problemCategory.${p.category}`) },
    { key: 'description', header: t('field.description'), render: (p) => p.description ?? '—' },
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
        title={t('settings.suggestedProblems')}
        action={
          canWrite ? (
            <Button colorPalette="brand" onClick={() => { setEditing(null); setFormOpen(true); }}>
              <MdAdd /> {t('settings.addSuggestedProblem')}
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
        emptyMessage={t('settings.emptySuggestedProblems')}
      />
      <SuggestedProblemFormDialog open={formOpen} suggestedProblem={editing} onClose={() => setFormOpen(false)} />
      <ConfirmDialog
        open={!!toDelete}
        title={t('settings.deleteSuggestedProblemTitle')}
        message={t('catalog.deleteMessage', { name: toDelete?.name_ar ?? '' })}
        destructive
        loading={del.isPending}
        onConfirm={() => { if (toDelete) del.mutate(toDelete.id, { onSettled: () => setToDelete(null) }); }}
        onClose={() => setToDelete(null)}
      />
    </Box>
  );
}
