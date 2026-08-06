import { useState } from 'react';
import { Box, Button, HStack, IconButton } from '@chakra-ui/react';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { PageHeader, DataTable, ConfirmDialog, type Column } from '../../components';
import { usePricingRuleTypes, useDeletePricingRuleType } from './api';
import PricingRuleTypeFormDialog from './PricingRuleTypeFormDialog';
import type { PricingRuleType } from './types';

export default function PricingRuleTypesSection() {
  const { t } = useTranslation();
  const { data, isLoading, error, refetch } = usePricingRuleTypes();
  const del = useDeletePricingRuleType();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PricingRuleType | null>(null);
  const [toDelete, setToDelete] = useState<PricingRuleType | null>(null);

  const columns: Column<PricingRuleType>[] = [
    { key: 'name_ar', header: t('field.nameAr') },
    { key: 'name', header: t('field.name') },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (rt) => (
        <HStack justify="flex-end" gap={1}>
          <IconButton aria-label={t('common.edit')} size="sm" variant="ghost"
            onClick={() => { setEditing(rt); setFormOpen(true); }}>
            <MdEdit />
          </IconButton>
          <IconButton aria-label={t('common.delete')} size="sm" variant="ghost" colorPalette="red"
            onClick={() => setToDelete(rt)}>
            <MdDelete />
          </IconButton>
        </HStack>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title={t('pricing.ruleTypes')}
        action={
          <Button colorPalette="brand" onClick={() => { setEditing(null); setFormOpen(true); }}>
            <MdAdd /> {t('pricing.addRuleType')}
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={data ?? []}
        getRowId={(rt) => rt.id}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchKeys={['name', 'name_ar']}
        emptyMessage={t('pricing.emptyRuleTypes')}
      />
      <PricingRuleTypeFormDialog open={formOpen} ruleType={editing} onClose={() => setFormOpen(false)} />
      <ConfirmDialog
        open={!!toDelete}
        title={t('pricing.deleteRuleTypeTitle')}
        message={t('catalog.deleteMessage', { name: toDelete?.name_ar ?? '' })}
        destructive
        loading={del.isPending}
        onConfirm={() => { if (toDelete) del.mutate(toDelete.id, { onSettled: () => setToDelete(null) }); }}
        onClose={() => setToDelete(null)}
      />
    </Box>
  );
}
