import { useState } from 'react';
import { Box, Button, HStack, IconButton } from '@chakra-ui/react';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { PageHeader, DataTable, ConfirmDialog, type Column } from '../../components';
import { useAuth } from '../../auth/AuthContext';
import { canManageSettings } from '../../utils/permissions';
import { useSystemSettings, useDeleteSystemSetting } from './api';
import SystemSettingFormDialog from './SystemSettingFormDialog';
import type { SystemSetting } from './types';

// Admin gained `show.system_settings` in the 2026-08-06 pull (docs/11 §4) — this tab is now
// visible to admin too, read-only. Write stays super_admin-only, gated the same way as every
// other section in this feature.
export default function SystemSettingsSection() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canWrite = user ? canManageSettings(user.role) : false;

  const { data, isLoading, error, refetch } = useSystemSettings();
  const del = useDeleteSystemSetting();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SystemSetting | null>(null);
  const [toDelete, setToDelete] = useState<SystemSetting | null>(null);

  const columns: Column<SystemSetting>[] = [
    { key: 'key', header: t('settings.key') },
    { key: 'value', header: t('settings.value') },
    { key: 'type', header: t('field.type'), render: (s) => t(`enums.systemSettingType.${s.type}`) },
    { key: 'description', header: t('field.description'), render: (s) => s.description ?? '—' },
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
        title={t('settings.systemSettings')}
        action={
          canWrite ? (
            <Button colorPalette="brand" onClick={() => { setEditing(null); setFormOpen(true); }}>
              <MdAdd /> {t('settings.addSystemSetting')}
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
        searchKeys={['key']}
        emptyMessage={t('settings.emptySystemSettings')}
      />
      <SystemSettingFormDialog open={formOpen} systemSetting={editing} onClose={() => setFormOpen(false)} />
      <ConfirmDialog
        open={!!toDelete}
        title={t('settings.deleteSystemSettingTitle')}
        message={t('catalog.deleteMessage', { name: toDelete?.key ?? '' })}
        destructive
        loading={del.isPending}
        onConfirm={() => { if (toDelete) del.mutate(toDelete.id, { onSettled: () => setToDelete(null) }); }}
        onClose={() => setToDelete(null)}
      />
    </Box>
  );
}
