import { useState } from 'react';
import { Box, Button, HStack, IconButton } from '@chakra-ui/react';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { PageHeader, DataTable, StatusChip, ConfirmDialog, type Column } from '../../components';
import { useAuth } from '../../auth/AuthContext';
import { canManageSettings } from '../../utils/permissions';
import { useAiRules, useDeleteAiRule } from './api';
import AiRuleFormDialog from './AiRuleFormDialog';
import type { AiRule } from './types';

// Admin gained `show.ai_rules` in the 2026-08-06 pull (docs/11 §4) — this tab is now visible
// to admin too, read-only. Write stays super_admin-only. See SystemSettingsSection for the
// sibling tab with the same story.
export default function AiRulesSection() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canWrite = user ? canManageSettings(user.role) : false;

  const { data, isLoading, error, refetch } = useAiRules();
  const del = useDeleteAiRule();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AiRule | null>(null);
  const [toDelete, setToDelete] = useState<AiRule | null>(null);

  const columns: Column<AiRule>[] = [
    { key: 'name_ar', header: t('field.nameAr') },
    { key: 'name', header: t('field.name') },
    { key: 'type', header: t('field.type'), render: (r) => t(`enums.aiRuleType.${r.type}`) },
    { key: 'brand', header: t('catalog.carBrands'), render: (r) => r.brand?.name ?? '—' },
    { key: 'car_type', header: t('cars.carType'), render: (r) => (r.car_type ? t(`enums.carTypeSize.${r.car_type}`) : '—') },
    { key: 'fuel_type', header: t('cars.fuelType'), render: (r) => (r.fuel_type ? t(`enums.fuel.${r.fuel_type}`) : '—') },
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
        title={t('settings.aiRules')}
        action={
          canWrite ? (
            <Button colorPalette="brand" onClick={() => { setEditing(null); setFormOpen(true); }}>
              <MdAdd /> {t('settings.addAiRule')}
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
        searchKeys={['name', 'name_ar']}
        emptyMessage={t('settings.emptyAiRules')}
      />
      <AiRuleFormDialog open={formOpen} aiRule={editing} onClose={() => setFormOpen(false)} />
      <ConfirmDialog
        open={!!toDelete}
        title={t('settings.deleteAiRuleTitle')}
        message={t('catalog.deleteMessage', { name: toDelete?.name_ar ?? '' })}
        destructive
        loading={del.isPending}
        onConfirm={() => { if (toDelete) del.mutate(toDelete.id, { onSettled: () => setToDelete(null) }); }}
        onClose={() => setToDelete(null)}
      />
    </Box>
  );
}
